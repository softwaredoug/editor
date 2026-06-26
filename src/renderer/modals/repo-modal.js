import { BaseModal } from "./base-modal.js";

export class RepoModal {
  constructor({
    mountEl,
    window,
    fileService,
    getRepoStatus,
    setRepoStatus,
    getActiveDirectory
  }) {
    this.base = new BaseModal({
      mountEl,
      window,
      templateUrl: new URL("./repo-modal.html?raw", import.meta.url)
    });
    this.window = window;
    this.fileService = fileService;
    this.getRepoStatus = getRepoStatus;
    this.setRepoStatus = setRepoStatus;
    this.getActiveDirectory = getActiveDirectory;
    this.statusSummary = null;
    this.statusDetails = null;
    this.errorLabel = null;
    this.closeButton = null;
    this.syncButton = null;
    this._bound = false;
  }

  async open() {
    await this.ensureReady();
    await this.base.open();
    this.renderStatus(this.getRepoStatus());
  }

  close() {
    this.base.close();
    this.setError("");
  }

  setStatus({ summary, details }) {
    this.statusSummary.textContent = summary ?? "";
    this.statusDetails.textContent = details ?? "";
  }

  isOpen() {
    return this.base.isOpen();
  }

  isReady() {
    return this.base.isReady();
  }

  async ensureReady() {
    if (this._bound) {
      return;
    }
    await this.base.ensureReady();
    this.statusSummary = this.base.query("#repo-status-summary");
    this.statusDetails = this.base.query("#repo-status-details");
    this.errorLabel = this.base.query("#repo-status-error");
    this.closeButton = this.base.query("#repo-close");
    this.syncButton = this.base.query("#repo-sync");

    this.closeButton.addEventListener("click", () => this.close());
    this.syncButton.addEventListener("click", () => this.handleSync());

    this._bound = true;
  }

  setError(message) {
    this.errorLabel.textContent = message ?? "";
  }

  setSyncing(isSyncing) {
    this.syncButton.disabled = Boolean(isSyncing);
    this.syncButton.textContent = isSyncing ? "Syncing..." : "Sync with origin";
  }

  setSyncDisabled(disabled) {
    this.syncButton.disabled = Boolean(disabled);
  }

  renderStatus(repoStatus) {
    if (!repoStatus?.available) {
      this.setStatus({ summary: "No git repository detected.", details: "" });
      this.setSyncDisabled(true);
      return;
    }

    const statusLine = repoStatus.statusSummary || "";
    const upstreamText = repoStatus.upstream || "No upstream configured";
    const syncLine = repoStatus.upstream
      ? `Ahead ${repoStatus.ahead}, behind ${repoStatus.behind}`
      : "Upstream not set";
    const cleanLine = repoStatus.dirty ? "Working tree: dirty" : "Working tree: clean";
    const fetchLine = repoStatus.fetchError ? `Fetch: ${repoStatus.fetchError}` : "Fetch: ok";

    this.setStatus({
      summary: statusLine,
      details: [
        `Branch: ${repoStatus.branch || "unknown"}`,
        `Upstream: ${upstreamText}`,
        syncLine,
        cleanLine,
        fetchLine
      ].join("\n")
    });

    this.setSyncDisabled(!repoStatus.upstream);
  }

  async handleSync() {
    const repoStatus = this.getRepoStatus();
    if (!repoStatus?.available) {
      return;
    }
    const activeDirectory = this.getActiveDirectory();
    if (!activeDirectory) {
      return;
    }
    this.setError("");
    this.setSyncing(true);
    const result = await this.fileService.syncWithOrigin(activeDirectory);
    this.setSyncing(false);
    if (result?.error) {
      this.setError(result.error);
      return;
    }
    this.setRepoStatus(result);
    this.renderStatus(result);
  }
}

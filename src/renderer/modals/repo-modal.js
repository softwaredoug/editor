export class RepoModal {
  constructor({
    modal,
    statusSummary,
    statusDetails,
    errorLabel,
    closeButton,
    syncButton,
    onSync
  }) {
    this.modal = modal;
    this.statusSummary = statusSummary;
    this.statusDetails = statusDetails;
    this.errorLabel = errorLabel;
    this.closeButton = closeButton;
    this.syncButton = syncButton;
    this.onSync = onSync;
    this.bindEvents();
  }

  bindEvents() {
    this.closeButton.addEventListener("click", () => this.close());
    this.syncButton.addEventListener("click", () => this.onSync());
    this.modal.addEventListener("click", (event) => {
      if (event.target.classList.contains("modal-backdrop")) {
        this.close();
      }
    });
  }

  open() {
    this.modal.classList.remove("hidden");
    this.modal.setAttribute("aria-hidden", "false");
  }

  close() {
    this.modal.classList.add("hidden");
    this.modal.setAttribute("aria-hidden", "true");
    this.setError("");
  }

  isOpen() {
    return !this.modal.classList.contains("hidden");
  }

  setStatus({ summary, details }) {
    this.statusSummary.textContent = summary ?? "";
    this.statusDetails.textContent = details ?? "";
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
}

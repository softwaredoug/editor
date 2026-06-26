import { BaseModal } from "./base-modal.js";

export class DeleteModal {
  constructor({ mountEl, window, onConfirm }) {
    this.base = new BaseModal({
      mountEl,
      window,
      templateUrl: new URL("./delete-modal.html?raw", import.meta.url)
    });
    this.onConfirm = onConfirm;
    this.fileNameLabel = null;
    this.gitFields = null;
    this.summaryInput = null;
    this.detailsInput = null;
    this.errorLabel = null;
    this.cancelButton = null;
    this.confirmButton = null;
    this.targetPath = null;
    this.requiresCommit = false;
    this.summaryAuto = false;
    this._bound = false;
  }

  async open({ path, requiresCommit, summary }) {
    await this.ensureReady();
    await this.base.open();
    this.targetPath = path;
    this.requiresCommit = Boolean(requiresCommit);
    this.summaryAuto = this.requiresCommit;
    this.gitFields.classList.toggle("hidden", !this.requiresCommit);
    this.fileNameLabel.textContent = path
      ? `Delete ${path.split("/").pop()}`
      : "Delete file";
    this.summaryInput.value = this.requiresCommit ? summary ?? "" : "";
    this.detailsInput.value = "";
    this.setError("");
    if (this.requiresCommit) {
      this.summaryInput.focus();
    } else {
      this.confirmButton.focus();
    }
  }

  close() {
    this.base.close();
    this.targetPath = null;
    this.requiresCommit = false;
    this.summaryAuto = false;
    this.setError("");
  }

  isOpen() {
    return this.base.isOpen();
  }

  setError(message) {
    this.errorLabel.textContent = message ?? "";
  }

  async ensureReady() {
    if (this._bound) {
      return;
    }
    await this.base.ensureReady();
    this.fileNameLabel = this.base.query("#delete-file-name");
    this.gitFields = this.base.query("#delete-git-fields");
    this.summaryInput = this.base.query("#delete-summary");
    this.detailsInput = this.base.query("#delete-details");
    this.errorLabel = this.base.query("#delete-error");
    this.cancelButton = this.base.query("#delete-cancel");
    this.confirmButton = this.base.query("#delete-confirm");

    this.cancelButton.addEventListener("click", () => this.close());
    this.confirmButton.addEventListener("click", () => this.handleConfirm());
    this.summaryInput.addEventListener("input", () => {
      if (!this.requiresCommit) {
        return;
      }
      this.summaryAuto = false;
    });

    this._bound = true;
  }

  async handleConfirm() {
    if (!this.targetPath) {
      this.setError("No file selected.");
      return;
    }
    if (!window.confirm("Delete this file?")) {
      return;
    }
    const summary = this.summaryInput.value.trim();
    const details = this.detailsInput.value.trim();
    if (this.requiresCommit && !summary) {
      this.setError("Commit summary is required.");
      return;
    }
    this.setError("");
    await this.onConfirm({
      filePath: this.targetPath,
      messageShort: summary,
      messageLong: details
    });
  }
}

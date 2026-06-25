export class DeleteModal {
  constructor({
    modal,
    fileNameLabel,
    gitFields,
    summaryInput,
    detailsInput,
    errorLabel,
    cancelButton,
    confirmButton,
    onConfirm
  }) {
    this.modal = modal;
    this.fileNameLabel = fileNameLabel;
    this.gitFields = gitFields;
    this.summaryInput = summaryInput;
    this.detailsInput = detailsInput;
    this.errorLabel = errorLabel;
    this.cancelButton = cancelButton;
    this.confirmButton = confirmButton;
    this.onConfirm = onConfirm;
    this.targetPath = null;
    this.requiresCommit = false;
    this.summaryAuto = false;
    this.bindEvents();
  }

  bindEvents() {
    this.cancelButton.addEventListener("click", () => this.close());
    this.confirmButton.addEventListener("click", () => this.handleConfirm());
    this.modal.addEventListener("click", (event) => {
      if (event.target.classList.contains("modal-backdrop")) {
        this.close();
      }
    });
    this.summaryInput.addEventListener("input", () => {
      if (!this.requiresCommit) {
        return;
      }
      this.summaryAuto = false;
    });
  }

  open({ path, requiresCommit, summary }) {
    this.targetPath = path;
    this.requiresCommit = Boolean(requiresCommit);
    this.summaryAuto = this.requiresCommit;
    this.gitFields.classList.toggle("hidden", !this.requiresCommit);
    this.modal.classList.remove("hidden");
    this.modal.setAttribute("aria-hidden", "false");
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
    this.modal.classList.add("hidden");
    this.modal.setAttribute("aria-hidden", "true");
    this.targetPath = null;
    this.requiresCommit = false;
    this.summaryAuto = false;
    this.setError("");
  }

  isOpen() {
    return !this.modal.classList.contains("hidden");
  }

  setError(message) {
    this.errorLabel.textContent = message ?? "";
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

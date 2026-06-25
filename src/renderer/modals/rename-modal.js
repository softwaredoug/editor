export class RenameModal {
  constructor({
    modal,
    nameInput,
    gitFields,
    summaryInput,
    detailsInput,
    errorLabel,
    cancelButton,
    confirmButton,
    deleteButton,
    buildSummary,
    onConfirm,
    onDelete
  }) {
    this.modal = modal;
    this.nameInput = nameInput;
    this.gitFields = gitFields;
    this.summaryInput = summaryInput;
    this.detailsInput = detailsInput;
    this.errorLabel = errorLabel;
    this.cancelButton = cancelButton;
    this.confirmButton = confirmButton;
    this.deleteButton = deleteButton;
    this.buildSummary = buildSummary;
    this.onConfirm = onConfirm;
    this.onDelete = onDelete;
    this.targetPath = null;
    this.requiresCommit = false;
    this.summaryAuto = false;
    this.bindEvents();
  }

  bindEvents() {
    this.cancelButton.addEventListener("click", () => this.close());
    this.confirmButton.addEventListener("click", () => this.handleConfirm());
    this.deleteButton.addEventListener("click", () => this.handleDelete());
    this.modal.addEventListener("click", (event) => {
      if (event.target.classList.contains("modal-backdrop")) {
        this.close();
      }
    });
    this.nameInput.addEventListener("input", () => {
      if (!this.requiresCommit) {
        return;
      }
      if (!this.summaryAuto) {
        return;
      }
      this.summaryInput.value = this.buildSummary(this.targetPath, this.nameInput.value.trim());
    });
    this.summaryInput.addEventListener("input", () => {
      if (!this.requiresCommit) {
        return;
      }
      this.summaryAuto = false;
    });
  }

  open({ path, requiresCommit }) {
    this.targetPath = path;
    this.requiresCommit = Boolean(requiresCommit);
    this.gitFields.classList.toggle("hidden", !this.requiresCommit);
    this.modal.classList.remove("hidden");
    this.modal.setAttribute("aria-hidden", "false");
    this.nameInput.value = path?.split("/").pop() ?? "";
    this.summaryInput.value = this.requiresCommit
      ? this.buildSummary(path, this.nameInput.value)
      : "";
    this.summaryAuto = this.requiresCommit;
    this.detailsInput.value = "";
    this.setError("");
    this.nameInput.focus();
    this.nameInput.select();
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
    const newName = this.nameInput.value.trim();
    if (!newName) {
      this.setError("New filename is required.");
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
      oldPath: this.targetPath,
      newName,
      summary,
      details,
      requiresCommit: this.requiresCommit
    });
  }

  handleDelete() {
    if (!this.targetPath) {
      this.setError("No file selected.");
      return;
    }
    this.onDelete(this.targetPath);
  }
}

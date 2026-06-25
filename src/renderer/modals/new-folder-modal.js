export class NewFolderModal {
  constructor({
    modal,
    nameInput,
    errorLabel,
    cancelButton,
    confirmButton,
    onConfirm
  }) {
    this.modal = modal;
    this.nameInput = nameInput;
    this.errorLabel = errorLabel;
    this.cancelButton = cancelButton;
    this.confirmButton = confirmButton;
    this.onConfirm = onConfirm;
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
  }

  open() {
    this.modal.classList.remove("hidden");
    this.modal.setAttribute("aria-hidden", "false");
    this.nameInput.value = "";
    this.setError("");
    this.nameInput.focus();
  }

  close() {
    this.modal.classList.add("hidden");
    this.modal.setAttribute("aria-hidden", "true");
    this.nameInput.value = "";
    this.setError("");
  }

  isOpen() {
    return !this.modal.classList.contains("hidden");
  }

  setError(message) {
    this.errorLabel.textContent = message ?? "";
  }

  async handleConfirm() {
    const name = this.nameInput.value.trim();
    if (!name) {
      this.setError("Folder name is required.");
      return;
    }
    this.setError("");
    await this.onConfirm({ name });
  }
}

export class CommitModal {
  constructor({
    modal,
    summaryInput,
    detailsInput,
    errorLabel,
    cancelButton,
    confirmButton,
    onConfirm
  }) {
    this.modal = modal;
    this.summaryInput = summaryInput;
    this.detailsInput = detailsInput;
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
    this.setError("");
    this.summaryInput.focus();
  }

  close() {
    this.modal.classList.add("hidden");
    this.modal.setAttribute("aria-hidden", "true");
    this.setError("");
  }

  isOpen() {
    return !this.modal.classList.contains("hidden");
  }

  setError(message) {
    this.errorLabel.textContent = message ?? "";
  }

  async handleConfirm() {
    const summary = this.summaryInput.value.trim();
    const details = this.detailsInput.value.trim();
    if (!summary) {
      this.setError("Summary is required.");
      return;
    }
    this.setError("");
    await this.onConfirm({ summary, details });
  }

  confirm() {
    return this.handleConfirm();
  }
}

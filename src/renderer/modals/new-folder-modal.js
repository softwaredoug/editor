import { BaseModal } from "./base-modal.js";

export class NewFolderModal {
  constructor({ mountEl, window, onConfirm }) {
    this.base = new BaseModal({
      mountEl,
      window,
      templateUrl: new URL("./new-folder-modal.html?raw", import.meta.url)
    });
    this.onConfirm = onConfirm;
    this.nameInput = null;
    this.errorLabel = null;
    this.cancelButton = null;
    this.confirmButton = null;
    this._bound = false;
  }

  async open() {
    await this.ensureReady();
    await this.base.open();
    this.nameInput.value = "";
    this.setError("");
    this.nameInput.focus();
  }

  close() {
    this.base.close();
    this.nameInput.value = "";
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
    this.nameInput = this.base.query("#new-folder-name");
    this.errorLabel = this.base.query("#new-folder-error");
    this.cancelButton = this.base.query("#new-folder-cancel");
    this.confirmButton = this.base.query("#new-folder-confirm");

    this.cancelButton.addEventListener("click", () => this.close());
    this.confirmButton.addEventListener("click", () => this.handleConfirm());

    this._bound = true;
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

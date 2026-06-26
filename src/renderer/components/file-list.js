import { BaseComponent } from "../modals/base-component.js";
import { NewFolderModal } from "../modals/new-folder-modal.js";

export class FileList {
  constructor({
    mountEl,
    onFileDoubleClick,
    onStatus,
    fileService,
    modalMount,
    window,
    onFileOpen,
    onRefresh
  }) {
    this.base = new BaseComponent({
      mountEl,
      templateUrl: new URL("./file-list.html?raw", import.meta.url)
    });
    this.document = mountEl?.ownerDocument ?? document;
    this.onFileDoubleClick = onFileDoubleClick ?? (() => {});
    this.onStatus = onStatus ?? (() => {});
    this.fileService = fileService;
    this.onFileOpen = onFileOpen ?? (() => {});
    this.onRefresh = onRefresh ?? (() => {});
    this.modalMount = modalMount;
    this.window = window;
    this.files = [];
    this.activeDirectory = null;
    this.activeFilePath = null;
    this.tooMany = false;
    this.newFolderModal = null;
    this.listEl = null;
    this.newFileButton = null;
    this.newFolderButton = null;
    this._bound = false;
  }

  async ensureReady() {
    await this.base.ensureReady();
    if (this._bound) {
      return;
    }
    this.listEl = this.base.query(".files-list");
    this.newFileButton = this.base.query(".new-file-button");
    this.newFolderButton = this.base.query(".new-folder-button");
    this.newFolderModal = new NewFolderModal({
      mountEl: this.modalMount,
      window: this.window,
      onConfirm: ({ name }) => this.handleNewFolderConfirm({ name })
    });
    this.newFileButton?.addEventListener("click", () => this.handleNewFileClick());
    this.newFolderButton?.addEventListener("click", () => this.handleNewFolderClick());
    this._bound = true;
    this.render();
  }

  setFiles({ files, activeDirectory, tooMany }) {
    this.files = files ?? [];
    this.activeDirectory = activeDirectory ?? null;
    this.tooMany = Boolean(tooMany);
    if (this.listEl) {
      this.render();
    } else {
      void this.ensureReady();
    }
  }

  setActiveFilePath(path) {
    this.activeFilePath = path ?? null;
    if (this.listEl) {
      this.highlightActiveFile();
    } else {
      void this.ensureReady();
    }
  }

  render() {
    if (!this.listEl) {
      return;
    }
    this.listEl.innerHTML = "";

    if (!this.files.length) {
      const empty = this.document.createElement("div");
      empty.className = "files-empty";
      empty.textContent = this.activeDirectory
        ? "No markdown files found"
        : "Select a folder to begin";
      this.listEl.appendChild(empty);
      return;
    }

    this.files.forEach((file) => {
      const item = this.document.createElement("div");
      item.className = "file-item";
      item.textContent = file.relativePath;
      item.dataset.path = file.path;
      item.addEventListener("dblclick", () => this.onFileDoubleClick(file.path));
      this.listEl.appendChild(item);
    });

    if (this.tooMany) {
      const warning = this.document.createElement("div");
      warning.className = "files-warning";
      warning.textContent = "⚠️ Too many files to list. Showing first 1000.";
      this.listEl.appendChild(warning);
    }

    this.highlightActiveFile();
  }

  highlightActiveFile() {
    if (!this.listEl) {
      return;
    }
    const items = Array.from(this.listEl.querySelectorAll(".file-item"));
    items.forEach((item) => {
      if (item.dataset.path === this.activeFilePath) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  async handleNewFileClick() {
    if (!this.activeDirectory) {
      this.onStatus("Select a folder to add a file.");
      return;
    }
    const result = await this.fileService.createNewFile(this.activeDirectory);
    if (result?.error) {
      this.onStatus(result.error);
      return;
    }
    if (result?.path) {
      await this.onFileOpen(result.path);
    }
    await this.onRefresh();
  }

  async handleNewFolderClick() {
    if (!this.activeDirectory) {
      this.onStatus("Select a folder to add a new folder.");
      return;
    }
    await this.newFolderModal?.open();
  }

  async handleNewFolderConfirm({ name }) {
    if (!this.activeDirectory) {
      this.newFolderModal?.setError("Select a folder to create a subfolder.");
      return;
    }
    const result = await this.fileService.createFolder({
      directory: this.activeDirectory,
      name
    });
    if (result?.error) {
      this.newFolderModal?.setError(result.error);
      this.onStatus(result.error);
      return;
    }
    this.newFolderModal?.close();
    this.onStatus(`Folder created: ${name}`);
    setTimeout(() => this.onStatus(""), 1500);
    await this.onRefresh();
  }
}

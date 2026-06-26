export class FileList {
  constructor({ mountEl, onFileDoubleClick, onStatus }) {
    this.mountEl = mountEl;
    this.document = mountEl?.ownerDocument ?? document;
    this.onFileDoubleClick = onFileDoubleClick ?? (() => {});
    this.onStatus = onStatus ?? (() => {});
    this.files = [];
    this.activeDirectory = null;
    this.activeFilePath = null;
    this.tooMany = false;
  }

  setFiles({ files, activeDirectory, tooMany }) {
    this.files = files ?? [];
    this.activeDirectory = activeDirectory ?? null;
    this.tooMany = Boolean(tooMany);
    this.render();
  }

  setActiveFilePath(path) {
    this.activeFilePath = path ?? null;
    this.highlightActiveFile();
  }

  render() {
    this.mountEl.innerHTML = "";

    if (!this.files.length) {
      const empty = this.document.createElement("div");
      empty.className = "files-empty";
      empty.textContent = this.activeDirectory
        ? "No markdown files found"
        : "Select a folder to begin";
      this.mountEl.appendChild(empty);
      return;
    }

    this.files.forEach((file) => {
      const item = this.document.createElement("div");
      item.className = "file-item";
      item.textContent = file.relativePath;
      item.dataset.path = file.path;
      item.addEventListener("dblclick", () => this.onFileDoubleClick(file.path));
      this.mountEl.appendChild(item);
    });

    if (this.tooMany) {
      const warning = this.document.createElement("div");
      warning.className = "files-warning";
      warning.textContent = "⚠️ Too many files to list. Showing first 1000.";
      this.mountEl.appendChild(warning);
    }

    this.highlightActiveFile();
  }

  highlightActiveFile() {
    const items = Array.from(this.mountEl.querySelectorAll(".file-item"));
    items.forEach((item) => {
      if (item.dataset.path === this.activeFilePath) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }
}

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { FileList } from "../../src/renderer/components/file-list.js";

describe("FileList", () => {
  it("renders items and handles double-click", () => {
    const dom = new JSDOM("<!doctype html><html><body><div id=\"files\"></div></body></html>");
    const { document } = dom.window;
    const mountEl = document.getElementById("files");

    let opened = null;
    const fileList = new FileList({
      mountEl,
      onFileDoubleClick: (path) => {
        opened = path;
      }
    });

    fileList.setFiles({
      activeDirectory: "/tmp",
      files: [
        { path: "/tmp/a.md", relativePath: "a.md" },
        { path: "/tmp/b.md", relativePath: "b.md" }
      ]
    });
    fileList.setActiveFilePath("/tmp/b.md");

    const items = mountEl.querySelectorAll(".file-item");
    assert.equal(items.length, 2);
    assert.ok(items[1].classList.contains("active"));

    items[0].dispatchEvent(new dom.window.MouseEvent("dblclick", { bubbles: true }));
    assert.equal(opened, "/tmp/a.md");
  });

  it("shows empty copy based on directory state", () => {
    const dom = new JSDOM("<!doctype html><html><body><div id=\"files\"></div></body></html>");
    const { document } = dom.window;
    const mountEl = document.getElementById("files");

    const fileList = new FileList({ mountEl });
    fileList.setFiles({ activeDirectory: null, files: [] });

    assert.equal(mountEl.textContent.trim(), "Select a folder to begin");
  });

  it("shows a warning when too many files are listed", () => {
    const dom = new JSDOM("<!doctype html><html><body><div id=\"files\"></div></body></html>");
    const { document } = dom.window;
    const mountEl = document.getElementById("files");

    const fileList = new FileList({ mountEl });
    fileList.setFiles({
      activeDirectory: "/tmp",
      files: [{ path: "/tmp/a.md", relativePath: "a.md" }],
      tooMany: true
    });

    const warning = mountEl.querySelector(".files-warning");
    assert.ok(warning);
    assert.match(warning.textContent, /Too many files to list/);
    assert.match(warning.textContent, /⚠️/);
  });
});

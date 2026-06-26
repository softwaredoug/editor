import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { FileList } from "../../src/renderer/components/file-list.js";

describe("FileList", () => {
  it("renders items and handles double-click", () => {
    const dom = new JSDOM("<!doctype html><html><body><div id=\"files\"></div></body></html>", {
      url: "http://localhost/"
    });
    const { document } = dom.window;
    const mountEl = document.getElementById("files");

    const htmlPath = fileURLToPath(
      new URL("../../src/renderer/components/file-list.html", import.meta.url)
    );
    return fs.readFile(htmlPath, "utf8").then((html) => {
      global.fetch = async () => ({
        ok: true,
        status: 200,
        async text() {
          return html;
        }
      });

      let opened = null;
      const fileList = new FileList({
        mountEl,
        fileService: {},
        modalMount: document.body,
        window: dom.window,
        onFileOpen: (path) => {
          opened = path;
        }
      });

      return fileList.ensureReady().then(() => {
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
    });
  });

  it("shows empty copy based on directory state", () => {
    const dom = new JSDOM("<!doctype html><html><body><div id=\"files\"></div></body></html>", {
      url: "http://localhost/"
    });
    const { document } = dom.window;
    const mountEl = document.getElementById("files");

    const htmlPath = fileURLToPath(
      new URL("../../src/renderer/components/file-list.html", import.meta.url)
    );
    return fs.readFile(htmlPath, "utf8").then((html) => {
      global.fetch = async () => ({
        ok: true,
        status: 200,
        async text() {
          return html;
        }
      });

      const fileList = new FileList({
        mountEl,
        fileService: {},
        modalMount: document.body,
        window: dom.window
      });
      return fileList.ensureReady().then(() => {
        fileList.setFiles({ activeDirectory: null, files: [] });
        const listEl = mountEl.querySelector(".files-list");
        assert.equal(listEl.textContent.trim(), "Select a folder to begin");
      });
    });
  });

  it("shows a warning when too many files are listed", () => {
    const dom = new JSDOM("<!doctype html><html><body><div id=\"files\"></div></body></html>", {
      url: "http://localhost/"
    });
    const { document } = dom.window;
    const mountEl = document.getElementById("files");

    const htmlPath = fileURLToPath(
      new URL("../../src/renderer/components/file-list.html", import.meta.url)
    );
    return fs.readFile(htmlPath, "utf8").then((html) => {
      global.fetch = async () => ({
        ok: true,
        status: 200,
        async text() {
          return html;
        }
      });

      const fileList = new FileList({
        mountEl,
        fileService: {},
        modalMount: document.body,
        window: dom.window
      });
      return fileList.ensureReady().then(() => {
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
  });
});

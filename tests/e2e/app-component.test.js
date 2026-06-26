import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { AppComponent } from "../../src/renderer/components/app-component.js";
import { createFileServiceMock, createCorrectionsServiceMock, createEditorMock } from "../helpers/service-mocks.js";
import { loadRendererTemplates, createTemplateFetch } from "../helpers/template-mocks.js";

describe("AppComponent (e2e)", () => {
  it("renders file list after selecting a directory", async () => {
    const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", {
      url: "http://localhost/"
    });
    const { document } = dom.window;
    global.window = dom.window;
    global.document = document;

    const templates = await loadRendererTemplates();
    global.fetch = createTemplateFetch(templates);

    const fileService = createFileServiceMock({
      async selectDirectory() {
        return { path: "/tmp/posts" };
      },
      async listTextFiles() {
        return {
          files: [
            { path: "/tmp/posts/a.md", relativePath: "a.md" },
            { path: "/tmp/posts/b.md", relativePath: "b.md" }
          ],
          tooMany: false
        };
      }
    });

    const correctionsService = createCorrectionsServiceMock();
    const createEditorFn = () => createEditorMock();

    const app = new AppComponent({
      mountEl: document.getElementById("root"),
      window: dom.window,
      fileService,
      correctionsService,
      createEditorFn
    });

    await app.init();

    const selectButton = document.querySelector(".select-directory-button");
    selectButton.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const items = Array.from(document.querySelectorAll(".file-item"));
    assert.equal(items.length, 2);
    assert.equal(items[0].textContent, "a.md");
    assert.equal(items[1].textContent, "b.md");
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { BaseModal } from "../../src/renderer/modals/base-modal.js";

function createDom() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/"
  });
  return dom;
}

describe("BaseModal", () => {
  it("opens, closes, and reacts to backdrop/Escape", async () => {
    const dom = createDom();
    const { window } = dom;
    const { document } = window;
    const html = [
      '<div class="modal hidden" aria-hidden="true">',
      '  <div class="modal-backdrop"></div>',
      '  <div class="modal-card"><button id="ok-btn">OK</button></div>',
      "</div>"
    ].join("\n");

    const fetchCalls = [];
    global.fetch = async (url) => {
      fetchCalls.push(url);
      return {
        ok: true,
        status: 200,
        async text() {
          return html;
        }
      };
    };

    const modal = new BaseModal({
      mountEl: document.body,
      window,
      templateUrl: new URL("/modal.html", window.location.href)
    });

    await modal.open();
    const modalEl = document.querySelector(".modal");
    assert.ok(modalEl, "modal element exists");
    assert.ok(!modalEl.classList.contains("hidden"), "modal is visible");
    assert.equal(modalEl.getAttribute("aria-hidden"), "false");
    assert.equal(fetchCalls.length, 1);

    window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape" }));
    assert.ok(modalEl.classList.contains("hidden"), "modal hides on Escape");
    assert.equal(modalEl.getAttribute("aria-hidden"), "true");

    await modal.open();
    const backdrop = modalEl.querySelector(".modal-backdrop");
    backdrop.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    assert.ok(modalEl.classList.contains("hidden"), "modal hides on backdrop click");
  });
});

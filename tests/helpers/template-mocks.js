import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rendererRoot = fileURLToPath(new URL("../../src/renderer/", import.meta.url));

async function loadTemplateDir(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const templates = new Map();
  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    if (!entry.name.endsWith(".html")) {
      continue;
    }
    const fullPath = path.join(dirPath, entry.name);
    const html = await fs.readFile(fullPath, "utf8");
    templates.set(entry.name, html);
  }
  return templates;
}

export async function loadRendererTemplates() {
  const componentsDir = path.join(rendererRoot, "components");
  const modalsDir = path.join(rendererRoot, "modals");
  const templates = new Map();
  for (const [name, html] of await loadTemplateDir(componentsDir)) {
    templates.set(name, html);
  }
  for (const [name, html] of await loadTemplateDir(modalsDir)) {
    templates.set(name, html);
  }
  return templates;
}

export function createTemplateFetch(templates) {
  return async (url) => {
    const key = typeof url === "string" ? url : url?.href;
    const match = Array.from(templates.keys()).find((name) => key?.includes(name));
    if (!match) {
      return {
        ok: false,
        status: 404,
        async text() {
          return "";
        }
      };
    }
    return {
      ok: true,
      status: 200,
      async text() {
        return templates.get(match);
      }
    };
  };
}

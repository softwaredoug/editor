import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createNewFile, deleteFile } from "../../src/main/file-ops.js";

const execFileAsync = promisify(execFile);

async function runGit(args, cwd) {
  return execFileAsync("git", args, { cwd });
}

describe("file operations with git", () => {
  it("creates a new file, stages it, and deletes with commit", async () => {
    const tmpDir = await mkdtemp(path.join(os.tmpdir(), "editor-file-ops-"));
    try {
      await runGit(["init"], tmpDir);
      await runGit(["config", "user.email", "test@example.com"], tmpDir);
      await runGit(["config", "user.name", "Test User"], tmpDir);

      const date = new Date("2026-06-23T10:00:00");
      const created = await createNewFile(tmpDir, { date });
      assert.ok(created.path, "new file path returned");

      const statusAfterCreate = (await runGit(["status", "--porcelain"], tmpDir)).stdout.trim();
      assert.match(statusAfterCreate, /^A\s+/m);

      await runGit(["commit", "-m", "Initial add"], tmpDir);

      const deleteResult = await deleteFile({
        filePath: created.path,
        messageShort: "Deleted file test",
        messageLong: ""
      });
      assert.equal(deleteResult.error, undefined);

      const statusAfterDelete = (await runGit(["status", "--porcelain"], tmpDir)).stdout.trim();
      assert.equal(statusAfterDelete, "");

      const log = (await runGit(["log", "--oneline", "-1"], tmpDir)).stdout.trim();
      assert.match(log, /Deleted file test/);
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });
});

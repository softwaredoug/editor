import "./styles.css";
import { createEditor } from "./editor.js";
import { checkSpelling } from "./services/spell.js";
import { checkGrammar } from "./services/grammar.js";
import { analyzeWithLlm } from "./services/llm.js";

const selectDirectoryButton = document.getElementById("select-directory-button");
const analyzeButton = document.getElementById("analyze-button");
const activeDirectoryInput = document.getElementById("active-directory");
const directoryErrorLabel = document.getElementById("directory-error");
const activeFileLabel = document.getElementById("active-file");
const statusLabel = document.getElementById("status");
const issuesList = document.getElementById("issues-list");
const filesList = document.getElementById("files-list");
const fileCountLabel = document.getElementById("file-count");
const commitModal = document.getElementById("commit-modal");
const commitSummaryInput = document.getElementById("commit-summary");
const commitDetailsInput = document.getElementById("commit-details");
const commitCancelButton = document.getElementById("commit-cancel");
const commitConfirmButton = document.getElementById("commit-confirm");
const commitErrorLabel = document.getElementById("commit-error");

let filePath = null;
let activeDirectory = null;
let filesInDirectory = [];
let issuesByType = {
  spell: [],
  grammar: [],
  llm: []
};
let debounceHandle = null;

const editor = createEditor({
  parent: document.getElementById("editor"),
  initialText: "",
  onChange: handleEditorChange,
  onApplyIssue: applyIssue,
  onDismissIssue: dismissIssue
});

initializeDirectory();

function setStatus(message) {
  statusLabel.textContent = message ?? "";
}

function setFilePath(path) {
  filePath = path;
  activeFileLabel.textContent = path
    ? path.split("/").pop()
    : "No file selected";
  highlightActiveFile();
}

function setActiveDirectory(path) {
  activeDirectory = path;
  activeDirectoryInput.value = path ?? "";
  setDirectoryError("");
  if (path) {
    window.localStorage.setItem("activeDirectory", path);
  }
}

function setDirectoryError(message) {
  directoryErrorLabel.textContent = message ?? "";
}

function setCommitError(message) {
  commitErrorLabel.textContent = message ?? "";
}

function handleEditorChange() {
  issuesByType.llm = [];
  scheduleChecks();
}

function scheduleChecks() {
  if (debounceHandle) {
    clearTimeout(debounceHandle);
  }

  debounceHandle = setTimeout(async () => {
    const text = editor.getText();
    issuesByType.spell = checkSpelling(text);

    const grammarResult = await checkGrammar(text);
    issuesByType.grammar = grammarResult.issues;
    if (grammarResult.error) {
      setStatus(grammarResult.error);
    } else {
      setStatus("");
    }

    refreshIssues();
  }, 500);
}

function refreshIssues() {
  const allIssues = [...issuesByType.spell, ...issuesByType.grammar, ...issuesByType.llm];
  editor.setIssues(allIssues);
  renderIssues(allIssues);
}

function renderIssues(issues) {
  issuesList.innerHTML = "";

  if (issues.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "No issues";
    issuesList.appendChild(empty);
    return;
  }

  issues.forEach((issue) => {
    const item = document.createElement("div");
    item.className = "issue-item";

    const type = document.createElement("div");
    type.className = "issue-type";
    type.textContent = issue.type;

    const message = document.createElement("div");
    message.textContent = issue.message;

    const source = document.createElement("div");
    source.className = "issue-source";
    source.textContent = `Source: ${issue.source ?? "unknown"}`;

    const actions = document.createElement("div");
    actions.className = "issue-actions";

    const acceptButton = document.createElement("button");
    acceptButton.textContent = "Apply";
    acceptButton.disabled = !issue.suggestions || issue.suggestions.length === 0;
    acceptButton.addEventListener("click", () => applyIssue(issue));

    const rejectButton = document.createElement("button");
    rejectButton.textContent = "Dismiss";
    rejectButton.addEventListener("click", () => dismissIssue(issue));

    actions.appendChild(acceptButton);
    actions.appendChild(rejectButton);

    item.appendChild(type);
    item.appendChild(message);
    item.appendChild(source);
    if (issue.suggestions?.[0]) {
      const suggestion = document.createElement("div");
      suggestion.textContent = `Suggestion: ${issue.suggestions[0]}`;
      item.appendChild(suggestion);
    }
    item.appendChild(actions);
    issuesList.appendChild(item);
  });
}

function renderFileList() {
  filesList.innerHTML = "";
  fileCountLabel.textContent = filesInDirectory.length ? `${filesInDirectory.length}` : "";

  if (!filesInDirectory.length) {
    const empty = document.createElement("div");
    empty.className = "files-empty";
    empty.textContent = activeDirectory
      ? "No markdown files found"
      : "Select a folder to begin";
    filesList.appendChild(empty);
    return;
  }

  filesInDirectory.forEach((file) => {
    const item = document.createElement("div");
    item.className = "file-item";
    item.textContent = file.relativePath;
    item.dataset.path = file.path;
    item.addEventListener("dblclick", () => openFile(file.path));
    filesList.appendChild(item);
  });

  highlightActiveFile();
}

function highlightActiveFile() {
  const items = Array.from(filesList.querySelectorAll(".file-item"));
  items.forEach((item) => {
    if (item.dataset.path === filePath) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

async function refreshFileList() {
  if (!activeDirectory) {
    filesInDirectory = [];
    renderFileList();
    return;
  }
  const result = await window.api.listMarkdownFiles(activeDirectory);
  filesInDirectory = result?.files ?? [];
  renderFileList();
}

async function initializeDirectory() {
  const stored = window.localStorage.getItem("activeDirectory");
  if (stored) {
    const validation = await window.api.validateDirectory(stored);
    if (validation?.ok) {
      setActiveDirectory(stored);
      await refreshFileList();
      return;
    }
  }

  const result = await window.api.getHomeDirectory();
  if (result?.path) {
    setActiveDirectory(result.path);
    await refreshFileList();
  }
}

async function applyDirectoryInput() {
  const value = activeDirectoryInput.value.trim();
  if (!value) {
    setDirectoryError("Path is required.");
    return;
  }

  const result = await window.api.validateDirectory(value);
  if (!result?.ok) {
    setDirectoryError(result?.error ?? "Directory not found.");
    return;
  }

  setActiveDirectory(value);
  await refreshFileList();
}

async function openFile(path) {
  const result = await window.api.readFile(path);
  if (!result) {
    return;
  }
  setFilePath(result.path);
  editor.setText(result.content ?? "");
  scheduleChecks();
}

function applyIssue(issue) {
  const replacement = issue.suggestions?.[0] ?? "";
  editor.replaceRange(issue.range.start, issue.range.end, replacement);
  scheduleChecks();
}

function dismissIssue(issue) {
  const list = issuesByType[issue.type] ?? [];
  issuesByType[issue.type] = list.filter((item) => item.id !== issue.id);
  refreshIssues();
}

selectDirectoryButton.addEventListener("click", async () => {
  const result = await window.api.selectDirectory();
  if (!result?.path) {
    return;
  }
  setActiveDirectory(result.path);
  await refreshFileList();
});

activeDirectoryInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    await applyDirectoryInput();
  }
});

activeDirectoryInput.addEventListener("blur", async () => {
  await applyDirectoryInput();
});

analyzeButton.addEventListener("click", async () => {
  setStatus("Analyzing...");
  const text = editor.getText();
  const result = await analyzeWithLlm(text);
  issuesByType.llm = result.issues;

  if (result.error) {
    setStatus(result.error);
  } else {
    setStatus("LLM analysis complete");
    setTimeout(() => setStatus(""), 1500);
  }

  refreshIssues();
});

commitCancelButton.addEventListener("click", () => closeCommitModal());
commitConfirmButton.addEventListener("click", async () => {
  const summary = commitSummaryInput.value.trim();
  const details = commitDetailsInput.value.trim();

  if (!summary) {
    setCommitError("Summary is required.");
    return;
  }
  if (!filePath) {
    setCommitError("Select a file to commit.");
    return;
  }

  setCommitError("");
  setStatus("Committing...");
  const result = await window.api.saveAndCommit({
    path: filePath,
    content: editor.getText(),
    messageShort: summary,
    messageLong: details
  });

  if (result?.error) {
    setStatus(result.error);
    setCommitError(result.error);
    return;
  }

  closeCommitModal();
  setStatus("Committed");
  setTimeout(() => setStatus(""), 1500);
});

commitModal.addEventListener("click", (event) => {
  if (event.target.classList.contains("modal-backdrop")) {
    closeCommitModal();
  }
});

function openCommitModal() {
  commitModal.classList.remove("hidden");
  commitModal.setAttribute("aria-hidden", "false");
  setCommitError("");
  commitSummaryInput.focus();
}

function closeCommitModal() {
  commitModal.classList.add("hidden");
  commitModal.setAttribute("aria-hidden", "true");
  commitSummaryInput.value = "";
  commitDetailsInput.value = "";
  setCommitError("");
}

window.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    if (!commitModal.classList.contains("hidden")) {
      return;
    }
    if (!filePath) {
      setStatus("Select a file to commit.");
      return;
    }
    openCommitModal();
  }
  if (event.key === "Escape" && !commitModal.classList.contains("hidden")) {
    closeCommitModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (!commitModal.classList.contains("hidden") && (event.metaKey || event.ctrlKey)) {
    if (event.key === "Enter") {
      event.preventDefault();
      commitConfirmButton.click();
    }
  }
});

const storageKey = "md-content-tool:v3";

const notesList = document.querySelector("#notesList");
const notesStatus = document.querySelector("#notesStatus");
const refreshNotesButton = document.querySelector("#refreshNotesButton");
const editorHeading = document.querySelector("#editorHeading");
const filenameInput = document.querySelector("#filenameInput");
const titleInput = document.querySelector("#titleInput");
const publishPasswordInput = document.querySelector("#publishPasswordInput");
const contentInput = document.querySelector("#contentInput");
const preview = document.querySelector("#preview");
const statusText = document.querySelector("#statusText");
const wordCount = document.querySelector("#wordCount");

const newButton = document.querySelector("#newButton");
const saveButton = document.querySelector("#saveButton");
const downloadButton = document.querySelector("#downloadButton");
const deleteButton = document.querySelector("#deleteButton");
const publishButton = document.querySelector("#publishButton");

let notes = [];
let activePath = "";

function normalizeFilename(value) {
  const cleaned = value.trim().replace(/[\\/:*?"<>|]+/g, "-");
  if (!cleaned) return "note.md";
  return cleaned.toLowerCase().endsWith(".md") ? cleaned : `${cleaned}.md`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function inlineMarkdown(value) {
  let html = escapeHtml(value);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  return html;
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let inList = false;
  let inCode = false;
  let codeLines = [];

  function closeList() {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  }

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      closeList();
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    if (/^###\s+/.test(line)) {
      closeList();
      html.push(`<h3>${inlineMarkdown(line.replace(/^###\s+/, ""))}</h3>`);
    } else if (/^##\s+/.test(line)) {
      closeList();
      html.push(`<h2>${inlineMarkdown(line.replace(/^##\s+/, ""))}</h2>`);
    } else if (/^#\s+/.test(line)) {
      closeList();
      html.push(`<h1>${inlineMarkdown(line.replace(/^#\s+/, ""))}</h1>`);
    } else if (/^>\s?/.test(line)) {
      closeList();
      html.push(`<blockquote>${inlineMarkdown(line.replace(/^>\s?/, ""))}</blockquote>`);
    } else if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>`);
    } else if (line.trim() === "") {
      closeList();
      html.push("");
    } else {
      closeList();
      html.push(`<p>${inlineMarkdown(line)}</p>`);
    }
  });

  closeList();
  if (inCode) {
    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }

  return html.join("\n");
}

function extractTitle(markdown) {
  const heading = markdown.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : "";
}

function contentWithoutTitle(markdown, title) {
  if (!title) return markdown.trimEnd();
  return markdown.replace(/^#\s+.+\r?\n\r?\n?/, "").trimEnd();
}

function buildMarkdown() {
  const title = titleInput.value.trim();
  const body = contentInput.value.trimEnd();
  if (!title) return body;
  if (body.startsWith("# ")) return body;
  return `# ${title}\n\n${body}`.trimEnd();
}

function updatePreview() {
  const markdown = buildMarkdown();
  preview.innerHTML = markdown ? renderMarkdown(markdown) : "<p>預覽會顯示在這裡。</p>";
  wordCount.textContent = `${markdown.replace(/\s/g, "").length} 字`;
}

function setActivePath(path) {
  activePath = path;
  deleteButton.disabled = !activePath;
  document.querySelectorAll(".note-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.path === path);
  });
}

function renderNotes() {
  notesList.innerHTML = "";
  if (!notes.length) {
    notesStatus.textContent = "目前沒有 MD 檔，按「新增 MD」開始。";
    return;
  }

  notes.forEach((note) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "note-item";
    button.dataset.path = note.path;
    button.innerHTML = `
      <span class="note-name">${escapeHtml(note.name)}</span>
      <span class="note-path">${escapeHtml(note.path)}</span>
    `;
    button.addEventListener("click", () => loadNote(note.path));
    notesList.append(button);
  });

  notesStatus.textContent = `共 ${notes.length} 個 MD 檔`;
  setActivePath(activePath);
}

async function loadNotes() {
  notesStatus.textContent = "正在讀取 GitHub 檔案...";
  refreshNotesButton.disabled = true;

  try {
    const response = await fetch("/api/notes");
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "讀取檔案清單失敗");
    notes = result.notes || [];
    renderNotes();
  } catch (error) {
    notesStatus.textContent = error.message;
  } finally {
    refreshNotesButton.disabled = false;
  }
}

async function loadNote(path) {
  statusText.textContent = "正在載入 MD 檔案...";

  try {
    const response = await fetch(`/api/notes?path=${encodeURIComponent(path)}`);
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "讀取檔案失敗");

    const title = extractTitle(result.content || "");
    filenameInput.value = result.name || normalizeFilename(path.split("/").pop() || "note.md");
    titleInput.value = title;
    contentInput.value = contentWithoutTitle(result.content || "", title);
    editorHeading.textContent = result.name || "編輯 Markdown";
    setActivePath(result.path || path);
    saveDraft();
    updatePreview();
    statusText.textContent = `已載入：${result.path || path}`;
  } catch (error) {
    statusText.textContent = error.message;
  }
}

function saveDraft() {
  const data = {
    filename: normalizeFilename(filenameInput.value),
    title: titleInput.value,
    content: contentInput.value,
    activePath,
    savedAt: new Date().toISOString(),
  };
  filenameInput.value = data.filename;
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function loadDraft() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    updatePreview();
    return;
  }

  try {
    const data = JSON.parse(raw);
    filenameInput.value = data.filename || "note.md";
    titleInput.value = data.title || "";
    contentInput.value = data.content || "";
    activePath = data.activePath || "";
    editorHeading.textContent = data.filename || "新增或編輯 Markdown";
    statusText.textContent = "已載入上次儲存的草稿";
  } catch {
    statusText.textContent = "草稿讀取失敗，可以重新開始";
  }
  updatePreview();
}

function saveDraftWithStatus() {
  saveDraft();
  statusText.textContent = `已儲存草稿：${new Date().toLocaleString("zh-TW")}`;
}

function downloadMarkdown() {
  const filename = normalizeFilename(filenameInput.value);
  const markdown = buildMarkdown();
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  saveDraftWithStatus();
}

async function publishMarkdown() {
  const filename = normalizeFilename(filenameInput.value);
  const content = buildMarkdown();
  const password = publishPasswordInput.value;

  if (!content.trim()) {
    statusText.textContent = "內容是空的，先寫一點東西再發布。";
    return;
  }

  publishButton.disabled = true;
  statusText.textContent = "正在發布到 GitHub...";

  try {
    const response = await fetch("/api/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Publish-Password": password,
      },
      body: JSON.stringify({ filename, content }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(result.error || "發布失敗");

    filenameInput.value = filename;
    editorHeading.textContent = filename;
    setActivePath(result.path || "");
    saveDraft();
    statusText.innerHTML = `已發布：<a href="${result.htmlUrl}" target="_blank" rel="noreferrer">${result.path}</a>`;
    await loadNotes();
  } catch (error) {
    statusText.textContent = error.message;
  } finally {
    publishButton.disabled = false;
  }
}

async function deleteMarkdown() {
  if (!activePath) {
    statusText.textContent = "請先從左側選擇要刪除的 MD 檔。";
    return;
  }

  const password = publishPasswordInput.value;
  const confirmed = window.confirm(`確定要刪除 ${activePath}？這會直接從 GitHub 移除。`);
  if (!confirmed) return;

  deleteButton.disabled = true;
  publishButton.disabled = true;
  statusText.textContent = "正在刪除 GitHub 上的 MD 檔...";

  try {
    const response = await fetch("/api/notes", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Publish-Password": password,
      },
      body: JSON.stringify({ path: activePath }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(result.error || "刪除失敗");

    const deletedPath = activePath;
    newDraft();
    statusText.textContent = `已刪除：${deletedPath}`;
    await loadNotes();
  } catch (error) {
    statusText.textContent = error.message;
    deleteButton.disabled = !activePath;
  } finally {
    publishButton.disabled = false;
  }
}

function newDraft() {
  filenameInput.value = "note.md";
  titleInput.value = "";
  contentInput.value = "";
  activePath = "";
  editorHeading.textContent = "新增 Markdown";
  localStorage.removeItem(storageKey);
  setActivePath("");
  statusText.textContent = "已建立新的空白內容";
  updatePreview();
}

[filenameInput, titleInput, contentInput].forEach((input) => {
  input.addEventListener("input", updatePreview);
});

saveButton.addEventListener("click", saveDraftWithStatus);
downloadButton.addEventListener("click", downloadMarkdown);
deleteButton.addEventListener("click", deleteMarkdown);
publishButton.addEventListener("click", publishMarkdown);
newButton.addEventListener("click", newDraft);
refreshNotesButton.addEventListener("click", loadNotes);

loadDraft();
loadNotes();

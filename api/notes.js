function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function normalizeDirectory(value) {
  return String(value || "notes")
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/[\\:*?"<>|]+/g, "-").replace(/^\.+/, ""))
    .filter(Boolean)
    .join("/");
}

function isSafeNotePath(path, notesDir) {
  if (!path || path.includes("..") || path.includes("\\")) return false;
  if (!path.toLowerCase().endsWith(".md")) return false;
  return notesDir ? path === notesDir || path.startsWith(`${notesDir}/`) : true;
}

function fromBase64(value) {
  return Buffer.from(value || "", "base64").toString("utf8");
}

async function githubRequest(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${getRequiredEnv("GITHUB_TOKEN")}`,
      "User-Agent": "md-content-saver",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || `GitHub API error: ${response.status}`;
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

async function listMarkdownFiles({ owner, repo, branch, notesDir }) {
  const queue = [notesDir].filter(Boolean);
  const files = [];

  while (queue.length) {
    const currentDir = queue.shift();
    const encodedPath = currentDir.split("/").map(encodeURIComponent).join("/");
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;
    const items = await githubRequest(url);

    if (!Array.isArray(items)) continue;

    items.forEach((item) => {
      if (item.type === "dir") {
        queue.push(item.path);
      } else if (item.type === "file" && item.name.toLowerCase().endsWith(".md")) {
        files.push({
          name: item.name,
          path: item.path,
          sha: item.sha,
          htmlUrl: item.html_url,
        });
      }
    });
  }

  return files.sort((a, b) => a.path.localeCompare(b.path));
}

module.exports = async function notes(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { error: "Only GET is allowed." });
    return;
  }

  try {
    const owner = getRequiredEnv("GITHUB_OWNER");
    const repo = getRequiredEnv("GITHUB_REPO");
    const branch = process.env.GITHUB_BRANCH || "main";
    const notesDir = normalizeDirectory(process.env.NOTES_DIR);
    const requestedPath = request.query?.path;

    if (requestedPath) {
      if (!isSafeNotePath(requestedPath, notesDir)) {
        sendJson(response, 400, { error: "檔案路徑不合法。" });
        return;
      }

      const encodedPath = requestedPath.split("/").map(encodeURIComponent).join("/");
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;
      const file = await githubRequest(url);

      if (file.type !== "file") {
        sendJson(response, 404, { error: "找不到 MD 檔案。" });
        return;
      }

      sendJson(response, 200, {
        name: file.name,
        path: file.path,
        sha: file.sha,
        htmlUrl: file.html_url,
        content: fromBase64(file.content),
      });
      return;
    }

    const notes = await listMarkdownFiles({ owner, repo, branch, notesDir });
    sendJson(response, 200, { notes });
  } catch (error) {
    const statusCode = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
    sendJson(response, statusCode, { error: error.message || "讀取檔案失敗。" });
  }
};

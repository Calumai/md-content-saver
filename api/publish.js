const MAX_CONTENT_LENGTH = 1024 * 1024;

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

function normalizeFilename(value) {
  const cleaned = String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 120);

  if (!cleaned) return "note.md";
  return cleaned.toLowerCase().endsWith(".md") ? cleaned : `${cleaned}.md`;
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

function toBase64(value) {
  return Buffer.from(value, "utf8").toString("base64");
}

async function githubRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${getRequiredEnv("GITHUB_TOKEN")}`,
      "Content-Type": "application/json",
      "User-Agent": "md-content-saver",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
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

async function getExistingFileSha(apiUrl) {
  try {
    const file = await githubRequest(apiUrl);
    return file.sha;
  } catch (error) {
    if (error.statusCode === 404) return undefined;
    throw error;
  }
}

module.exports = async function publish(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Only POST is allowed." });
    return;
  }

  try {
    const publishPassword = getRequiredEnv("PUBLISH_PASSWORD");
    if (request.headers["x-publish-password"] !== publishPassword) {
      sendJson(response, 401, { error: "發布密碼不正確。" });
      return;
    }

    const { filename, content } = request.body || {};
    if (typeof content !== "string" || !content.trim()) {
      sendJson(response, 400, { error: "內容不可為空。" });
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      sendJson(response, 413, { error: "內容太大，請控制在 1MB 以內。" });
      return;
    }

    const owner = getRequiredEnv("GITHUB_OWNER");
    const repo = getRequiredEnv("GITHUB_REPO");
    const branch = process.env.GITHUB_BRANCH || "main";
    const dir = normalizeDirectory(process.env.NOTES_DIR);
    const cleanFilename = normalizeFilename(filename);
    const path = dir ? `${dir}/${cleanFilename}` : cleanFilename;
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;
    const sha = await getExistingFileSha(`${apiUrl}?ref=${encodeURIComponent(branch)}`);

    const body = {
      message: sha ? `Update ${path}` : `Create ${path}`,
      content: toBase64(content.endsWith("\n") ? content : `${content}\n`),
      branch,
      ...(sha ? { sha } : {}),
    };

    if (process.env.COMMIT_AUTHOR_NAME && process.env.COMMIT_AUTHOR_EMAIL) {
      body.committer = {
        name: process.env.COMMIT_AUTHOR_NAME,
        email: process.env.COMMIT_AUTHOR_EMAIL,
      };
    }

    const result = await githubRequest(apiUrl, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    sendJson(response, 200, {
      path,
      sha: result.content?.sha,
      htmlUrl: result.content?.html_url,
      commitUrl: result.commit?.html_url,
    });
  } catch (error) {
    const statusCode = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
    sendJson(response, statusCode, { error: error.message || "發布失敗。" });
  }
};

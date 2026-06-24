# MD 內容儲存器

這是一個可部署到 Vercel 的 Markdown 小工具。前端負責編輯與預覽，後端 API 會安全地把 `.md` 檔寫入 GitHub repository。

## 功能

- 編輯 Markdown 內容
- 即時預覽標題、清單、引用、程式碼區塊、粗體、斜體和連結
- 把草稿存在瀏覽器 localStorage
- 下載目前內容成 `.md` 檔案
- 透過後端 API 發布 Markdown 到 GitHub

## 部署到 Vercel

1. 把這個 repository 推到 GitHub。
2. 在 Vercel 匯入這個 GitHub repository。
3. 在 Vercel Project Settings > Environment Variables 設定以下變數：

| 變數 | 說明 |
| --- | --- |
| `GITHUB_TOKEN` | GitHub fine-grained token，需要目標 repo 的 Contents read/write 權限 |
| `GITHUB_OWNER` | GitHub 帳號或 organization 名稱 |
| `GITHUB_REPO` | 要存放 Markdown 的 repository 名稱 |
| `GITHUB_BRANCH` | 要寫入的 branch，預設 `main` |
| `NOTES_DIR` | Markdown 存放資料夾，預設 `notes` |
| `PUBLISH_PASSWORD` | 網頁發布時要輸入的密碼 |
| `COMMIT_AUTHOR_NAME` | commit 作者名稱，可省略 |
| `COMMIT_AUTHOR_EMAIL` | commit 作者 email，可省略 |

4. Deploy 後打開 Vercel 網址，在網頁輸入發布密碼，就可以直接新增或更新 Markdown 檔。

## 本機使用

直接用瀏覽器開啟 `index.html` 可以編輯、預覽與下載 `.md`，但發布到 GitHub 需要部署到 Vercel，或用 Vercel CLI 啟動本機 serverless API。

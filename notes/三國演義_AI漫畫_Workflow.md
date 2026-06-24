# 三國演義 AI 漫畫製作 Workflow
> 版本：v1.1 ・ 適用工具：ChatGPT DALL-E 3 ・ 發布平台：IG / FB

---

## 📌 整體流程總覽

```
STEP 1 確定集數與故事段落
    ↓
STEP 2 選定本集風格（從風格池選一個）
    ↓
STEP 3 Claude 產出分格腳本（10格）
    ↓
STEP 4 Claude 產出每格英文 Prompt（帶入風格）
    ↓
STEP 5 DALL-E 生圖（每格一張）
    ↓
STEP 6 Canva 排版 + 加對白框
    ↓
STEP 7 發布 IG / FB
```

---

## STEP 1｜確定集數與故事段落

**已規劃集數**

| 集數 | 標題 | 風格 | 狀態 |
|------|------|------|------|
| EP 01 | 桃園三結義 | 美式厚塗 | ✅ 腳本完成 |
| EP 02 | 三英戰呂布 | 待定 | 🔲 待製作 |
| EP 03 | 火燒赤壁 | 待定 | 🔲 待製作 |
| EP 04 | 空城計 | 待定 | 🔲 待製作 |

---

## STEP 2｜風格池（Style Pool）

> 每集選一個風格，整集統一使用。
> 選好後把「風格尾綴」帶入 STEP 4 的 Prompt。

---

### 🎨 寫實系

| 風格名稱 | 說明 | 風格尾綴 |
|----------|------|---------|
| **美式漫畫厚塗** | Marvel 電影感，最史詩 | `American comic book style, thick impasto oil painting, Marvel aesthetic, epic cinematic lighting, dramatic shadows, ultra-detailed, 4K, square 1:1` |
| **電影概念藝術** | 好萊塢電影分鏡感 | `cinematic concept art, film-grade lighting, photorealistic texture, dramatic composition, ultra-detailed, 4K, square 1:1` |
| **油畫古典風** | 文藝復興油畫質感，厚重莊嚴 | `classical oil painting style, Renaissance technique, rich colors, dramatic chiaroscuro lighting, museum quality, square 1:1` |

---

### 🖌️ 東方系

| 風格名稱 | 說明 | 風格尾綴 |
|----------|------|---------|
| **中國水墨工筆** | 傳統水墨，留白構圖 | `Chinese ink wash painting style, traditional brush strokes, watercolor rendering, negative space composition, classical aesthetics, square 1:1` |
| **敦煌壁畫風** | 古代壁畫質感，復古神秘 | `Dunhuang mural style, ancient Chinese fresco, earthy tones, flat illustration, historical painting texture, square 1:1` |
| **浮世繪風** | 日本江戶時代版畫感 | `Ukiyo-e woodblock print style, flat colors, bold outlines, Japanese traditional art, decorative patterns, square 1:1` |

---

### ✏️ 漫畫系

| 風格名稱 | 說明 | 風格尾綴 |
|----------|------|---------|
| **日系漫畫** | 清晰線稿，動態感強 | `Japanese manga style, clean line art, dynamic composition, expressive characters, high contrast black and white, square 1:1` |
| **日系彩色漫畫** | 少年漫畫彩色版 | `Japanese shounen manga style, vibrant colors, clean line art, anime aesthetic, dynamic action poses, square 1:1` |
| **韓系 Webtoon** | 手機直式，顏色鮮豔 | `Korean webtoon style, soft colors, clean digital illustration, cute expressive characters, modern manhwa aesthetic, square 1:1` |
| **歐式漫畫** | 丁丁風，簡潔線條 | `European bande dessinée style, Tintin-inspired, clean bold outlines, flat bright colors, retro comic aesthetic, square 1:1` |

---

### 🎮 特殊風格

| 風格名稱 | 說明 | 風格尾綴 |
|----------|------|---------|
| **火柴人** | 極簡線條，搞笑感強 | `stick figure drawing style, simple black lines on white background, minimalist stick people, rough sketchy style, humorous comic, square 1:1` |
| **兒童插畫** | 可愛圓潤，親子友善 | `children's book illustration style, cute rounded characters, soft pastel colors, simple shapes, friendly and playful, square 1:1` |
| **像素藝術** | 8-bit 遊戲風 | `pixel art style, 8-bit retro game aesthetic, chunky pixels, limited color palette, arcade game feel, square 1:1` |
| **剪紙風** | 扁平剪紙質感 | `paper cut art style, layered paper illustration, flat silhouettes, bold colors, craft paper texture, square 1:1` |
| **塗鴉街頭** | 街頭藝術，潮流感 | `street art graffiti style, urban mural aesthetic, bold outlines, spray paint texture, vibrant graffiti colors, square 1:1` |
| **黑白素描** | 鉛筆手繪質感 | `pencil sketch style, black and white drawing, cross-hatching shading, rough hand-drawn lines, sketchbook aesthetic, square 1:1` |
| **賽博龐克** | 未來科技感三國 | `cyberpunk style, neon lights, futuristic dystopian aesthetic, high-tech low-life, glowing colors, dramatic lighting, square 1:1` |

---

## STEP 3｜分格腳本格式

**Claude Prompt 模板：**
```
你是三國演義漫畫的分鏡師。
請根據「[故事名稱]」，產出 10 格分鏡腳本。
每格包含：格號、標題、鏡頭說明、場景描述、對白。
本集風格：[風格名稱]
```

---

## STEP 4｜Prompt 組裝公式

### 角色設定檔

| 角色 | 英文外觀描述 |
|------|-------------|
| 劉備 | `wearing dark green and gold Han dynasty armor, jade pin in hair, thin beard, gentle but determined eyes` |
| 關羽 | `holding Green Dragon Crescent Blade, deep crimson battle robes over black iron armor, long magnificent black beard to chest` |
| 張飛 | `holding Serpent Spear, black iron plate armor with beast-face pauldrons, bulging fierce eyes, thick black beard, massive muscular build` |
| 曹操 | `wearing black elaborate chancellor armor, sharp intelligent eyes, commanding and cunning presence` |
| 諸葛亮 | `holding feather fan, wearing Eight Trigrams Taoist robe, serene wise expression` |

### 組裝公式
```
[角色外觀描述]. Scene: [場景描述]. Style: [風格尾綴].
```

---

## STEP 5｜DALL-E 生圖 SOP

### 方式 A｜ChatGPT 介面
1. 開新對話
2. 上傳角色參考圖（若有）
3. 貼入組裝好的 Prompt
4. 生圖 → 右鍵儲存

### 方式 B｜本機工具
1. `cd three-kingdoms-comic && npm run dev`
2. 打開 `http://localhost:3000`
3. 輸入 OpenAI API Key
4. 選風格 → 批次生成

---

## STEP 6｜Canva 排版 SOP

1. 新設計 → `1080×1080px`
2. 匯入生成圖片
3. 加對白框（黑底白字）
4. 加格號（可選）
5. 最後一格加下集預告
6. 匯出 PNG

---

## STEP 7｜發布 SOP

**Caption 模板：**
```
【三國演義 EP XX｜[集名]】

[50字故事摘要]

下集預告：[下集標題] 👇

#三國演義 #AI漫畫 #漫畫 #三國
```

---

## ✅ 每集製作檢查清單

```
□ 確定本集故事段落
□ 選定本集風格（從風格池選一個）
□ Claude 產出 10 格腳本
□ 每格 Prompt 組裝完成（帶入風格尾綴）
□ 10 格圖片全部生成
□ 角色外觀一致性確認
□ Canva 排版完成
□ IG 輪播上傳發布
```

---

## 📁 檔案命名規則

```
三國_EP01_桃園三結義_美式厚塗_格01.png
三國_EP01_桃園三結義_美式厚塗_格02.png
...
```

---

*Workflow v1.1 ・ 風格池新增 14 種風格*

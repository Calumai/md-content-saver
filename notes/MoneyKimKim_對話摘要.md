# MoneyKimKim 專案對話摘要

## 1. 專案目標

專案名稱：**MoneyKimKim**

目標是建立一個「政府採購每日查標整理」工具，用來自動搜尋政府採購網標案，篩出與使用者業務相關的勞務類標案，並整理成可寫入 Google Sheet、可複製到群組回報的格式。

主要用途：

- 每日搜尋政府採購網標案
- 只看勞務類標案
- 依「機關關鍵字」與「標案名稱關鍵字」搜尋
- 判斷標案名稱是否命中關鍵字
- 比對往年相似標案
- 寫入 Google Sheet
- 產生群組回報文字
- 供同事複製使用自己的 Google Sheet / Apps Script

---

## 2. GitHub 與網站資訊

### GitHub Repo

```text
Calumai/moneykimkim
```

### GitHub Pages 網址

```text
https://calumai.github.io/moneykimkim/
```

### root index.html

目前 root `index.html` 應該指向：

```html
<iframe src="./public/index-v990.html?v=loop-ui-9-9-0"></iframe>
<div class="version-badge">Loop UI 9.9.0</div>
```

重要：**root 要指向 Loop UI 9.9.0，不要改回 9.3.1。**

---

## 3. 前端版本狀態

### 正確前端版本

```text
public/index-v990.html
Loop UI 9.9.0
```

### v990 的定位

`index-v990.html` 是外層包裝頁，iframe 載入：

```text
index-v970.html?v=loop-ui-9-9-0-base
```

v990 主要做補丁與包裝：

- 把「目前搜尋方式」包成開合式 details 卡片
- 同事設定區也包成開合式卡片
- 群組回報文字改成卡片式
- 回報連結嘗試用 TinyURL 轉短網址
- 保留 root 為 Loop UI 9.9.0

### 前端不要再改回

```text
public/index-v931.html
Loop UI 9.3.1
```

v931 是之前修「機關空白不預設花蓮」時誤切的前端版本，後來確認不應該作為 root。

---

## 4. 前端文案修改需求

使用者要求：

### 標題

原本：

```text
政府採購每日查標整理 MVP｜Loop 3
```

改成：

```text
MoneyKimKim
```

### 副標

原本：

```text
搜尋 → 勞務類過濾 → 標案名稱關鍵字瞄準 → 往年相似比對 → 寫入 Google Sheet
```

改成：

```text
政：表示政府採購網來源
```

### 提示文字

原本：

```text
※「標題命中」＝標案名稱命中目前欄位中的標案關鍵字；預設字庫來自你的招標圖解文件。
```

改成：

```text
預祝得標
```

---

## 5. 「目前搜尋方式」區塊需求

使用者要求：

- 「目前搜尋方式」不要一直展開
- 改成開合式卡片
- 使用者需要時自己打開

目前 v990 已有補丁：

```js
function patchSearchPlan(d) {
  const plan = d.getElementById('plan');
  const oldPanel = plan && plan.closest('section');
  if (!oldPanel || oldPanel.dataset.mk990Details) return;
  const details = d.createElement('details');
  details.className = 'mk-details';
  details.innerHTML = '<summary>目前搜尋方式</summary>';
  details.appendChild(plan);
  oldPanel.replaceWith(details);
  oldPanel.dataset.mk990Details = '1';
}
```

---

## 6. 群組回報文字需求

使用者要求：

- 回報文字中的連結能不能變短網址
- 群組回報不要只有一大段文字
- 可一筆一筆複製

目前 v990 有補丁：

- 嘗試呼叫 TinyURL API：

```js
https://tinyurl.com/api-create.php?url=
```

- 每筆標案顯示成卡片
- 每筆有「複製這一筆」
- 上方有「複製全部」

注意：短網址 API 可能受瀏覽器 CORS、網路或服務限制影響。若失敗，會回退原始網址。

---

## 7. 機關關鍵字搜尋規則

這是本專案最重要的搜尋規則之一。

### 使用者明確要求

「機關關鍵字」不是指定單一機關名稱，而是機關名稱的模糊搜尋關鍵字。

例如使用者輸入：

```text
原住民、客家、財團法人原住民族語言研究發展基金會、原住民族委員會、客家委員會
```

後端應該拆成：

```text
orgName=原住民
orgName=客家
orgName=財團法人原住民族語言研究發展基金會
orgName=原住民族委員會
orgName=客家委員會
```

### 搜尋效果

`原住民` 應該可能搜到：

```text
原住民族委員會
臺北市政府原住民族事務委員會
新北市政府原住民族行政局
花蓮縣政府原住民行政處
各縣市原住民事務相關單位
```

`客家` 應該可能搜到：

```text
客家委員會
臺北市政府客家事務委員會
桃園市政府客家事務局
各縣市客家文化相關單位
```

### 機關欄位空白規則

如果機關欄位空白：

```text
orgName = 空白
```

意思是：

```text
不限機關
```

嚴禁後端偷偷改成：

```text
花蓮
```

---

## 8. 標案名稱關鍵字搜尋規則

「標案關鍵字」欄位是用來搜尋標案名稱。

例如：

```text
族語、客語、攝影、拍攝、教材、平台、母語、文化、印刷
```

後端應該逐一拆開搜尋：

```text
tenderName=族語
tenderName=客語
tenderName=攝影
tenderName=拍攝
...
```

---

## 9. 搜尋策略修正

原先搜尋策略容易出現：

```text
查詢 80 組，找到 0 筆
```

這不合理，原因是原本只做：

```text
機關關鍵字 × 標案關鍵字
```

如果前 80 組剛好過窄，就會查不到。

### 新策略

新的完整後端 `Code-v921-complete.gs` 改成：

```text
1. 先做機關單查
   orgName=原住民, tenderName=空白

2. 再做標案名稱單查
   orgName=空白, tenderName=族語

3. 最後才做機關 × 標案關鍵字交叉查
   orgName=原住民, tenderName=族語
```

這樣比較不會漏資料。

---

## 10. 標案名稱解析問題

政府採購網搜尋結果 HTML 範例：

```html
<td>
  1150616<span style="color:red"> (更正公告)</span>
  <br>
  <a href="/prkms/urlSelector/common/tpam?pk=NzEyNTA5NDQ=">
    <u><span id="1">115年度優良教育人員表揚典禮場地布置及活動錄攝影服務採購</span></u>
  </a>
</td>
```

正確解析方式：

```text
案號：br 前面的文字，例如 1150616
標案名稱：a > u > span 的文字
```

也可能從「檢視」按鈕 title 抓：

```html
title="檢視 標案名稱: 115年度優良教育人員表揚典禮場地布置及活動錄攝影服務採購"
```

最後備援才進 detail 頁抓：

```html
<td id="tenderNameText">...</td>
```

---

## 11. 後端完整檔

目前建議使用：

```text
Code-v921-complete.gs
```

下載連結：

```text
sandbox:/mnt/data/Code-v921-complete.gs
```

GitHub 路徑：

```text
apps-script/Code-v921-complete.gs
```

這份是完整單檔，使用方式：

```text
1. Apps Script 裡舊程式全部刪掉
2. 只貼 Code-v921-complete.gs
3. 儲存
4. 部署 → 管理部署作業 → 編輯 → 新版本 → 部署
5. 回前端按「測試連線」
```

測試連線應看到：

```text
後端 Loop 9.2.1 Complete
```

---

## 12. 不要再貼的舊後端檔案

現在不要再貼這些：

```text
Code-v900.gs
Code-v904-search-cell-title-addon.gs
Code-v905-no-default-agency-addon.gs
Code-v906-no-default-agency-safe-addon.gs
Code-v910-view-title-addon.gs
```

原因：

- addon 疊太多會互相覆蓋 function
- 版本顯示混亂
- 容易出現 `toRocDate is not defined`
- 使用者明確要求「何不給我一個完整的 gs」

所以後續統一用：

```text
Code-v921-complete.gs
```

---

## 13. 後端已修正的錯誤

### 錯誤 1

```text
自動搜尋失敗：toRocDate is not defined
```

原因：

`Code-v905-no-default-agency-addon.gs` 呼叫了 `toRocDate()`，但主程式裡沒有該函式。

修正：

`Code-v921-complete.gs` 內建：

```js
safeToRocDate()
dateToRoc()
parseRocOrAdDate()
```

---

### 錯誤 2

機關欄位空白仍然只搜尋花蓮。

原因：

舊程式內有類似：

```js
query.agencyQuery || '花蓮'
```

修正：

`Code-v921-complete.gs` 改成：

```js
var agencies = splitWords(query.agencyQuery || '');
var agencyList = agencies.length ? agencies : [''];
```

也就是空白就真的送空白。

---

## 14. Google Apps Script 設定

### 必填 Script Property

```text
SHEET_ID
```

值填 Google Sheet 的試算表 ID。

### 選填 Script Property

```text
GOOGLE_CHAT_WEBHOOK_URL
```

如果要傳 Google Chat 群組通知才需要。

### TOKEN

前後端預設：

```text
1234
```

如果 Script Property 有設定：

```text
SCRIPT_TOKEN
```

則用 Script Property 的值。

---

## 15. Google Sheet 寫入欄位

後端 `writeRows()` 會寫入欄位：

```text
編號
資料狀態
案號
標案名稱
完整標案名稱
機關名稱
公告日期
截標日期
預算金額
優先度
搜尋關鍵字
命中關鍵字
初步備註
標案連結
摘要
歷史相似度
歷史相似標案
歷史相似公告日
歷史相似連結
```

---

## 16. 資料狀態欄位顯示

使用者要求不要讓資料狀態佔太多表格空間。

目前前端做法：

```text
資料狀態合併到標案名稱欄位
```

例如：

```text
[政]
標案名稱
```

其中：

```text
政 = 政府採購網來源
```

---

## 17. 使用者目前的問題狀態

最後使用者截圖顯示：

```text
完成：查詢 80 組，找到 0 筆勞務類標案
```

使用者認為：

```text
不可能沒找到
```

合理判斷：

1. 舊後端搜尋策略太窄，只查了前 80 組交叉組合。
2. 可能沒有先做「機關單查」與「標案名稱單查」。
3. 機關關鍵字或標案名稱關鍵字可能被切得太細。
4. 只看勞務類會過濾掉非勞務標案，但使用者預期應該仍有勞務類。
5. 建議下一步確認後端是否已換成 `Code-v921-complete.gs` 並重新部署。

---

## 18. 下一個對話建議要做的事

新對話開始後，請優先確認：

```text
1. 前端右上/標籤顯示是否仍為 Loop UI 9.9.0
2. 前端 root 是否仍指向 public/index-v990.html
3. Apps Script 測試連線是否顯示後端 Loop 9.2.1 Complete
4. 使用者是否已把 Apps Script 舊內容全部刪掉，只貼 Code-v921-complete.gs
5. 若仍 0 筆，請檢查 debugSearch 回傳的 URL 是否真的包含：
   - 機關單查
   - 標案名稱單查
   - 機關×標案交叉查
6. 若仍 0 筆，下一步應修改前端或後端，新增「顯示查詢 URL / debug 模式」讓使用者能看到實際查了什麼。
```

---

## 19. 對話風格提醒

使用者偏好：

- 不要繞圈
- 不要一直問確認
- 直接修
- 直接給檔案
- 不要把正確版本覆蓋掉
- 版本要清楚
- 如果做錯要直接承認
- 不要講太多理論
- 要用繁體中文

容易踩雷：

- 不要把 root 改回舊版，例如 9.3.1
- 不要再叫使用者貼一堆 addon
- 不要說「可以用了」但後端版本還沒確認
- 不要把機關空白預設成花蓮
- 不要把「機關關鍵字」當成精準機關名稱
- 不要把「標案關鍵字」寫成泛稱，使用者要的是「標案名稱關鍵字」

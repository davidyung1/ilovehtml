# I love HTML

免登入的單一 HTML 文字編輯 Demo。選檔、按「編輯」，在虛線內修改文字；選中一般段落可新增或刪除段落。按「儲存」後可下載 HTML 及複製 24 小時分享連結。

## 本機啟動

需要 Node.js 22 或更新版本。在本目錄執行：

```sh
npm ci
npm run dev
```

開啟終端顯示的本機網址。本機分享使用記憶體模擬 KV，重新啟動後清空，連結只供能連到本機伺服器的裝置查看。正式分享需要發布到 Cloudflare。

```sh
npm test
npm run build
```

## 展示檔案

- `showcase/presentation.html`：獨立十頁產品簡報；方向鍵切頁，F 全螢幕。
- `showcase/company-report.html`：虛構公司匯報，直接上傳到編輯器展示。
- `showcase/demo-script.md`：約十分鐘講稿及操作順序。

兩份 HTML 可離線開啟，不隨產品網站發布。所有營運數據均為虛構。單一檔案以 UTF-8 為準；外部資源需要網絡，同資料夾附件不會自動上傳。動態文字、圖片文字及圖表內文字不屬於文字編輯範圍。

## Cloudflare Pages 與 KV 免費方案

建立獨立 Pages 專案與 KV namespace，綁定為 HTML_FILES。不需要 R2、付款資料或付費訂閱。建置命令 npm run build，輸出 dist；每份 HTML 使用 expirationTtl: 86400，後端亦檢查 expiresAt，24 小時後拒絕讀取。

KV 免費額度目前為每天 1,000 次寫入、100,000 次讀取及 1 GB 儲存，額度與規則以官方文件為準。新連結跨地區可能需要同步時間，剛儲存後若暫時找不到，稍後重試。官方文件：https://developers.cloudflare.com/kv/platform/pricing/

一般 Pages Direct Upload 發布 dist 即可。另提供 npm run package:pages，在 .local/pages-worker.js 產生可透過 Pages API 直接上傳的自包含 Worker；此包將網站程式內嵌，字體請求轉至 jsDelivr 上固定版本的 Fontsource 檔案，不包含 showcase。網站使用公開網絡字體，字體無法載入時使用系統字體。不要把 .local 或任何帳戶憑證放入公開來源。

公開來源時只上傳本目錄的原始碼與 lockfile，排除 `.gitignore` 所列項目。不附加其他儲存庫歷史。未授予額外開源授權；第三方套件依其原有授權。

展示結束後可刪除本專案的 Pages 部署及專用 KV namespace；操作前自行確認不需保留展示資料。

編輯模式支援選取文字後設定 1–100 px 字號、粗體、斜體、底線與六種基本顏色。也支援 Ctrl／Command + B、I、U。格式會寫進 HTML 並保留於下載與分享；這些操作會改變被選取文字的外觀。

新增段落會直接在所選段落下方插入空白虛線輸入區並聚焦，可保留空白。新增及刪除會保留預覽的頁面／內層捲動位置；修改仍須手動儲存。

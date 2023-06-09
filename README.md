# 將 Xuite 日誌匯出檔案轉換為 Markdown

使用 Node JS 與 npm 套件，將 Xuite 日誌匯出檔案轉換為 Markdown 檔案保存，以供後續部落格搬家使用。

## 安裝相依套件

在執行這個程式之前，需要確保以下套件已經安裝在您的環境中：

- [axios](https://www.npmjs.com/package/axios): 用於下載圖片。
- [turndown](https://www.npmjs.com/package/turndown): 用於將 HTML 轉換為 Markdown。
- [moment](https://www.npmjs.com/package/moment): 用於處理日期格式。

使用下列指令安裝相依套件：

`npm install axios turndown moment`


## 準備 Xuite 文章備份輸出檔案

請將這個文字檔（例如：xuite_blog_export_0000000.txt）命名為 `input.txt`，並確保它與程式碼檔案位於同一個目錄下。


## 檢查文字檔案圖片連結

如果 xuite 輸出檔案裡的圖片連結結尾為「_o 」，會無法存取。建議將所有圖片連結結尾是「_o 」的圖檔，統一置換為「_l」或「_x」。

例如：將 `https://d.share.photo.xuite.net/ooxx/0000000/00000000/1234567890_o.jpg` 改為 `https://d.share.photo.xuite.net/ooxx/0000000/00000000/1234567890_l.jpg`。


## 執行程式

使用終端機在此程式碼所在的目錄下，以 Node.js 執行以下指令來運行程式：

`node convert.js`

程式將會將每篇文章轉換為 Markdown 格式並儲存為獨立的 Markdown 檔案，儲存於 `export` 資料夾中。檔案名稱格式為 `post-序號-日期.md`，例如 `post-1-2023-01-01.md`。

## Markdown 輸出格式

輸出格式適用於 VuePress 的 [VuePress Theme Hope](https://theme-hope.vuejs.press/zh/)。

您也可以依照您的需求調整程式碼的輸出格式。

## 注意事項

- 程式預設將圖片下載到 `export/image/序號` 目錄下。
- 為避免超出 Xuite 允許存取的量，程式已有分批處理檔案和下載圖片，但如果圖片不多，可以調整每次處理檔案數量，及延遲處理下一批檔案的時間，加快速度。
- 請注意程式碼中的路徑設定，確保程式能夠正確讀取 `input.txt` 文字檔和寫入 Markdown 檔案。
- 如果 HTML 內容包含圖片，程式將會自動下載圖片並儲存到本地，請確保程式運行時具有網路連接和圖片下載的權限。

此程式碼由 ChatGPT 撰寫。

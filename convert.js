const fs = require('fs');
const axios = require('axios');
const TurndownService = require('turndown');
const moment = require('moment');

// 檢查並建立 export 資料夾
if (!fs.existsSync('export')) {
  fs.mkdirSync('export');
}

// 檢查並建立 export/image 資料夾
if (!fs.existsSync('export/image')) {
  fs.mkdirSync('export/image');
}

// 讀取文字檔案
const data = fs.readFileSync('input.txt', 'utf8');

// 使用正則表達式分割文字檔案為不同的文章
const articles = data.split('-----\n');

// 建立 Turndown 服務
const turndownService = new TurndownService();

// 下載圖片並儲存到本地
async function downloadImage(url, folder, filename) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      maxContentLength: 10 * 1024 * 1024 * 50, // 500MB
    });
    fs.writeFileSync(`export/${folder}/${filename}`, response.data, 'binary');
    console.log(`已下載圖片：${filename}`);
  } catch (error) {
    console.error('無法下載圖片:', error);
  }

  // 延遲 2 秒後繼續處理下一張圖片
  await new Promise(resolve => setTimeout(resolve, 2000));
}


let serialNumber = 1;
let processedCount = 0;

// 遞迴處理 Markdown 檔案
async function processMarkdownFiles(startIndex) {
  if (startIndex >= articles.length) {
    console.log('所有 Markdown 檔案處理完成！');
    return;
  }
  // 每次處理 1 份檔案
  const endIndex = Math.min(startIndex + 1, articles.length);

  for (let index = startIndex; index < endIndex; index++) {
    const article = articles[index];

    // 使用正則表達式匹配所需資訊
    const matchTitle = article.match(/TITLE: (.+)\n/);
    const matchAuthor = article.match(/AUTHOR: (.+)\n/);
    const matchDate = article.match(/DATE: (.+)\n/);
    const matchCategory = article.match(/CATEGORY: (.+)\n/);
    const matchStatus = article.match(/STATUS: (.+)\n/);
    const matchBody = article.match(/BODY:\n([\s\S]+)\n/);

    if (
      matchTitle &&
      matchAuthor &&
      matchDate &&
      matchCategory &&
      matchStatus &&
      matchBody
    ) {
      // 取得匹配結果
      const title = matchTitle[1];
      const author = matchAuthor[1];
      const date = moment(matchDate[1], 'MM/DD/YYYY').format('YYYY-MM-DD');
      const category = matchCategory[1];
      const status = matchStatus[1];
      const body = matchBody[1];

      // 轉換 HTML 到 Markdown
      let markdownBody = turndownService.turndown(body);

      // 提取第一個段落作為 description，並移除空格
      const description = markdownBody
        .split('\n\n')[0]
        .replace(/\*/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      // 建立 Markdown 格式
      const markdown = `---
lang: zh-Hant-tw
title: ${title}
date: ${date}
category: 
  - ${category}
description: ${description}
sidebar: false
---

${markdownBody}`;

      // 建立資料夾
      const folder = `image/${serialNumber}`;
      if (!fs.existsSync(`export/${folder}`)) {
        fs.mkdirSync(`export/${folder}`, { recursive: true });
      }

      // 在 Markdown 中處理圖片連結並下載圖片
      const markdownWithImages = markdown.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, (match, alt, src) => {
        const filename = src.split('/').pop();

        // 下載圖片並儲存到本地
        downloadImage(src, folder, filename);

        // 回傳新的圖片連結格式
        return `![${alt}](${folder}/${filename})`;
        // 刪除圖片外的連結
      }).replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\([^)]+\)/g, '![$1]($2)');

      // 更新 Markdown 內容
      fs.writeFileSync(`export/post-${serialNumber}-${date}.md`, markdownWithImages);

      console.log(`輸出序號 (${serialNumber}) 為：${serialNumber}`);
      serialNumber++;
      processedCount++;
    } else {
      console.error(`無法解析文章 #${index + 1}`);
    }
  }

  console.log(`已處理 ${processedCount} 個 Markdown 檔案`);

  // 延遲處理下一批檔案
  setTimeout(() => {
    processMarkdownFiles(endIndex);
  }, 20000); // 延遲 20 秒後處理下一批檔案
}

// 開始處理 Markdown 檔案
processMarkdownFiles(0);

console.log('開始轉換！');

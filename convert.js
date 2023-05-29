const fs = require('fs');
const axios = require('axios');
const TurndownService = require('turndown');
const moment = require('moment');

// 讀取文字檔案
const data = fs.readFileSync('input.txt', 'utf8');

// 使用正則表達式分割文字檔案為不同的文章
const articles = data.split('-----\n');

// 建立 Turndown 服務
const turndownService = new TurndownService();

// 下載圖片並儲存到本地
async function downloadImage(url, filename) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(filename, response.data);
  } catch (error) {
    console.error('無法下載圖片:', error);
  }
}

// 處理 HTML 到 Markdown 的過程中處理圖片和連結
turndownService.addRule('handleImagesAndLinks', {
  filter: ['img', 'a'],
  replacement: function (content, node) {
    if (node.nodeName === 'IMG') {
      const src = node.getAttribute('src');
      const alt = node.getAttribute('alt');
      const filename = `image/${src.split('/').pop()}`;

      // 下載圖片並儲存到本地
      downloadImage(src, filename);

      // 取得圖片檔案名稱
      const imageFilename = filename.split('/')[1];

      // 移除圖片語法中的 <a> 標籤以及結尾部分
      const markdownImage = `![${alt}](${imageFilename})`;
      console.log(markdownImage);
      return markdownImage;
    } else if (node.nodeName === 'A') {
      const href = node.getAttribute('href');
      const children = Array.from(node.childNodes);

      // 檢查連結內容是否為圖片
      const containsImage = children.some(child => child.nodeName === 'IMG');
      if (containsImage) {
        // 如果連結以 //photo.xuite.net/ 開頭，且包含圖片，只移除圖片的連結
        if (href.startsWith('//photo.xuite.net/')) {
          const imageNode = children.find(child => child.nodeName === 'IMG');
          if (imageNode) {
            const alt = imageNode.getAttribute('alt');
            const src = imageNode.getAttribute('src');
            const filename = `image/${src.split('/').pop()}`;

            // 下載圖片並儲存到本地
            downloadImage(src, filename);

            // 取得圖片檔案名稱
            const imageFilename = filename.split('/')[1];

            // 移除連結語法並保留圖片
            const markdownImage = `![${alt}](image/${imageFilename})`;
            console.log(markdownImage);
            return markdownImage;
          }
        }
      } else {
        // 保留其他文字連結
        const linkText = children.map(child => child.textContent).join('');
        const markdownLink = `[${linkText}](${href})`;
        console.log(markdownLink);
        return markdownLink;
      }
    }

    // 預設回傳空字串，表示不處理其他節點
    return '';
  }
});


let serialNumber = 1;

// 迭代處理每篇文章
articles.forEach((article, index) => {
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
title: ${title}
author: ${author}
date: ${date}
category: 
  - ${category}
status: ${status}
description: ${description}
---

${markdownBody}`;

    // 將 Markdown 寫入檔案
    fs.writeFileSync(`${date}-${serialNumber}.md`, markdown);
    
    console.log(`輸出序號 (${serialNumber}) 為：${serialNumber}`);
    serialNumber++;
  } else {
    console.error(`無法解析文章 #${index + 1}`);
  }
});

console.log('轉換完成！');

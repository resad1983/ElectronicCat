# 電子貓養成 Web App

一個簡單的網頁版電子貓養成遊戲，類似電子雞。

## 功能

*   餵食貓咪
*   陪貓玩耍
*   貓咪會隨著互動次數成長（幼貓 -> 成長期 -> 完全體）
*   成長期和完全體有多種隨機型態
*   可以隨時更改貓咪的名字
*   餵食和玩耍有冷卻時間限制
*   遊戲進度會自動儲存在瀏覽器的 Local Storage

## 如何執行

1.  確保 `images` 資料夾內有必要的貓咪圖片：
    *   `stage0.png`
    *   `stage1_1.png` 到 `stage1_5.png`
    *   `stage2_1.png` 到 `stage2_5.png`
    *   `default_cat.png` (用於圖片載入錯誤時)
2.  用你的網頁瀏覽器打開 `index.html` 檔案即可開始遊戲。

## 部署到 GitHub Pages

1.  將此專案資料夾初始化為 Git repository (`git init`)
2.  將所有檔案加入 Git (`git add .`)
3.  提交變更 (`git commit -m "Initial commit"`)
4.  在 GitHub 上建立一個新的 repository。
5.  將本地 repository 連接到遠端 GitHub repository。
6.  將程式碼推送到 GitHub (`git push origin main` 或 `git push origin master`)
7.  在 GitHub repository 的設定 (Settings) 中，找到 Pages 選項。
8.  選擇部署來源 (Source) 為你的主分支 (`main` 或 `master`)，根目錄 (`/root`)。
9.  儲存設定，稍等片刻 GitHub Pages 就會部署完成，並提供給你一個公開的網址。

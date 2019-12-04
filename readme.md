### 前端共學平台｜模擬專案 [點我](http://172.105.215.182/)
大家好，這是我在練習node.js時所完成的一份Side Project  
***
#### 網站簡介
 
**後端使用技術**： 
`node.js`+`express框架`+`MongoDB`
**前端使用技術**： 
`bootstrap`+`jquery`  
**網站主題**：
擁有完善會員功能的部落格，可以讓使用者分享自己的所學，並與他人進行互動
**美術設計**：
簡約式風格      
**功能說明**：
 + 用戶進行註冊、登入，即可在平台上發文，若無登入亦可採用訪客的方式閱覽
 + 每篇文章皆有按讚、回覆的功能，回覆的部分採用ajax的方式動態新增資料，因此可即時更新用戶所輸入的留言
 + 服務端使用session保存會員的登入狀態，並可以在網站上進行一些進階操作，例如刪除留言、文章管理、帳號設置等
 + 帳號設置方面，可以選擇編輯自己的個人簡介、聯絡方式等等，並可公開到自己的文章上。
 + 文章管理提供了簡單清楚的表格，可供用戶了解文章的詳細數據，並可進行刪除或編輯等操作。
 + 全網站支持RWD及移動端優化，可在不同裝置、瀏覽器下使用。

#### 開發歷程
        這次的專案並沒有使用任何前端框架，畢竟前後端都由自己一人開發，用傳統`Server Side Rendering`的模式對我來說是比較方便的。
    而且另一方面也想透過這個
    機會了解後端渲染的開發邏輯(現在應該還是有很多網站是以此種方式維護的吧)。  
        美術風格方面，老實說並沒有花太多心力去設計，還是將重點放在功能的實現上，但為了讓用戶可以更好的體驗，還是盡可能的讓網站風格表持一致，
    這次就用了比較多的bootstrap元件，但大部分還是花了些時間去重構，並對移動端的部分花了不少的心思優化。
        開發這個網站的初衷是想建立一套完善的會員系統，不過開始設計後才發現，可以優化或擴充的部分實在太多了，未來預計加入更多功能，
        例如個人小屋、進階帳號綁定、追蹤文章以及小鈴鐺功能等等。
        如果有任何建議，歡迎發Issue給我~感謝大家的閱讀。

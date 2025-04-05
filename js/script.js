class CatLifecycle {
    constructor() {
        this.stages = [
            { name: '幼貓', imagePath: 'images/stage0.png', requirements: { feed: 10, play: 5 }, variants: 1 },
            { name: '成長期', imagePath: 'images/stage1_', requirements: { feed: 10, play: 5 }, variants: 5 },
            { name: '我是大貓了', imagePath: 'images/stage2_', variants: 5 }
        ];

        this.state = {
            catName: '我的小貓咪', // 預設名稱
            stage: 0,
            feedCount: 0,
            playCount: 0,
            nameChangeCount: 0, // 新增：改名次數計數
            variant: 1,
            unlocked: { stage1: new Set(), stage2: new Set() },
            lastFeedTime: 0,
            lastPlayTime: 0
        };

        this.feedCooldown = 10000; // 10 秒
        this.playCooldown = 30000; // 30 秒

        this.feedButton = document.getElementById('feed-button');
        this.playButton = document.getElementById('play-button');
        this.catNameDisplay = document.getElementById('cat-name-display');
        this.catNameInput = document.getElementById('cat-name-input');
        this.changeNameButton = document.getElementById('change-name-button');
        this.catImage = document.getElementById('cat-image');
        this.stageTitle = document.getElementById('stage-title');
        this.feedCountDisplay = document.getElementById('feed-count');
        this.playCountDisplay = document.getElementById('play-count');
        this.feedRequiredDisplay = document.getElementById('feed-required');
        this.playRequiredDisplay = document.getElementById('play-required');

        // 新增：獲取重新養成按鈕
        this.restartButton = document.getElementById('restart-button');

        this.loadState();
        this.preloadImages();
        this.initUI();
        this.setupEventListeners();
        this.startCooldownTimers(); // 開始檢查冷卻
    }

    preloadImages() {
        [1, 2].forEach(stage => {
            for (let v = 1; v <= 5; v++) {
                new Image().src = `images/stage${stage}_${v}.png`;
            }
        });
        new Image().src = 'images/default_cat.png';
        // Preload interaction images
        new Image().src = 'images/feeding.png';
        new Image().src = 'images/playing.png';
    }

    saveState() {
        const stateToSave = {
            ...this.state,
            unlocked: {
                stage1: [...this.state.unlocked.stage1],
                stage2: [...this.state.unlocked.stage2]
            }
        };
        localStorage.setItem('catState', JSON.stringify(stateToSave));
    }

    loadState() {
        const saved = localStorage.getItem('catState');
        if (saved) {
            const data = JSON.parse(saved);
            // 合併載入的狀態，保留預設值以防萬一
            this.state = {
                ...this.state, // 保留預設值
                ...data,      // 覆蓋儲存的值
                nameChangeCount: data.nameChangeCount || 0, // 新增：載入計數或設為 0
                unlocked: {
                    stage1: new Set(data.unlocked?.stage1 || []),
                    stage2: new Set(data.unlocked?.stage2 || [])
                },
                // 確保時間戳是數字
                lastFeedTime: data.lastFeedTime || 0,
                lastPlayTime: data.lastPlayTime || 0 // Corrected typo here
            };
        }
    }

    initUI() {
        this.updateCatNameUI();
        this.updateUI();
    }

    setupEventListeners() {
        this.feedButton.onclick = () => this.interact('feed');
        this.playButton.onclick = () => this.interact('play');
        this.changeNameButton.onclick = () => this.changeCatName();
        this.catNameInput.onkeypress = (event) => {
            if (event.key === 'Enter') {
                this.changeCatName();
            }
        };

        // 圖片錯誤處理
        this.catImage.onerror = () => {
            this.catImage.src = 'images/default_cat.png';
            console.error('Error loading cat image, using default.');
        };

        // 為重新養成按鈕添加事件
        this.restartButton.onclick = () => this.restartGame();
    }

    changeCatName() {
        if (this.state.nameChangeCount >= 2) {
            this.catNameInput.value = ''; // Clear input even if limit reached
            if (confirm('名字已達修改次數上限 (2次)！\\n是否要重新養成？')) {
                this.restartGame();
            }
            // If user clicks Cancel, do nothing and continue the game.
            return;
        }

        const newName = this.catNameInput.value.trim();
        if (newName) {
            this.state.catName = newName;
            this.state.nameChangeCount++; // Increment count after successful change
            this.updateCatNameUI();
            this.updateUI(); // Updates stage title and other UI elements
            this.saveState();
            this.catNameInput.value = ''; // 清空輸入框

            // Optional: Alert remaining changes
            const remainingChanges = 2 - this.state.nameChangeCount;
            alert(`名字已更改！你還可以更改 ${remainingChanges} 次。`);

        } else {
            alert('貓咪名字不能為空！');
        }
    }

    updateCatNameUI() {
        this.catNameDisplay.textContent = this.state.catName;
    }

    interact(type) {
        if (this.isMaxStage()) return;

        const now = Date.now();
        if (type === 'feed') {
            if (now < this.state.lastFeedTime + this.feedCooldown) {
                console.log("Feed on cooldown");
                return; // 還在冷卻中
            }
            this.state.feedCount++;
            const originalSrc = this.getImageSrc(); // Store original image
            console.log(`[DEBUG] Interact: ${type}, Original src: ${originalSrc}`); // ADDED LOG
            this.catImage.src = 'images/feeding.png'; // Change to feeding image
            console.log(`[DEBUG] Interact: Changed src to ${this.catImage.src}`); // ADDED LOG
            setTimeout(() => {
                console.log(`[DEBUG] Timeout Feed: Current src: ${this.catImage.src}`); // UPDATED LOG
                // Only revert if the image is still the feeding image
                if (this.catImage.src.endsWith('feeding.png')) {
                    this.updateUI(); // Call full updateUI to revert image and sync UI
                    console.log(`[DEBUG] Timeout Feed: Reverted src via updateUI to ${this.catImage.src}`); // ADDED LOG
                }
            }, 3000); // Revert after 3 seconds
            this.state.lastFeedTime = now;
            this.updateButtonState('feed'); // 更新按鈕狀態並開始計時
        } else if (type === 'play') {
            if (now < this.state.lastPlayTime + this.playCooldown) {
                console.log("Play on cooldown");
                return; // 還在冷卻中
            }
            this.state.playCount++;
            const originalSrc = this.getImageSrc(); // Store original image
            console.log(`[DEBUG] Interact: ${type}, Original src: ${originalSrc}`); // ADDED LOG
            this.catImage.src = 'images/playing.png'; // Change to playing image
            console.log(`[DEBUG] Interact: Changed src to ${this.catImage.src}`); // ADDED LOG
            setTimeout(() => {
                console.log(`[DEBUG] Timeout Play: Current src: ${this.catImage.src}`); // UPDATED LOG
                // Only revert if the image is still the playing image
                if (this.catImage.src.endsWith('playing.png')) {
                    this.updateUI(); // Call full updateUI to revert image and sync UI
                    console.log(`[DEBUG] Timeout Play: Reverted src via updateUI to ${this.catImage.src}`); // ADDED LOG
                }
            }, 3000); // Revert after 3 seconds
            this.state.lastPlayTime = now;
            this.updateButtonState('play'); // 更新按鈕狀態並開始計時
        }

        if (this.checkRequirements()) {
            this.upgradeStage(); // upgradeStage calls updateUI internally, which is correct
        } else {
            // If no upgrade, update stats/buttons BUT skip immediate image overwrite
            this.updateUI(true);
        }

        this.saveState();
    }

    checkRequirements() {
        const req = this.stages[this.state.stage].requirements;
        return req && this.state.feedCount >= req.feed &&
               this.state.playCount >= req.play;
    }

    upgradeStage() {
        if (this.state.stage < this.stages.length - 1) {
            const nextStageIndex = this.state.stage + 1;
            const nextStage = this.stages[nextStageIndex];

            // Only choose a new variant when evolving from Kitten (stage 0) to Growing (stage 1)
            if (this.state.stage === 0) {
                // 隨機選擇一個變體 (1 到 3)
                const variant = Math.floor(Math.random() * 3) + 1;
                this.state.variant = variant;
            }
            // When evolving from Growing (1) to Full (2), keep the existing variant.

            this.state.stage = nextStageIndex;
            this.state.feedCount = 0; // 重置進度
            this.state.playCount = 0;

            console.log(`貓咪升級到 ${nextStage.name} (變體: ${this.state.variant})!`);
            this.saveState();
        }
    }

    getImageSrc() {
        const stage = this.stages[this.state.stage];
        if (!stage) return 'images/default_cat.png'; // 防錯
        return stage.variants > 1 ?
            `${stage.imagePath}${this.state.variant}.png` :
            stage.imagePath;
    }

    showVariantAlert() {
        const alert = document.createElement('div');
        alert.className = 'variant-alert';
        alert.innerHTML = `
            <span>🎉 解鎖 ${this.stages[this.state.stage].name} 型態 ${this.state.variant} 號！</span>
            <img src="${this.getImageSrc()}" width="50" alt="新貓咪型態">
        `;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 4000); // 顯示 4 秒
    }

    updateUI(skipImageUpdate = false) {
        if (!skipImageUpdate) {
            this.updateCatImage();
        }
        this.updateStats();
        this.updateRequirements();
        this.updateButtonCooldowns();
        this.stageTitle.textContent = `🐾 ${this.state.catName} - ${this.stages[this.state.stage].name}`; 
    }

    updateCatImage() {
        const currentStageData = this.stages[this.state.stage];

        // 更新圖片
        this.catImage.src = this.getImageSrc();
    }

    updateStats() {
        const currentStageData = this.stages[this.state.stage];

        // 更新進度數據
        if (currentStageData.requirements) {
            this.feedCountDisplay.textContent = this.state.feedCount;
            this.playCountDisplay.textContent = this.state.playCount;
            this.feedRequiredDisplay.textContent = currentStageData.requirements.feed;
            this.playRequiredDisplay.textContent = currentStageData.requirements.play;
        } else {
             // 如果是最終階段，可能隱藏或清空進度顯示
             this.feedCountDisplay.textContent = '-';
             this.playCountDisplay.textContent = '-';
             this.feedRequiredDisplay.textContent = '-';
             this.playRequiredDisplay.textContent = '-';
        }
    }

    updateRequirements() {
        const currentStageData = this.stages[this.state.stage];

        // 更新階段標題，除非已達成最終階段
        if (this.state.stage < 2) {
             // this.stageTitle.textContent = `🐾 ${currentStageData.name} 養成中`;
        }
    }

    updateButtonCooldowns() {
        // 根據是否為最大階段，決定是否顯示重新養成按鈕
        if (this.isMaxStage()) {
            this.restartButton.classList.remove('hidden');
        } else {
            this.restartButton.classList.add('hidden');
        }

         // 初始檢查按鈕狀態（加載時）
         this.updateButtonState('feed');
         this.updateButtonState('play');
    }

    resetCounters() {
        this.state.feedCount = 0;
        this.state.playCount = 0;
        // 不需要重置冷卻時間，因為階段升級本身就是一個事件
    }

    isMaxStage() {
        return this.state.stage >= 2;
    }

    updateButtonState(type) {
        const now = Date.now();
        let button, lastTime, cooldown, baseText;

        if (type === 'feed') {
            button = this.feedButton;
            lastTime = this.state.lastFeedTime;
            cooldown = this.feedCooldown;
            baseText = "餵食貓咪";
        } else {
            button = this.playButton;
            lastTime = this.state.lastPlayTime;
            cooldown = this.playCooldown;
            baseText = "陪貓玩耍";
        }

        const timeRemaining = lastTime + cooldown - now;

        if (this.isMaxStage() || timeRemaining > 0) {
            button.disabled = true;
            if(!this.isMaxStage()){
                const secondsLeft = Math.ceil(timeRemaining / 1000);
                button.textContent = `${baseText} (${secondsLeft}s)`;
            } else {
                 button.textContent = baseText; // Max stage, just disable
            }
        } else {
            button.disabled = false;
            button.textContent = baseText;
        }
    }

    startCooldownTimers() {
        setInterval(() => {
            if (!this.isMaxStage()) {
                this.updateButtonState('feed');
                this.updateButtonState('play');
            }
        }, 1000); // 每秒更新一次按鈕狀態
    }

    restartGame() {
        if (confirm('確定要重新養成一隻貓咪嗎？目前的進度將會消失！')) {
            localStorage.removeItem('catState'); // 只清除貓咪狀態
            location.reload(); // 重新載入頁面
        }
    }
}

// DOMContentLoaded 確保 HTML 完全載入後再執行 JS
document.addEventListener('DOMContentLoaded', () => {
    const catLifecycle = new CatLifecycle();
});

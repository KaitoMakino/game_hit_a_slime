// ページ読み込みが完了したら動かしたい処理
window.addEventListener('DOMContentLoaded', () => {
    const introContainer = document.getElementById('intro-container');
    const introLogo = document.getElementById('intro-logo');
    // ループ再生するBGMの要素を取得
    const bgm = document.getElementById('bgm');


    const titleContainer = document.getElementById('title-container');
    const buttonContainer = document.getElementById('button-container');
    const startButton = document.getElementById('start-button');
    const rankingButton = document.getElementById('ranking-button');
    const gameContainer = document.getElementById('game-container');
    const slime = document.getElementById('slime');
    const scoreDisplay = document.getElementById('score-display');
    const timeDisplay = document.getElementById('time-display');
    const endGameButton = document.getElementById('end-game-button');
    const finalScore = document.getElementById('final-score');
    const preGameDisplay = document.getElementById('pre-game-display');
    const rankingContainer = document.getElementById('ranking-container');
    const rankingList = document.getElementById('ranking-list');
    const backTitleButton = document.getElementById('back-title-button');

    /* ユーザーがイントロ画面をタッチしたら、タイトル画面を表示してBGM再生 */
    introContainer.addEventListener('click', () => {
        introContainer.style.display = 'none';
        titleContainer.style.display = 'flex';
        buttonContainer.style.display = 'flex';

        // BGMを再生
        bgm.play().catch(err => {
        console.log('Autoplay was prevented:', err);
        });
    });


    let score = 0;
    let timeLeft = 10;
    let timerInterval = null;
    let preGameInterval = null;
    let preGameTime = 3; // 3秒のカウントダウン用
  
    // GAME STARTボタンクリック時の処理
    startButton.addEventListener('click', () => {
        // 前回の結果が残っている場合にリセット
        finalScore.style.display = 'none';
        finalScore.textContent = 'Your Score: 0';
        score = 0;
        scoreDisplay.textContent = 'Score: ' + score;
        slime.style.display = 'none'; // 最初はスライムを非表示

        // タイトル関連を隠してゲーム画面を表示
        document.getElementById('title-container').style.display = 'none';
        document.getElementById('button-container').style.display = 'none';
        gameContainer.style.display = 'block';

        // 3秒のカウントダウン開始
        preGameTime = 3;
        preGameDisplay.textContent = preGameTime;
        preGameDisplay.style.display = 'block';

        preGameInterval = setInterval(() => {
            preGameTime--;
            if (preGameTime > 0) {
                // 1以上ならそのまま数字を表示
                preGameDisplay.textContent = preGameTime;
            } else {
                // 0以下になったら「START」表示
                preGameDisplay.textContent = 'START';
                clearInterval(preGameInterval);
                preGameInterval = null;
                // 1秒後に消してメインゲーム開始
                setTimeout(() => {
                  preGameDisplay.style.display = 'none';
                  startMainGame();
                }, 1000);
            }
        }, 1000);
    });
  
    // RANKINGボタンクリック時の処理
    rankingButton.addEventListener('click', () => {
        showRanking();
    });

    gameContainer.addEventListener('click', (e) => {
        if (e.target === slime) {
            score++;
            scoreDisplay.textContent = 'Score: ' + score;
            placeSlimeRandomly();
        }
    });

    // ゲームを終了するボタンを押したら名前入力 → スコア保存 → ランキング画面表示
    endGameButton.addEventListener('click', () => {
        endGame(false);
    });

    // ランキング画面からタイトルに戻る
    backTitleButton.addEventListener('click', () => {
        rankingContainer.style.display = 'none';
        document.getElementById('title-container').style.display = 'flex';
        document.getElementById('button-container').style.display = 'flex';
    });

    function startMainGame() {
        // スライムを表示してランダム配置
        slime.style.display = 'block';
        placeSlimeRandomly();
    
        // 10秒のカウントダウン
        timeLeft = 10;
        timeDisplay.textContent = 'Time: ' + timeLeft;
        timerInterval = setInterval(() => {
          timeLeft--;
          timeDisplay.textContent = 'Time: ' + timeLeft;
          if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            endGame(true);
          }
        }, 1000);
    }

    // ゲーム終了処理 → ユーザー名入力 → ローカルストレージに保存 → ランキング表示
    function endGame(autoEnd) {
        clearInterval(timerInterval);
        timerInterval = null;
        clearInterval(preGameInterval);
        preGameInterval = null;

        // スコアを画面中央に表示
        finalScore.textContent = 'Your Score: ' + score;
        finalScore.style.display = 'block';

        // 少し待ってから名前入力画面へ進む
        setTimeout(() => {
            const playerName = prompt('名前を入力してください');
            if (playerName) {
                saveScore(playerName, score);
            }
            gameContainer.style.display = 'none';
            showRanking();
        }, 2000);
    }

    function placeSlimeRandomly() {
        const containerRect = gameContainer.getBoundingClientRect();
        const slimeWidth = 80;
        const slimeHeight = 80;
        const maxLeft = containerRect.width - slimeWidth;
        const maxTop = containerRect.height - slimeHeight;
        const randomLeft = Math.floor(Math.random() * maxLeft);
        const randomTop = Math.floor(Math.random() * maxTop);
        slime.style.left = randomLeft + 'px';
        slime.style.top = randomTop + 'px';
    }

    // スコアをローカルストレージに保存する
    function saveScore(name, newScore) {
        // 既存のランキング情報を取得
        let rankingData = localStorage.getItem('rankingData');
        if (!rankingData) {
            rankingData = [];
        } else {
            rankingData = JSON.parse(rankingData);
        }

        rankingData.push({ name: name, score: newScore }); // 新しいスコアを追加
        rankingData.sort((a, b) => b.score - a.score); // スコアの降順に並べ替え
        rankingData = rankingData.slice(0, 10); // 上位10名だけ残す
        localStorage.setItem('rankingData', JSON.stringify(rankingData)); // ローカルストレージに再保存
    }

    // ランキングを表示
    function showRanking() {
        // ランキングデータを取得
        let rankingData = localStorage.getItem('rankingData');
        if (!rankingData) {
            rankingData = [];
        } else {
            rankingData = JSON.parse(rankingData);
        }

        // 一旦リストをクリア
        rankingList.innerHTML = '';

        // ランキングリストを作成
        rankingData.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}位 : ${item.name} - ${item.score}点`;
        rankingList.appendChild(li);
        });

        // ゲームコンテナやタイトルを隠してランキングコンテナを表示
        document.getElementById('title-container').style.display = 'none';
        document.getElementById('button-container').style.display = 'none';
        gameContainer.style.display = 'none';
        rankingContainer.style.display = 'block';
    }
  });
  
// Symbols for cards
const allSymbols = [
    '🍕', '🍔', '🍟', '🌭', '🍿', '🍩', '🍪', '🍦',
    '🍫', '🍰', '🧁', '🍎', '🍉', '🍓', '🥥', '🍇',
];

let cards = [], firstCard = null, secondCard = null;
let lock = false, moves = 0, matchedPairs = 0;
let gameActive = false, hints = 3;
let timerInterval = null, timeElapsed = 0;
let symbolCount = 8; // default to Easy

// DOM Elements
const board = document.getElementById('game-board');
const moveCount = document.getElementById('move-count');
const message = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const endBtn = document.getElementById('end-btn');
const hintBtn = document.getElementById('hint-btn');
const hintsLeft = document.getElementById('hints-left');
const timerDisplay = document.getElementById('timer');

const easyBtn = document.getElementById('easy-btn');
const mediumBtn = document.getElementById('medium-btn');
const hardBtn = document.getElementById('hard-btn');

const controlsDiv = document.getElementById('controls');
const statusDiv = document.getElementById('status');
const overlay = document.getElementById('overlay');
const overlayContent = document.getElementById('overlay-content');
const overlayStartBtn = document.getElementById('overlay-start-btn');

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function renderBoard() {
    board.innerHTML = '';
    cards.forEach((symbol, i) => {
        const card = document.createElement('div');
        card.className = 'card hidden';
        card.dataset.symbol = symbol;
        card.dataset.index = i;
        card.innerText = symbol;
        card.style.color = 'transparent';
        board.appendChild(card);

        card.onclick = () => revealCard(card);
    });
}

function revealCard(card) {
    if (lock || card.classList.contains('flipped') || !gameActive) return;

    card.classList.remove('hidden');
    card.classList.add('flipped');
    card.style.color = '';

    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card;
        lock = true;
        moves++;
        moveCount.textContent = moves;

        if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
            setTimeout(() => {
                firstCard.classList.add('matched', 'disabled');
                secondCard.classList.add('matched', 'disabled');

                firstCard.style.color = '';
                secondCard.style.color = '';

                matchedPairs++;
                if (matchedPairs === symbolCount) {
                    showResult(true);
                }
                resetCards();
            }, 700);
        } else {
            setTimeout(() => {
                flipBackCard(firstCard);
                flipBackCard(secondCard);
                resetCards();
            }, 1000);
        }
    }
}

function flipBackCard(card) {
    card.classList.remove('flipped');
    card.classList.add('hidden');
    card.style.color = 'transparent';
}

function resetCards() {
    firstCard = null;
    secondCard = null;
    lock = false;
}

function startTimer() {
    timerDisplay.textContent = 0;
    timeElapsed = 0;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeElapsed++;
        timerDisplay.textContent = timeElapsed;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function startGame() {
    moves = 0; matchedPairs = 0; lock = false; hints = 3; gameActive = true;
    moveCount.textContent = moves;
    hintsLeft.textContent = hints;
    overlay.classList.add('hidden');
    controlsDiv.style.display = 'block';
    board.style.display = 'flex';
    statusDiv.style.display = 'block';

    startBtn.disabled = true;
    endBtn.disabled = false;
    hintBtn.disabled = false;
    disableDifficultyButtons(true);

    let gameSymbols = allSymbols.slice(0, symbolCount);
    cards = shuffle([...gameSymbols, ...gameSymbols]);
    renderBoard();
    startTimer();
}

function endGame() {
    if (!gameActive) return;

    gameActive = false;
    lock = true;
    endBtn.disabled = true;
    hintBtn.disabled = true;
    startBtn.disabled = false;
    stopTimer();
    disableDifficultyButtons(false);

    const cardEls = document.querySelectorAll('.card');
    cardEls.forEach(card => {
        card.classList.remove('hidden', 'flipped');
        card.classList.add('disabled');
        card.style.color = ''; // show text
    });

    showResult(false);
    resetCards();
}

function showResult(won) {
    overlay.classList.remove('hidden');
    controlsDiv.style.display = 'none';
    board.style.display = 'none';
    statusDiv.style.display = 'none';

    overlayContent.innerHTML = `
        <h3>${won ? 'Congratulations, You Won! 🎉' : 'Game Ended'}</h3>
        <p>Moves taken: <strong>${moves}</strong></p>
        <p>Time elapsed: <strong>${timeElapsed}</strong> seconds</p>
        <button id="overlay-start-btn" class="btn btn-primary mt-3">Start New Game</button>
      `;

    // Re-bind start button event
    document.getElementById('overlay-start-btn').addEventListener('click', () => {
        overlay.classList.add('hidden');
        controlsDiv.style.display = 'block';
        board.style.display = 'flex';
        statusDiv.style.display = 'block';
        startGame();
    });
}

function hint() {
    if (hints <= 0 || !gameActive || lock) return;

    const unmatched = [];
    const cardEls = Array.from(document.getElementsByClassName('card'));
    cardEls.forEach(card => {
        if (!card.classList.contains('matched') && !card.classList.contains('flipped')) {
            unmatched.push(card);
        }
    });
    if (unmatched.length < 2) return;

    let pairFound = false;
    for (let i = 0; i < unmatched.length; i++) {
        for (let j = i + 1; j < unmatched.length; j++) {
            if (unmatched[i].dataset.symbol === unmatched[j].dataset.symbol) {
                pairFound = true;

                unmatched[i].classList.remove('hidden');
                unmatched[j].classList.remove('hidden');
                unmatched[i].classList.add('flipped');
                unmatched[j].classList.add('flipped');
                unmatched[i].style.color = '';
                unmatched[j].style.color = '';

                lock = true;

                setTimeout(() => {
                    flipBackCard(unmatched[i]);
                    flipBackCard(unmatched[j]);
                    lock = false;
                }, 1500);

                break;
            }
        }
        if (pairFound) break;
    }

    hints--;
    hintsLeft.textContent = hints;
    if (hints === 0) hintBtn.disabled = true;
}

function disableDifficultyButtons(flag) {
    easyBtn.disabled = flag;
    mediumBtn.disabled = flag;
    hardBtn.disabled = flag;

    if (flag) {
        easyBtn.classList.remove('active');
        mediumBtn.classList.remove('active');
        hardBtn.classList.remove('active');
    }
}

// Difficulty selection
easyBtn.addEventListener('click', () => {
    if (gameActive) return;
    symbolCount = 8;
    setActiveDifficulty(easyBtn);
    startBtn.disabled = false;
});
mediumBtn.addEventListener('click', () => {
    if (gameActive) return;
    symbolCount = 12;
    setActiveDifficulty(mediumBtn);
    startBtn.disabled = false;
});
hardBtn.addEventListener('click', () => {
    if (gameActive) return;
    symbolCount = 16;
    setActiveDifficulty(hardBtn);
    startBtn.disabled = false;
});

function setActiveDifficulty(activeBtn) {
    [easyBtn, mediumBtn, hardBtn].forEach(btn => {
        btn.classList.toggle('active', btn === activeBtn);
    });
}

startBtn.addEventListener('click', startGame);
endBtn.addEventListener('click', () => {
    if (!gameActive) return;
    endGame();
});
hintBtn.addEventListener('click', hint);

// Initial setup: show overlay with instructions, disable controls
controlsDiv.style.display = 'none';
board.style.display = 'none';
statusDiv.style.display = 'none';

// Bind overlay start button to start game
overlayStartBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    controlsDiv.style.display = 'block';
    board.style.display = 'flex';
    statusDiv.style.display = 'block';
    startBtn.disabled = false; // enable start after difficulty chosen
});
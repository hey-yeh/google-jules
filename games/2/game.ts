// --- Game Configuration ---
const MAX_WORD_GUESSES = 3;
const MAX_PHRASE_GUESSES = 3;
const PHRASES = [
    "SUPER MARIO BROS",
    "THE LEGEND OF ZELDA",
    "SONIC THE HEDGEHOG",
    "FINAL FANTASY",
    "METAL GEAR SOLID",
    "GRAND THEFT AUTO",
    "MINECRAFT",
    "OVERWATCH",
    "FORTNITE",
    "PAC MAN"
];

// --- Game State ---
let currentPhrase = "";
let hiddenPhrase: string[] = [];
let wordGuessesLeft = MAX_WORD_GUESSES;
let phraseGuessesLeft = MAX_PHRASE_GUESSES;
let revealedLetters: Set<string> = new Set();
let gameOver = false;
let gameWon = false;

// --- HTML Element Placeholders (to be properly selected in main script) ---
// These are conceptual. Actual DOM selection will happen in a main script
// that loads this game logic. For now, we'll define functions that would
// interact with these elements.

function updatePhraseDisplay() {
    // In a real scenario, this would update an HTML element.
    // For now, it can console.log or be called by other functions.
    const displayString = hiddenPhrase.map(char => char === "SPACE_MARKER" ? "    " : char).join(" "); // Changed to 4 spaces
    console.log("Phrase Display:", displayString);
    document.getElementById('phrase-display')!.textContent = displayString;
}

function updateGuessesLeftDisplay() {
    console.log(`Word Guesses: ${wordGuessesLeft}, Phrase Guesses: ${phraseGuessesLeft}`);
    document.getElementById('guesses-left-display')!.textContent = `Word Guesses: ${wordGuessesLeft}, Phrase Guesses: ${phraseGuessesLeft}`;
}

function displayMessage(message: string) {
    console.log("Message:", message);
    document.getElementById('message-area')!.textContent = message;
}

// --- Game Logic ---

function selectNewPhrase(): string {
    const randomIndex = Math.floor(Math.random() * PHRASES.length);
    return PHRASES[randomIndex].toUpperCase();
}

function initializeHiddenPhrase() {
    hiddenPhrase = currentPhrase.split("").map(char => (char === " " ? "SPACE_MARKER" : "_"));
}

function startGame() {
    currentPhrase = selectNewPhrase();
    revealedLetters.clear();
    initializeHiddenPhrase();
    wordGuessesLeft = MAX_WORD_GUESSES;
    phraseGuessesLeft = MAX_PHRASE_GUESSES;
    gameOver = false;
    gameWon = false;

    // Initial UI updates
    updatePhraseDisplay();
    updateGuessesLeftDisplay();
    displayMessage("New game started! Guess a word.");
    console.log("Game started. Phrase: ", currentPhrase); // For debugging
}

// --- New Main Guess Handling Function ---
function submitGuess(guessedWord: string) {
    if (gameOver) {
        displayMessage("The game is over. Please start a new game.");
        return;
    }

    if (guessedWord.trim() === "") {
        displayMessage("Please enter a guess.");
        return;
    }

    if (guessedWord.includes(' ') || wordGuessesLeft === 0) {
        // Treat as a phrase guess if it contains a space OR if no word guesses are left
        if (phraseGuessesLeft > 0) {
            handlePhraseGuess(guessedWord);
        } else {
            displayMessage("No phrase guesses left.");
        }
    } else {
        // Treat as a word guess if it's a single word AND word guesses are left
        handleWordGuess(guessedWord);
    }
}

function handleWordGuess(guessedWord: string) {
    // NOTE: Space check is now done in submitGuess
    if (gameOver || wordGuessesLeft === 0) { // This check might be slightly redundant if submitGuess is perfect, but good for safety
        displayMessage("Cannot guess word. Game might be over or no word guesses left.");
        return;
    }

    guessedWord = guessedWord.toUpperCase();
    let lettersRevealedThisTurn = false;

    for (const letter of guessedWord) {
        if (currentPhrase.includes(letter) && !revealedLetters.has(letter)) {
            revealedLetters.add(letter);
            lettersRevealedThisTurn = true;
        }
    }

    if (lettersRevealedThisTurn) {
        for (let i = 0; i < currentPhrase.length; i++) {
            if (revealedLetters.has(currentPhrase[i])) {
                hiddenPhrase[i] = currentPhrase[i];
            }
        }
        updatePhraseDisplay();
        displayMessage("Correct letters revealed!");
        if (hiddenPhrase.join("") === currentPhrase) {
            winGame();
            return;
        }
    } else {
        displayMessage("No new letters revealed with that word.");
    }

    wordGuessesLeft--;
    updateGuessesLeftDisplay();

    if (wordGuessesLeft === 0) {
        displayMessage("No word guesses left. Try guessing the phrase.");
    }
}

function handlePhraseGuess(guessedPhrase: string) {
    if (gameOver) { // This check might be slightly redundant too
        displayMessage("Cannot guess phrase. Game is over.");
        return;
    }
    if (phraseGuessesLeft === 0) { // Also potentially redundant
        displayMessage("No phrase guesses left.");
        return;
    }

    guessedPhrase = guessedPhrase.toUpperCase();
    phraseGuessesLeft--;

    if (guessedPhrase === currentPhrase) {
        winGame();
    } else {
        updateGuessesLeftDisplay();
        if (phraseGuessesLeft === 0) {
            loseGame("Wrong phrase. No phrase guesses left.");
        } else {
            displayMessage("Incorrect phrase. Try again.");
        }
    }
}

function winGame() {
    gameOver = true;
    gameWon = true;
    hiddenPhrase = currentPhrase.split(""); // Reveal everything
    updatePhraseDisplay();
    displayMessage("Congratulations! You guessed the phrase!");
}

function loseGame(message: string = "Game Over. You didn't guess the phrase.") {
    gameOver = true;
    gameWon = false;
    // Optionally reveal the phrase on loss
    // hiddenPhrase = currentPhrase.split("");
    // updatePhraseDisplay();
    displayMessage(message);
}

// --- Event Listener Setup (Conceptual) ---
// This part would typically be in the HTML/main script to connect buttons to these functions.
// For example:
// document.getElementById('guess-button').addEventListener('click', () => {
// const guessValue = (document.getElementById('guess-input') as HTMLInputElement).value;
// if (wordGuessesLeft > 0) {
// handleWordGuess(guessValue);
// } else {
// handlePhraseGuess(guessValue);
// }
// });
// document.getElementById('new-game-button').addEventListener('click', startGame);


// --- Initial setup ---
// Call startGame() when the script loads, or triggered by a button in HTML.
// For testing purposes, we can call it here.
// In a real Phaser game, this logic would be part of a Scene's create/update methods.
// For now, this will make the functions available globally when this script is included.

// Expose functions to be called from HTML
(window as any).game = {
    startGame,
    submitGuess, // New main entry point for guesses
    handleWordGuess, // Keep for now
    handlePhraseGuess, // Keep for now
    getState: () => ({
        currentPhrase,
        hiddenPhrase: hiddenPhrase.join(" "), // This is a string representation
        wordGuessesLeft,
        phraseGuessesLeft,
        gameOver,
        gameWon
    }),
    // Expose UI update functions
    displayMessage,
    updatePhraseDisplay, // Though called internally, exposing it doesn't hurt
    updateGuessesLeftDisplay // Same as above
};

// Initial call to set things up if this script were run directly.
// In the context of index.html, startGame will be called by a button.
// startGame(); // Commenting out for now, will be triggered by HTML.

console.log("game.ts loaded");

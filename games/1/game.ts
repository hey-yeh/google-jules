/// <reference types="phaser" />

class MainScene extends Phaser.Scene {
    score: number;
    shapes: string[];
    shapeObjects: Phaser.GameObjects.Graphics[] = [];
    shapeSize: number = Math.min(window.innerWidth, window.innerHeight) * 0.2;
    padding: number = 20;
    instructionTextObject: Phaser.GameObjects.Text | null = null;
    currentInstruction: { shape: string, type: 'POSITIVE' | 'NEGATIVE' } | null = null;
    scoreTextObject: Phaser.GameObjects.Text | null = null;
    gameOverContainer: Phaser.GameObjects.Container | null = null;
    // Add other necessary properties here e.g. instructionText, shapesOnScreen, etc.

    constructor() {
        super({ key: 'MainScene' });
        this.score = 0;
        this.shapes = ['square', 'triangle', 'star', 'circle'];
    }

    preload() {
        // For basic shapes, we'll use Phaser's Graphics object, so no assets to load for now.
        // If we were using images, we would load them here, e.g.:
        // this.load.image('square', 'assets/square.png');
    }

    create() {
        // Log to console to confirm scene creation
        console.log('MainScene created. Initial score:', this.score);
        console.log('Available shapes:', this.shapes);

        // Game width and height
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        console.log(`Game dimensions: ${gameWidth}x${gameHeight}`);

        // Placeholder for instruction text
        // this.instructionText = this.add.text(gameWidth / 2, 50, 'Instruction Text Placeholder', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        this.displayShapes();
        this.generateInstruction();

        // Initialize and display score text
        this.scoreTextObject = this.add.text(
            20, 
            20, 
            `Score: ${this.score}`, 
            { 
                fontFamily: 'Arial',
                fontSize: '24px', 
                color: '#ffffff' 
            }
        );
    }

    update() {
        // Game loop, if needed for continuous updates
    }

    displayShapes() {
        this.shapeObjects.forEach(shape => shape.destroy());
        this.shapeObjects = [];

        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        let shuffledShapes = Phaser.Utils.Array.Shuffle([...this.shapes]);

        const gridWidth = 2 * this.shapeSize + this.padding;
        const gridHeight = 2 * this.shapeSize + this.padding;
        const startX = (gameWidth - gridWidth) / 2 + this.shapeSize / 2;
        // Adjusted startY to be a bit lower, e.g., 60% of the way down or after some offset for text
        const startY = (gameHeight - gridHeight) / 2 + this.shapeSize / 2 + (gameHeight * 0.1);


        for (let i = 0; i < 2; i++) { // Rows
            for (let j = 0; j < 2; j++) { // Columns
                const x = startX + j * (this.shapeSize + this.padding);
                const y = startY + i * (this.shapeSize + this.padding);

                const shapeType = shuffledShapes.pop(); 
                if (!shapeType) continue; // Should not happen if logic is correct

                const graphics = this.add.graphics();
                graphics.fillStyle(0xffffff, 1); // White color

                switch (shapeType) {
                    case 'square':
                        graphics.fillRect(-this.shapeSize / 2, -this.shapeSize / 2, this.shapeSize, this.shapeSize);
                        break;
                    case 'triangle':
                        const side = this.shapeSize;
                        const height = side * Math.sqrt(3) / 2;
                        graphics.beginPath();
                        graphics.moveTo(0, -height / 2); // Top point
                        graphics.lineTo(side / 2, height / 2); // Bottom right
                        graphics.lineTo(-side / 2, height / 2); // Bottom left
                        graphics.closePath();
                        graphics.fillPath();
                        break;
                    case 'star':
                        graphics.beginPath();
                        let outerRadius = this.shapeSize / 2;
                        let innerRadius = this.shapeSize / 4;
                        for (let k = 0; k < 5; k++) {
                            const angle = -Math.PI / 2 + (k * 2 * Math.PI / 5); // Start from top
                            graphics.lineTo(outerRadius * Math.cos(angle), outerRadius * Math.sin(angle));
                            const innerAngle = angle + Math.PI / 5;
                            graphics.lineTo(innerRadius * Math.cos(innerAngle), innerRadius * Math.sin(innerAngle));
                        }
                        graphics.closePath();
                        graphics.fillPath();
                        break;
                    case 'circle':
                        graphics.fillCircle(0, 0, this.shapeSize / 2);
                        break;
                }

                graphics.setPosition(x, y);
                // Using a rectangle for interaction for all shapes for simplicity for now
                graphics.setInteractive(new Phaser.Geom.Rectangle(-this.shapeSize/2, -this.shapeSize/2, this.shapeSize, this.shapeSize), Phaser.Geom.Rectangle.Contains);
                graphics.on('pointerdown', () => this.handleShapeTap(shapeType as string));
                this.shapeObjects.push(graphics);
            }
        }
    }

    handleShapeTap(shapeName: string) {
        if (!this.currentInstruction) {
            console.error('No current instruction set. This should not happen.');
            return; 
        }

        let correctTap = false;
        const instructedShape = this.currentInstruction.shape;
        const instructionType = this.currentInstruction.type;

        if (instructionType === 'POSITIVE') {
            if (shapeName === instructedShape) {
                correctTap = true;
            }
        } else { // NEGATIVE instruction ("NOT SHAPE")
            if (shapeName !== instructedShape) {
                correctTap = true;
            }
        }

        if (correctTap) {
            this.score++;
            if (this.scoreTextObject) {
                this.scoreTextObject.setText(`Score: ${this.score}`);
            }
            console.log('Correct tap! Score:', this.score);
            // Generate new shapes and instruction for the next round
            this.displayShapes();
            this.generateInstruction();
        } else {
            console.log('Incorrect tap! Game Over.');
            // Trigger game over sequence
            this.gameOver(); 
        }
    }

    gameOver() {
        console.log('Game Over sequence started. Final Score:', this.score);

        // Disable interaction with shapes
        this.shapeObjects.forEach(shape => shape.disableInteractive());
        if (this.instructionTextObject) {
            this.instructionTextObject.setVisible(false); // Hide instruction
        }
         if (this.scoreTextObject) {
            this.scoreTextObject.setVisible(false); // Hide score during game over
        }


        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        // Create a semi-transparent background for the dialog
        const background = this.add.graphics();
        background.fillStyle(0x000000, 0.7); // Black, 70% opacity
        background.fillRect(0, 0, gameWidth, gameHeight);

        // Game Over Text
        const gameOverText = this.add.text(
            gameWidth / 2, 
            gameHeight / 2 - 100, 
            'GAME OVER', 
            { fontFamily: 'Arial', fontSize: '48px', color: '#ff0000', align: 'center' }
        ).setOrigin(0.5);

        // Final Score Text
        const finalScoreText = this.add.text(
            gameWidth / 2, 
            gameHeight / 2 - 30, 
            `You got ${this.score} correct!`, 
            { fontFamily: 'Arial', fontSize: '32px', color: '#ffffff', align: 'center' }
        ).setOrigin(0.5);

        // Try Again Button
        const tryAgainButton = this.add.text(
            gameWidth / 2, 
            gameHeight / 2 + 50, 
            'Try Again', 
            { 
                fontFamily: 'Arial', 
                fontSize: '32px', 
                color: '#00ff00', // Green color for button
                backgroundColor: '#333333', // Dark background for button
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive();

        tryAgainButton.on('pointerdown', () => {
            this.tryAgain();
        });
        
        tryAgainButton.on('pointerover', () => {
            tryAgainButton.setStyle({ color: '#88ff88' }); // Lighter green on hover
        });
        tryAgainButton.on('pointerout', () => {
            tryAgainButton.setStyle({ color: '#00ff00' }); // Original green
        });


        // Group them in a container
        this.gameOverContainer = this.add.container(0, 0, [background, gameOverText, finalScoreText, tryAgainButton]);
    }

    tryAgain() {
        console.log('Try Again clicked');

        // Reset score
        this.score = 0;
        if (this.scoreTextObject) {
            this.scoreTextObject.setText(`Score: ${this.score}`);
            this.scoreTextObject.setVisible(true); // Make score visible again
        }
        
        if (this.instructionTextObject) {
            this.instructionTextObject.setVisible(true); // Make instruction visible again
        }


        // Remove Game Over UI
        if (this.gameOverContainer) {
            this.gameOverContainer.destroy();
            this.gameOverContainer = null;
        }

        // Re-enable shapes (they will be redrawn and made interactive by displayShapes)
        // No specific action needed here as displayShapes will handle it.

        // Start a new game
        this.displayShapes(); // This will also re-enable interactivity on new shapes
        this.generateInstruction();
    }

    generateInstruction() {
        const randomShapeIndex = Phaser.Math.Between(0, this.shapes.length - 1);
        const selectedShape = this.shapes[randomShapeIndex];
        const instructionType = Phaser.Math.Between(0, 1) === 0 ? 'POSITIVE' : 'NEGATIVE';
        this.currentInstruction = { shape: selectedShape, type: instructionType };

        let instructionString = '';
        if (this.currentInstruction.type === 'POSITIVE') {
            instructionString = `TAP ${this.currentInstruction.shape.toUpperCase()}`;
        } else {
            instructionString = `TAP NOT ${this.currentInstruction.shape.toUpperCase()}`;
        }

        const gameWidth = this.cameras.main.width;
        if (this.instructionTextObject) {
            this.instructionTextObject.setText(instructionString).setPosition(gameWidth / 2, 50).setOrigin(0.5);
        } else {
            this.instructionTextObject = this.add.text(
                gameWidth / 2, 
                50, // Positioned at the top-middle
                instructionString, 
                { 
                    fontFamily: 'Arial', // Basic font
                    fontSize: '32px', 
                    color: '#ffffff', // White color
                    align: 'center' 
                }
            ).setOrigin(0.5);
        }
        console.log('Current instruction:', this.currentInstruction);
    }

    // We will add more methods here for:
    // tryAgain()
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'phaser-game-container', // ID of the div to inject the canvas
    scene: MainScene,
    backgroundColor: '#222222', // Match body background, though canvas will cover it
    // No physics needed for this simple game yet
    // physics: {
    //     default: 'arcade',
    //     arcade: {
    //         debug: false
    //     }
    // }
};

const game = new Phaser.Game(config);

import { Game } from '@/game';

// Create a new game instance with the specified attributes
const game = new Game({
    name: 'Sample Game',
    version: '1.0.0',
});

// Listen for the game start event
game.onStart.connect(() => {
    console.log(`${game.name} has started!`);
});

// Listen for the game stop event
game.onStop.connect(() => {
    console.log(`${game.name} has stopped!`);
});

// Start the game
game.start();

// Stop the game after some time (for demonstration purposes)
setTimeout(() => {
    game.stop();
}, 5000);

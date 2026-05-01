import { Game } from '@/game';
import { Controller } from '@modules/controller/controller';
import { Standard } from '@modules/controller/other/devices/keyboard/components/standard';
import { Keyboard } from '@modules/controller/other/devices/keyboard/keyboard';
import { DigitalKey } from '@modules/controller/other/devices/other/digitalKey';

// Create a new game instance
const game = new Game({
    name: 'Sample Game',
    version: '1.0.0',
});

// Create a new controller instance
const controller = new Controller({ parent: game });

// Create a new keyboard instance and add it to the controller
const keyboard = new Keyboard({});
controller.addToDevices(keyboard);

// Create a new standard component and add it to the keyboard
const standard = new Standard({});
keyboard.addToComponents(standard);

// Create a new digital key instance
const spaceKey = new DigitalKey({
    name: 'My Digital Key',
    id: 'Space',
    description: 'A digital key for testing purposes',
});

// Connect to the onPress signal of the digital key
spaceKey.onPress.connect(() => {
    console.log('Digital key pressed!');
});

// Connect to the onRelease signal of the digital key
spaceKey.onRelease.connect(() => {
    console.log('Digital key released!');
});

// Add the digital key to the standard component
standard.addToKeys(spaceKey);

// Start the game
game.start();

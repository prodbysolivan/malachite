import { Game } from '@/game';
import { Module, type ModuleAttributes } from '@/modules/module';

// Define the attributes for the custom module, extending the base ModuleAttributes
export interface CustomModuleAttributes extends ModuleAttributes {
    customAttribute: string;
}

// Create a new custom module class that extends the base Module class
export class CustomModule extends Module {
    customAttribute: string;

    public constructor(attributes: CustomModuleAttributes) {
        super(attributes); // Call the base class constructor with the attributes
        this.customAttribute = attributes.customAttribute;

        // Connect to the onStart signal with persistency
        this.onStart.connect(() => {
            console.log('CustomModule has started!');
        }, true);

        // Connect to the onStop signal with persistency
        this.onStop.connect(() => {
            console.log('CustomModule has stopped!');
        }, true);
    }

    // Example function to demonstrate functionality
    public customFunction(): void {
        console.log(`Custom attribute value: ${this.customAttribute}`);
    }
}

// Create a new game instance
const game = new Game({
    name: 'Sample Game',
    version: '1.0.0',
});

// Create an instance of the custom module with the required attributes
const customModule = new CustomModule({
    parent: game,
    name: 'Custom Module',
    description: 'A custom module for demonstration purposes.',
    version: '1.0.0',
    dependencies: [],
    customAttribute: 'This is a custom property value.',
});

// Add the custom module to the game
game.addToModules(customModule);

// Start the game
game.start();

// Stop the module after some time (for demonstration purposes)
setTimeout(() => {
    customModule.stop();
}, 5000);

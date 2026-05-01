import { Component } from '../../other/component';
import { DigitalKey } from '../../other/digitalKey';

export class Standard extends Component {
    // Lifecycle
    private _handlers: Map<string, (e: KeyboardEvent) => void> = new Map();

    constructor() {
        super({
            id: 'standard',
            name: 'Standard',
            description: 'Dynamic Input Mapper',
        });
    }

    // Functions
    public override load(): void {
        super.load();
        const handleKeyEvent = (event: KeyboardEvent) => {
            const key = Array.from(this.keys.values()).find(
                (k) => k instanceof DigitalKey && k.id === event.code,
            ) as DigitalKey | undefined;

            if (key) {
                if (event.type === 'keydown') {
                    key.press();
                } else {
                    key.release();
                }
            }
        };

        window.addEventListener('keydown', handleKeyEvent);
        window.addEventListener('keyup', handleKeyEvent);

        this._handlers.set('keyboard', handleKeyEvent);
    }

    public override unload(): void {
        const keyboardHandler = this._handlers.get('keyboard');
        if (keyboardHandler) {
            window.removeEventListener('keydown', keyboardHandler);
            window.removeEventListener('keyup', keyboardHandler);
        }

        this._handlers.clear();
        super.unload();
    }
}

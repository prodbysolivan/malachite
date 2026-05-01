import { Standard } from './components/standard';
import { Device } from '../device';

export class Keyboard extends Device {
    constructor() {
        super({
            id: 'malachite.controller.keyboard',
            name: 'Keyboard',
            description: 'Standard HID Keyboard Device',
        });

        const standard = new Standard();
        this.addToComponents(standard);
    }

    public override load(): void {
        super.load();
    }

    public override update(deltaTime: number): void {
        super.update(deltaTime);
    }

    public override unload(): void {
        super.unload();
    }
}

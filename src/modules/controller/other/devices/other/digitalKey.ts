import { Signal, type ExposedSignal } from '../../../../../common/events/signal';
import { Key, type KeyAttributes } from './key';

export interface DigitalKeyAttributes extends KeyAttributes {
    id: string;
}

export class DigitalKey extends Key {
    // Lifecycle
    private _isPressed: boolean = false;

    // Signals
    private readonly _onPress: Signal<[]> = new Signal();
    public readonly onPress: ExposedSignal<[]> = this._onPress.exposed;
    private readonly _onRelease: Signal<[]> = new Signal();
    public readonly onRelease: ExposedSignal<[]> = this._onRelease.exposed;

    constructor(attributes: DigitalKeyAttributes) {
        super(attributes);
    }

    // Getters
    public get isPressed(): boolean {
        return this._isPressed;
    }

    // Functions
    public override update(deltaTime: number): void {
        super.update(deltaTime);
    }

    public press(): void {
        if (this._isPressed) return;
        this._isPressed = true;
        this._onPress.fire();
    }

    public release(): void {
        if (!this._isPressed) return;
        this._isPressed = false;
        this._onRelease.fire();
    }

    public override unload(): void {
        super.unload();
        this._onPress.clear();
        this._onRelease.clear();
    }
}

import { Signal, type ExposedSignal } from '../../../../../common/events/signal';
import type { IUpdatable } from '../../../../../common/interfaces/updatable';

export interface KeyAttributes {
    id: string;
    name?: string;
    description?: string;
}

export class Key implements IUpdatable {
    // Attributes
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;

    // Signals
    private readonly _onLoad: Signal<[]> = new Signal();
    public readonly onLoad: ExposedSignal<[]> = this._onLoad.exposed;
    private readonly _onUnLoad: Signal<[]> = new Signal();
    public readonly onUnLoad: ExposedSignal<[]> = this._onUnLoad.exposed;
    private readonly _onUpdate: Signal<[number]> = new Signal();
    public readonly onUpdate: ExposedSignal<[number]> = this._onUpdate.exposed;

    constructor(attributes: KeyAttributes) {
        this.id = attributes.id;
        this.name = attributes.name ?? this.id;
        this.description = attributes.description ?? 'No description provided';
    }

    //Functions
    public update(deltaTime: number): void {
        this._onUpdate.fire(deltaTime);
    }

    public load(): void {
        this._onLoad.fire();
    }

    public unload(): void {
        this._onUnLoad.fire();
        this._onLoad.clear();
        this._onUnLoad.clear();
        this._onUpdate.clear();
    }
}

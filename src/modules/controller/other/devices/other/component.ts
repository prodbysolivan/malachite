import { Signal, type IReadOnlySignal } from '../../../../../common/events/signal';
import type { IUpdatable } from '../../../../../common/interfaces/updatable';
import type { Key } from './key';

export interface ComponentAttributes {
    id: string;
    name?: string;
    description?: string;
}

export class Component implements IUpdatable {
    // Attributes
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;

    // Lifecycle
    public enabled: boolean = true;
    private _keys: Map<string, Key> = new Map<string, Key>();

    // Signals
    private readonly _onLoad: Signal<[]> = new Signal();
    public readonly onLoad: IReadOnlySignal<[]> = this._onLoad.public;
    private readonly _onUnLoad: Signal<[]> = new Signal();
    public readonly onUnLoad: IReadOnlySignal<[]> = this._onUnLoad.public;
    private readonly _onUpdate: Signal<[number]> = new Signal();
    public readonly onUpdate: IReadOnlySignal<[number]> = this._onUpdate.public;

    constructor(attributes: ComponentAttributes) {
        this.id = attributes.id;
        this.name = attributes.name ?? this.id;
        this.description = attributes.description ?? 'No description provided';
    }

    // Getters
    public get keys(): ReadonlyMap<string, Key> {
        return this._keys;
    }

    // Functions
    public update(deltaTime: number): void {
        if (!this.enabled) return;
        for (const key of this._keys.values()) {
            key.update(deltaTime);
        }
        this._onUpdate.fire(deltaTime);
    }

    public load(): void {
        for (const key of this._keys.values()) {
            key.load();
        }
        this._onLoad.fire();
    }

    public unload(): void {
        for (const key of this._keys.values()) {
            key.unload();
        }
        this._onUnLoad.fire();

        // Limpieza de señales
        this._onLoad.clear();
        this._onUnLoad.clear();
        this._onUpdate.clear();
    }

    public addToKeys(key: Key): void {
        if (this._keys.has(key.id)) {
            throw new Error(`Key with ID ${key.id} is already registered in component ${this.id}`);
        }
        this._keys.set(key.id, key);
    }

    public removeFromKeys(key: Key): void {
        if (!this._keys.has(key.id)) {
            throw new Error(`Key with ID ${key.id} is not part of component ${this.id}`);
        }
        this._keys.delete(key.id);
    }

    public getFromKeys(targetId: string): Key {
        const key = this._keys.get(targetId);
        if (!key) {
            throw new Error(`Key with ID ${targetId} could not be found in component ${this.id}`);
        }
        return key;
    }

    public hasFromKeys(targetId: string): boolean {
        return this._keys.has(targetId);
    }
}

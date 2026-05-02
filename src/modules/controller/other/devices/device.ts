import { Signal, type ExposedSignal } from '../../../../common/events/signal';
import type { IUpdatable } from '../../../../common/interfaces/updatable';
import type { Component } from './other/component';

export interface DeviceAttributes {
    id: string;
    name?: string;
    description?: string;
    components?: Map<string, Component>;
}

export class Device implements IUpdatable {
    // Attributes
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;

    // Lifecycle
    public enabled: boolean = true;
    private _components: Map<string, Component>;

    // Signals
    private readonly _onLoad: Signal<[]> = new Signal();
    public readonly onLoad: ExposedSignal<[]> = this._onLoad.exposed;
    private readonly _onUnLoad: Signal<[]> = new Signal();
    public readonly onUnLoad: ExposedSignal<[]> = this._onUnLoad.exposed;
    private readonly _onUpdate: Signal<[number]> = new Signal();
    public readonly onUpdate: ExposedSignal<[number]> = this._onUpdate.exposed;

    constructor(attributes: DeviceAttributes) {
        this.id = attributes.id;
        this.name = attributes.name ?? this.id;
        this.description = attributes.description ?? 'No description provided';
        this._components = attributes.components ?? new Map<string, Component>();
    }

    // Getters
    public get components(): ReadonlyMap<string, Component> {
        return this._components;
    }

    // Functions
    public update(deltaTime: number): void {
        if (!this.enabled) return;

        for (const component of this._components.values()) {
            component.update(deltaTime);
        }
        this._onUpdate.fire(deltaTime);
    }

    public load(): void {
        for (const component of this._components.values()) {
            component.load();
        }
        this._onLoad.fire();
    }

    public unload(): void {
        for (const component of this._components.values()) {
            component.unload();
        }
        this._onUnLoad.fire();

        this._onLoad.clear();
        this._onUnLoad.clear();
        this._onUpdate.clear();
    }

    public addToComponents(component: Component): void {
        if (this._components.has(component.id)) {
            throw new Error(
                `Component with ID ${component.id} (${component.name}) is already added to device ${this.id}`,
            );
        }
        this._components.set(component.id, component);
    }

    public removeFromComponents(component: Component): void {
        if (!this._components.has(component.id)) {
            throw new Error(
                `Component with ID ${component.id} (${component.name}) is not part of device ${this.id}`,
            );
        }
        this._components.delete(component.id);
    }

    public getFromComponents(targetId: string): Component {
        const component = this._components.get(targetId);
        if (!component) {
            throw new Error(
                `Component with ID ${targetId} could not be found in device ${this.id}`,
            );
        }
        return component;
    }

    public hasFromComponents(targetId: string): boolean {
        return this._components.has(targetId);
    }
}

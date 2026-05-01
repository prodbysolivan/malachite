import type { IModuleDependency } from '@/common/interfaces/moduleDependency';
import type { Game } from '@/game';
import { Signal, type IReadOnlySignal } from '@common/events/signal';
import type { IUpdatable } from '@common/interfaces/updatable';

export interface ModuleAttributes {
    parent: Game;
    id: string;
    name: string;
    description?: string;
    version: string;
    order?: number;
    dependencies?: IModuleDependency[];
}

export enum ModuleState {
    Idle,

    Starting,
    Running,
    Stopping,
    Failed,
}

export class Module implements IUpdatable {
    // Attributes
    public readonly parent: Game;
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly version: string;
    public readonly order: number;
    public readonly dependencies: IModuleDependency[];

    // Lifecycle
    protected _state: ModuleState = ModuleState.Idle;

    // Signals
    private readonly _onStart: Signal<[]> = new Signal();
    public readonly onStart: IReadOnlySignal<[]> = this._onStart.public;
    private readonly _onStop: Signal<[]> = new Signal();
    public readonly onStop: IReadOnlySignal<[]> = this._onStop.public;
    private readonly _onUpdate: Signal<[number]> = new Signal();
    public readonly onUpdate: IReadOnlySignal<[number]> = this._onUpdate.public;

    constructor(attributes: ModuleAttributes) {
        this.parent = attributes.parent;
        this.id = attributes.id;
        this.name = attributes.name ?? this.id;
        this.description = attributes.description ?? 'No description provided';
        this.version = attributes.version ?? '1.0.0';
        this.order = attributes.order ?? 0;
        this.dependencies = attributes.dependencies ?? [];
    }

    // Getters
    public get state(): ModuleState {
        return this._state;
    }

    // Functions
    public update(deltaTime: number): void {
        if (this._state !== ModuleState.Running) {
            throw new Error(`Cannot update module while in state ${ModuleState[this._state]}`);
        }
        this._onUpdate.fire(deltaTime);
    }

    public start(): ModuleState | null {
        if (this._state !== ModuleState.Idle && this._state !== ModuleState.Starting) {
            throw new Error(`Cannot start module while in state ${ModuleState[this._state]}`);
        }
        try {
            this._onStart.fire();
            this._state = ModuleState.Running;
            return this._state;
        } catch (error) {
            this._state = ModuleState.Failed;
            throw Error(
                `Failed to start module: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    public stop(): ModuleState | null {
        if (this._state !== ModuleState.Running && this._state !== ModuleState.Stopping) {
            throw new Error(`Cannot stop module while in state ${ModuleState[this._state]}`);
        }
        try {
            this._onStop.fire();
            this._state = ModuleState.Idle;
            return this._state;
        } catch (error) {
            this._state = ModuleState.Failed;
            throw Error(
                `Failed to stop module: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

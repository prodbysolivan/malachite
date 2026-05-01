import { Signal, type IReadOnlySignal } from './common/events/signal';
import type { IModuleDependency } from './common/interfaces/moduleDependency';
import type { Module } from './modules/module';

export interface GameAttributes {
    name: string;
    version: string;
}

enum GameState {
    Idle,
    Starting,
    Running,
    Stopping,
    Failed,
}

export class Game {
    // Attributes
    public readonly name: string;
    public readonly version: string;

    // Lifecycle
    private _state: GameState = GameState.Idle;
    private readonly modules: Module[] = [];

    // Signals
    private readonly _onStart: Signal<[]> = new Signal();
    public readonly onStart: IReadOnlySignal<[]> = this._onStart.public;
    private readonly _onStop: Signal<[]> = new Signal();
    public readonly onStop: IReadOnlySignal<[]> = this._onStop.public;

    constructor(attributes: GameAttributes) {
        this.name = attributes.name ?? 'Game';
        this.version = attributes.version ?? '1.0.0';
    }

    // Getters
    public get state(): GameState {
        return this._state;
    }

    // Functions
    private validateDependencies(): void {
        const reports: string[] = [];

        for (const module of this.modules) {
            const dependencies: IModuleDependency[] = module.dependencies ?? [];
            const missing: string[] = [];
            const orderErrors: string[] = [];

            for (const dependency of dependencies) {
                const exists = this.hasFromModules(dependency.id);

                if (!exists) {
                    if (!dependency.optional) {
                        missing.push(dependency.id);
                    }
                    continue;
                }

                const provider = this.getFromModules(dependency.id);

                if (module.order < provider.order) {
                    orderErrors.push(
                        `"${dependency.id}" (Order: ${provider.order}) starts AFTER this module (Order: ${module.order}). ` +
                            `Lower the provider's order or increase this module's order.`,
                    );
                }
            }

            if (missing.length > 0 || orderErrors.length > 0) {
                let report = `[${module.id} (${module.name})]:`;

                if (missing.length > 0) {
                    const label = missing.length === 1 ? 'missing module' : 'missing modules';
                    report += `\n  - requires ${label}: ${missing.map((m) => `"${m}"`).join(', ')}`;
                }

                if (orderErrors.length > 0) {
                    report += `\n  - sequence errors:\n    * ${orderErrors.join('\n    * ')}`;
                }

                reports.push(report);
            }
        }

        if (reports.length > 0) {
            throw new Error(`Dependency Validation Failed:\n\n${reports.join('\n\n')}`);
        }
    }

    public addToModules(module: Module): void {
        if (this.modules.some((m) => m.id === module.id)) {
            throw new Error(
                `Module with ID ${module.id} (${module.name}) is already added to the game`,
            );
        }
        this.modules.push(module);
        this.modules.sort((a, b) => a.order - b.order);
    }

    public removeFromModules(module: Module): void {
        const index = this.modules.findIndex((m) => m.id === module.id);
        if (index === -1) {
            throw new Error(
                `Module with ID ${module.id} (${module.name}) is not added to the game`,
            );
        }
        this.modules.splice(index, 1);
    }

    public getFromModules(targetId: string): Module {
        const module = this.modules.find((m) => m.id === targetId);
        if (!module) {
            throw new Error(`Module with ID ${targetId} could not be found in the game engine`);
        }
        return module;
    }

    public hasFromModules(targetId: string): boolean {
        return this.modules.some((module) => module.id === targetId);
    }

    public start(): GameState | null {
        if (this._state !== GameState.Idle) {
            throw new Error(`Cannot start game while in state ${GameState[this._state]}`);
        }

        this.validateDependencies();

        try {
            this._state = GameState.Starting;

            for (const module of this.modules) {
                module.start();
            }

            this._state = GameState.Running;
            this._onStart.fire();

            return this._state;
        } catch (error) {
            this._state = GameState.Failed;
            throw Error(
                `Failed to start game: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    public stop(): GameState | null {
        if (this._state !== GameState.Running) {
            throw new Error(`Cannot stop game while in state ${GameState[this._state]}`);
        }
        try {
            this._state = GameState.Stopping;

            for (let i = this.modules.length - 1; i >= 0; i--) {
                const module = this.modules[i];
                if (module) module.stop();
            }

            this._onStop.fire();
            this._state = GameState.Idle;

            return this._state;
        } catch (error) {
            this._state = GameState.Failed;
            throw Error(
                `Failed to stop game: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }
}

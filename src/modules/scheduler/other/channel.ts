import type { IUpdatable } from '@/common/interfaces/updatable';
import { Signal, type IReadOnlySignal } from '@common/events/signal';

export interface ChannelAttributes {
    id: string;
    name?: string;
    description?: string;
    framerate?: number;
}

export class Channel {
    // Attributes
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly framerate: number;

    // Lifecycle
    public enabled: boolean = true;
    private _entries: IUpdatable[] = [];
    private _accumulator: number = 0;

    // Signals
    private readonly _onUpdate: Signal<[number]> = new Signal();
    public readonly onUpdate: IReadOnlySignal<[number]> = this._onUpdate.public;

    constructor(attributes: ChannelAttributes) {
        this.id = attributes.id;
        this.name = attributes.name ?? 'Channel';
        this.description = attributes.description ?? 'No description provided';
        this.framerate = attributes.framerate ?? 0;
    }

    // Getters
    public get entries(): ReadonlyArray<IUpdatable> {
        return this._entries;
    }

    // Functions
    public addToEntries(entry: IUpdatable): void {
        this._entries.push(entry);
    }

    public removeFromEntries(entry: IUpdatable): void {
        const index = this._entries.indexOf(entry);
        if (index !== -1) {
            this._entries.splice(index, 1);
        }
    }

    public update(deltaTime: number): void {
        if (!this.enabled) return;

        if (this.framerate <= 0) {
            this._accumulator = 0;
            const currentEntries = [...this._entries];
            for (const entry of currentEntries) {
                entry.update(deltaTime);
            }
            this._onUpdate.fire(deltaTime);
        } else {
            const targetInterval = 1 / this.framerate;
            this._accumulator += deltaTime;

            while (this._accumulator >= targetInterval) {
                const currentEntries = [...this._entries];
                for (const entry of currentEntries) {
                    entry.update(targetInterval);
                }
                this._onUpdate.fire(targetInterval);
                this._accumulator -= targetInterval;
            }
        }
    }
}

import type { Game } from '../../game';
import { Module, ModuleState } from '../module';
import type { Channel } from './other/channel';

export interface SchedulerAttributes {
    parent: Game;
}

export class Scheduler extends Module {
    // Lifecycle
    private _channels: Channel[] = [];
    private _lastTime: number = 0;
    private _frameId: number | null = null;

    constructor(attributes: SchedulerAttributes) {
        super({
            parent: attributes.parent,
            id: 'scheduler',
            name: 'Scheduler',
            description: 'A module responsible for managing scheduled tasks and updates',
            version: '1.0.0',
            order: 0,
        });

        // Connections
        this.onStart.connect(() => {
            this._lastTime = performance.now();

            const loop = (currentTime: number): void => {
                if (this.state !== ModuleState.Running) return;

                const deltaTime = (currentTime - this._lastTime) / 1000;
                this._lastTime = currentTime;

                for (const channel of [...this._channels]) {
                    channel.update(deltaTime);
                }

                this._frameId = requestAnimationFrame(loop);
            };

            this._frameId = requestAnimationFrame(loop);
        }, true);

        this.onStop.connect(() => {
            if (this._frameId !== null) {
                cancelAnimationFrame(this._frameId);
                this._frameId = null;
            }
        }, true);
    }

    // Getters
    public get channels(): ReadonlyArray<Channel> {
        return this._channels;
    }

    // Functions
    public addToChannels(channel: Channel): void {
        if (this._channels.some((c) => c.id === channel.id)) {
            throw new Error(`Channel with ID ${channel.id} (${channel.name}) is already added`);
        }
        this._channels.push(channel);
    }

    public removeFromChannels(channel: Channel): void {
        const index = this._channels.findIndex((c) => c.id === channel.id);
        if (index === -1) {
            throw new Error(
                `Channel with ID ${channel.id} (${channel.name}) is not part of the game`,
            );
        }
        this._channels.splice(index, 1);
    }

    public getFromChannels(targetId: string): Channel {
        const channel = this._channels.find((c) => c.id === targetId);
        if (!channel) {
            throw new Error(`Channel with ID ${targetId} could not be found`);
        }
        return channel;
    }

    public hasFromChannels(targetId: string): boolean {
        return this._channels.some((c) => c.id === targetId);
    }
}

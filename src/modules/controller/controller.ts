import type { Game } from '../../game';
import { Module } from '../module';
import type { Device } from './other/devices/device';

export interface ControllerAttributes {
    parent: Game;
}

export class Controller extends Module {
    // Lifecycle
    private _devices = new Map<string, Device>();

    constructor(attributes: ControllerAttributes) {
        super({
            parent: attributes.parent,
            id: 'controller',
            name: 'Controller',
            description: 'A module responsible for managing input logic',
            version: '1.0.0',
            order: 1,
        });

        // Connections
        this.onStart.connect(() => {
            try {
                for (const device of this._devices.values()) {
                    device.load();
                }
            } catch (error) {
                throw new Error(
                    `Failed to load controller devices: ${error instanceof Error ? error.message : String(error)}`,
                );
            }
        }, true);

        this.onStop.connect(() => {
            try {
                for (const device of this._devices.values()) {
                    device.unload();
                }
            } catch (error) {
                throw new Error(
                    `Failed to unload controller devices: ${error instanceof Error ? error.message : String(error)}`,
                );
            }
        }, true);
    }

    // Getters
    public get devices(): ReadonlyMap<string, Device> {
        return this._devices;
    }

    // Functions
    public override update(deltaTime: number): void {
        for (const device of this._devices.values()) {
            device.update(deltaTime);
        }
        super.update(deltaTime);
    }

    public addToDevices(device: Device): void {
        if (this._devices.has(device.id)) {
            throw new Error(
                `Device with ID ${device.id} (${device.name}) is already added to the controller`,
            );
        }
        this._devices.set(device.id, device);
    }

    public removeFromDevices(device: Device): void {
        if (!this._devices.has(device.id)) {
            throw new Error(
                `Device with ID ${device.id} (${device.name}) is not part of the controller`,
            );
        }
        this._devices.delete(device.id);
    }

    public getFromDevices(targetId: string): Device {
        const device = this._devices.get(targetId);
        if (!device) {
            throw new Error(`Device with ID ${targetId} could not be found in the controller`);
        }
        return device;
    }

    public hasFromDevices(targetId: string): boolean {
        return this._devices.has(targetId);
    }
}

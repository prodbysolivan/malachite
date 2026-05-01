import { Game } from '@/game';
import { Controller } from '@modules/controller/controller';
import { Device } from '@modules/controller/other/devices/device';
import { ModuleState } from '@modules/module';
import { beforeEach, describe, expect, test } from 'bun:test';

describe('Controller Module', () => {
    let game: Game;
    let controller: Controller;

    beforeEach(() => {
        game = new Game({ name: 'ControllerTest', version: '1.0.0' });
        controller = new Controller({ parent: game });
    });

    describe('Device Administration', () => {
        test('should register and retrieve devices by id', () => {
            const device = new Device({ id: 'gamepad-v', name: 'VirtualGamepad' });
            controller.addToDevices(device);

            expect(controller.hasFromDevices('gamepad-v')).toBe(true);
            expect(controller.getFromDevices('gamepad-v')).toBe(device);
        });

        test('should remove devices from the internal map', () => {
            const device = new Device({ id: 'mouse-1', name: 'Mouse' });
            controller.addToDevices(device);
            controller.removeFromDevices(device);

            expect(controller.hasFromDevices('mouse-1')).toBe(false);
            expect(controller.devices.size).toBe(0);
        });

        test('should throw error for non-existent devices', () => {
            expect(() => controller.getFromDevices('Unknown')).toThrow(/could not be found/);
        });
    });

    describe('Data Integrity', () => {
        test('devices property should return a ReadonlyMap', () => {
            const device = new Device({ id: 'kb-1', name: 'Keyboard' });
            controller.addToDevices(device);

            expect(controller.devices instanceof Map).toBe(true);
            expect(controller.devices.get('kb-1')).toBe(device);
        });

        test('should throw error if adding a new one with the same id', () => {
            const device1 = new Device({ id: 'shared', name: 'Shared One' });
            const device2 = new Device({ id: 'shared', name: 'Shared Two' });

            controller.addToDevices(device1);
            expect(() => controller.addToDevices(device2)).toThrow(/already added/);
        });

        test('should throw error when removing devices not present in the map', () => {
            const device = new Device({ id: 'external', name: 'External' });
            expect(() => controller.removeFromDevices(device)).toThrow(
                /not part of the controller/,
            );
        });
    });

    describe('Lifecycle & Propagation', () => {
        test('should call load on all devices when starting', () => {
            let loaded = false;
            const device = new Device({ id: 'test-device', name: 'TestDevice' });
            device.load = () => {
                loaded = true;
            };

            controller.addToDevices(device);
            controller.start();

            expect(loaded).toBe(true);
            expect(controller.state).toBe(ModuleState.Running);
        });

        test('should call unload on all devices when stopping', () => {
            let unloaded = false;
            const device = new Device({ id: 'test-device', name: 'TestDevice' });
            device.unload = () => {
                unloaded = true;
            };

            controller.addToDevices(device);
            controller.start();
            controller.stop();

            expect(unloaded).toBe(true);
            expect(controller.state).toBe(ModuleState.Idle);
        });

        test('should propagate update to all registered devices', () => {
            let capturedDt = 0;
            const device = new Device({ id: 'test-device', name: 'TestDevice' });
            device.update = (dt) => {
                capturedDt = dt;
            };

            controller.addToDevices(device);

            controller.start();
            controller.update(0.016);

            expect(capturedDt).toBe(0.016);
        });

        test('should fail state if a device fails to load', () => {
            const brokenDevice = new Device({ id: 'broken', name: 'Broken' });
            brokenDevice.load = () => {
                throw new Error('Hardware failure');
            };

            controller.addToDevices(brokenDevice);

            expect(() => controller.start()).toThrow(/Failed to load controller devices/);
            expect(controller.state).toBe(ModuleState.Failed);
        });
    });
});

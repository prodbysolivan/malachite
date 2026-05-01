import { Game } from '../../src/game';
import { ModuleState } from '../../src/modules/module';
import { Channel } from '../../src/modules/scheduler/other/channel';
import { Scheduler } from '../../src/modules/scheduler/scheduler';
import { beforeEach, describe, expect, test } from 'bun:test';

global.performance = { now: () => Date.now() } as any;
global.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16) as any;
global.cancelAnimationFrame = (id) => clearTimeout(id);

describe('Scheduler Module', () => {
    let game: Game;
    let scheduler: Scheduler;

    beforeEach(() => {
        game = new Game({ name: 'SchedTest', version: '1.0.0' });
        scheduler = new Scheduler({ parent: game });
    });

    describe('Channel Administration', () => {
        test('should add and retrieve channels by name', () => {
            const channel = new Channel({ id: 'physics', name: 'Physics', framerate: 60 });
            scheduler.addToChannels(channel);

            expect(scheduler.hasFromChannels('physics')).toBe(true);
            expect(scheduler.getFromChannels('physics')).toBe(channel);
        });

        test('should remove channels from the internal list', () => {
            const channel = new Channel({ id: 'render', name: 'Render', framerate: 0 });
            scheduler.addToChannels(channel);
            scheduler.removeFromChannels(channel);

            expect(scheduler.hasFromChannels('render')).toBe(false);
            expect(scheduler.channels.length).toBe(0);
        });
    });

    describe('Lifecycle', () => {
        test('should initialize with correct default properties', () => {
            expect(scheduler.name).toBe('Scheduler');
            expect(scheduler.order).toBe(0);
            expect(scheduler.state).toBe(ModuleState.Idle);
        });

        test('should prevent starting if already running', () => {
            scheduler.start();
            expect(() => scheduler.start()).toThrow();

            scheduler.stop();
        });
    });

    describe('Data Integrity', () => {
        test('channels property should return a ReadonlyArray', () => {
            const channel = new Channel({ id: 'strict', name: 'Strict', framerate: 0 });
            scheduler.addToChannels(channel);

            expect(Array.isArray(scheduler.channels)).toBe(true);
            expect(scheduler.channels[0]).toBe(channel);
        });

        test('should throw error when removing non-existent channels', () => {
            const real = new Channel({ id: 'real', name: 'Real', framerate: 0 });
            const fake = new Channel({ id: 'fake', name: 'Fake', framerate: 0 });

            scheduler.addToChannels(real);

            expect(() => scheduler.removeFromChannels(fake)).toThrow(
                `Channel with ID fake (Fake) is not part of the game`,
            );

            expect(scheduler.channels.length).toBe(1);
            expect(scheduler.channels[0]).toBe(real);
        });
    });
});

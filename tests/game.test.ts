import { Game } from '@/game';
import { Module } from '@modules/module';
import { describe, expect, test } from 'bun:test';

describe('Game Class', () => {
    describe('Module Management', () => {
        test('should add and retrieve modules by ID', () => {
            const game = new Game({ name: 'Game', version: '1.0.0' });
            const module = new Module({
                parent: game,
                id: 'core-id',
                name: 'CoreModule',
                version: '1.0.0',
            });

            game.addToModules(module);
            expect(game.hasFromModules('core-id')).toBe(true);
            expect(game.getFromModules('core-id')).toBe(module);
        });

        test('should remove modules from the registry by ID', () => {
            const game = new Game({ name: 'Game', version: '1.0.0' });
            const module = new Module({
                parent: game,
                id: 'temp-id',
                name: 'TempModule',
                version: '1.0.0',
            });

            game.addToModules(module);
            game.removeFromModules(module);
            expect(game.hasFromModules('temp-id')).toBe(false);
        });

        test('should sort modules based on order priority', () => {
            const game = new Game({ name: 'SortGame', version: '1.0.0' });
            const m1 = new Module({
                parent: game,
                id: 'm1',
                name: 'Late',
                order: 100,
                version: '1.0.0',
            });
            const m2 = new Module({
                parent: game,
                id: 'm2',
                name: 'Early',
                order: 10,
                version: '1.0.0',
            });

            game.addToModules(m1);
            game.addToModules(m2);

            // Accedemos a la propiedad privada mediante casting para el test
            const internalModules = (game as any).modules;
            expect(internalModules[0]).toBe(m2);
            expect(internalModules[1]).toBe(m1);
        });
    });

    describe('Lifecycle & Sequence', () => {
        test('should validate dependencies by ID before starting', () => {
            const game = new Game({ name: 'Game', version: '1.0.0' });
            const module = new Module({
                parent: game,
                id: 'main-id',
                name: 'Main',
                version: '1.0.0',
                dependencies: [{ id: 'missing-id', optional: false }],
            });

            game.addToModules(module);
            expect(() => game.start()).toThrow(/Dependency Validation Failed/);
        });

        test('should transition through states correctly', () => {
            const game = new Game({ name: 'Game', version: '1.0.0' });

            expect(game.state).toBe(0); // Idle
            game.start();
            expect(game.state).toBe(2); // Running
            game.stop();
            expect(game.state).toBe(0); // Idle
        });

        test('should fail state on module crash during start', () => {
            const game = new Game({ name: 'Game', version: '1.0.0' });
            const module = new Module({
                parent: game,
                id: 'broken-id',
                name: 'Broken',
                version: '1.0.0',
            });

            module.onStart.connect(() => {
                throw new Error('Crash');
            });
            game.addToModules(module);

            expect(() => game.start()).toThrow();
            expect(game.state).toBe(4); // Failed
        });
    });

    describe('Data Integrity', () => {
        test('should throw error if adding the same module ID twice', () => {
            const game = new Game({ name: 'Game', version: '1.0.0' });
            const m1 = new Module({ parent: game, id: 'same-id', name: 'One', version: '1.0.0' });
            const m2 = new Module({ parent: game, id: 'same-id', name: 'Two', version: '1.0.0' });

            game.addToModules(m1);
            expect(() => game.addToModules(m2)).toThrow(/already added/);
        });

        test('should throw error when removing a non-existent module', () => {
            const game = new Game({ name: 'Game', version: '1.0.0' });
            const module = new Module({
                parent: game,
                id: 'ghost-id',
                name: 'Ghost',
                version: '1.0.0',
            });

            expect(() => game.removeFromModules(module)).toThrow(/not added to the game/);
        });

        test('should throw error when getting a non-existent module ID', () => {
            const game = new Game({ name: 'Game', version: '1.0.0' });
            expect(() => game.getFromModules('invalid-id')).toThrow(/could not be found/);
        });
    });
});

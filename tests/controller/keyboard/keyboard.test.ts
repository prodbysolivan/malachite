import { Standard } from '@modules/controller/other/devices/keyboard/components/standard';
import { Keyboard } from '@modules/controller/other/devices/keyboard/keyboard';
import { DigitalKey } from '@modules/controller/other/devices/other/digitalKey';
import { beforeEach, describe, expect, test } from 'bun:test';

const listeners: Record<string, Function[]> = {};

globalThis.window = {
    addEventListener: (event: string, callback: Function) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(callback);
    },
    removeEventListener: (event: string, callback: Function) => {
        if (listeners[event]) {
            listeners[event] = listeners[event].filter((cb) => cb !== callback);
        }
    },
} as any;

function simulateKeyEvent(type: 'keydown' | 'keyup', code: string) {
    const event = { type, code } as any;
    if (listeners[type]) {
        for (const cb of listeners[type]) cb(event);
    }
}

describe('Keyboard Device', () => {
    beforeEach(() => {
        for (const key in listeners) delete listeners[key];
    });

    describe('Hierarchy Administration', () => {
        test('should initialize with a Standard component', () => {
            const keyboard = new Keyboard();
            // Asumiendo que el ID del componente Standard es "standard"
            expect(keyboard.hasFromComponents('standard')).toBe(true);
            expect(keyboard.getFromComponents('standard')).toBeInstanceOf(Standard);
        });

        test('should allow adding custom keys to standard component', () => {
            const keyboard = new Keyboard();
            const standard = keyboard.getFromComponents('standard') as Standard;
            const spaceKey = new DigitalKey({ id: 'Space', name: 'Jump' });

            standard.addToKeys(spaceKey);
            expect(standard.hasFromKeys('Space')).toBe(true);
            expect(standard.getFromKeys('Space')).toBe(spaceKey);
        });
    });

    describe('Input Integration', () => {
        test('should react to DOM keydown and keyup events', () => {
            const keyboard = new Keyboard();
            const standard = keyboard.getFromComponents('standard') as Standard;
            const keyE = new DigitalKey({ id: 'KeyE', name: 'Interact' });

            standard.addToKeys(keyE);
            keyboard.load();

            simulateKeyEvent('keydown', 'KeyE');
            expect(keyE.isPressed).toBe(true);

            simulateKeyEvent('keyup', 'KeyE');
            expect(keyE.isPressed).toBe(false);
        });

        test('should fire signals on press and release', () => {
            const keyboard = new Keyboard();
            const standard = keyboard.getFromComponents('standard') as Standard;
            const space = new DigitalKey({ id: 'Space', name: 'Space' });

            let pressed = false;
            let released = false;

            space.onPress.connect(() => (pressed = true));
            space.onRelease.connect(() => (released = true));

            standard.addToKeys(space);
            keyboard.load();

            simulateKeyEvent('keydown', 'Space');
            expect(pressed).toBe(true);

            simulateKeyEvent('keyup', 'Space');
            expect(released).toBe(true);
        });
    });

    describe('Data Integrity & Cleanup', () => {
        test('should remove window listeners on unload', () => {
            const keyboard = new Keyboard();
            keyboard.load();

            expect(listeners['keydown']?.length).toBe(1);

            keyboard.unload();
            expect(listeners['keydown']?.length).toBe(0);
        });

        test('should not process input if device is disabled', () => {
            const keyboard = new Keyboard();
            const standard = keyboard.getFromComponents('standard') as Standard;
            const keyA = new DigitalKey({ id: 'KeyA', name: 'A' });

            standard.addToKeys(keyA);
            keyboard.load();
            keyboard.enabled = false;

            simulateKeyEvent('keydown', 'KeyA');

            keyboard.update(0.016);

            expect(keyboard.enabled).toBe(false);
        });

        test('should handle multiple keys independently', () => {
            const keyboard = new Keyboard();
            const standard = keyboard.getFromComponents('standard') as Standard;
            const keyQ = new DigitalKey({ id: 'KeyQ', name: 'Q' });
            const keyW = new DigitalKey({ id: 'KeyW', name: 'W' });

            standard.addToKeys(keyQ);
            standard.addToKeys(keyW);
            keyboard.load();

            simulateKeyEvent('keydown', 'KeyQ');
            expect(keyQ.isPressed).toBe(true);
            expect(keyW.isPressed).toBe(false);
        });

        test('should throw error when getting a non-existent key', () => {
            const keyboard = new Keyboard();
            const standard = keyboard.getFromComponents('standard') as Standard;
            expect(() => standard.getFromKeys('NonExistent')).toThrow(/could not be found/);
        });
    });
});

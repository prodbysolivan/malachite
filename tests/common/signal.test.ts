import { Signal } from '../../src/common/events/signal';
import { describe, expect, mock, test } from 'bun:test';

describe('Signal Class', () => {
    test('should execute listeners in the correct priority (persistent first)', () => {
        const signal = new Signal<[string]>();
        const executionOrder: string[] = [];

        signal.connect((message) => executionOrder.push(`Normal: ${message}`), false);
        signal.connect((message) => executionOrder.push(`Persistent: ${message}`), true);

        signal.fire('test');

        expect(executionOrder[0]).toBe('Persistent: test');
        expect(executionOrder[1]).toBe('Normal: test');
    });

    test('should allow surgical disconnection via connection token', () => {
        const signal = new Signal();
        let calls = 0;
        const _function = () => calls++;

        const connection1 = signal.connect(_function);
        const connection2 = signal.connect(_function);

        connection1.disconnect();
        signal.fire();

        expect(calls).toBe(1);
    });

    test('should disconnect all instances of a function using shared disconnect', () => {
        const signal = new Signal();
        let calls = 0;
        const _function = () => calls++;

        signal.connect(_function);
        signal.connect(_function);

        signal.disconnect(_function);
        signal.fire();

        expect(calls).toBe(0);
    });

    test('should handle once() correctly and self-detach', () => {
        const signal = new Signal<[number]>();
        let calls = 0;
        const _function = (val: number) => {
            calls += val;
        };

        signal.once(_function);

        signal.fire(10);
        signal.fire(10);

        expect(calls).toBe(10);
    });

    test('should keep persistent listeners after clear()', () => {
        const signal = new Signal();
        let normalCalled = false;
        let persistentCalled = false;

        signal.connect(() => {
            normalCalled = true;
        }, false);
        signal.connect(() => {
            persistentCalled = true;
        }, true);

        signal.clear();
        signal.fire();

        expect(normalCalled).toBe(false);
        expect(persistentCalled).toBe(true);
    });

    test('should handle disconnection during fire() without skipping listeners', () => {
        const signal = new Signal();
        let calls = 0;

        const connection1 = signal.connect(() => {
            calls++;
            connection2.disconnect();
        });
        const connection2 = signal.connect(() => {
            calls++;
        });

        signal.fire();

        expect(calls).toBe(2);

        signal.fire();
        expect(calls).toBe(3);
    });

    test('should work with complex types and multiple arguments', () => {
        const signal = new Signal<[number, { name: string }]>();
        const mockFunction = mock((id: number, data: { name: string }) => {});

        signal.connect(mockFunction);
        signal.fire(1, { name: 'Malachite' });

        expect(mockFunction).toHaveBeenCalledWith(1, { name: 'Malachite' });
    });

    test('should not fail when firing an empty signal', () => {
        const signal = new Signal();
        expect(() => signal.fire()).not.toThrow();
    });
});

import { Signal, type ExposedSignal } from '../../src/common/events/signal';

// Create a new signal and expose it as a exposed signal
const _signal = new Signal<[string]>();
export const readonlySignal: ExposedSignal<[string]> = _signal.exposed;

// Connect a listener to the exposed signal
readonlySignal.connect((message) => {
    console.log(`Received message: ${message}`);
});

// Fire the signal with some arguments (this will work because we have access to the original signal)
_signal.fire('Hello, Read-Only Signal!');

// Attempting to fire the signal through the exposed interface will result in a TypeScript error
try {
    // @ts-expect-error
    readonlySignal.fire('This will not run');
} catch (error) {
    console.error('Error firing read-only signal:', error);
}

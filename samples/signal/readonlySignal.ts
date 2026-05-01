import { Signal, type IReadOnlySignal } from '@/common/events/signal';

// Create a new signal and expose it as a read-only signal
const _signal = new Signal<[string]>();
export const readonlySignal: IReadOnlySignal<[string]> = _signal.public;

// Connect a listener to the read-only signal
readonlySignal.connect((message) => {
    console.log(`Received message: ${message}`);
});

// Fire the signal with some arguments (this will work because we have access to the original signal)
_signal.fire('Hello, Read-Only Signal!');

// Attempting to fire the signal through the read-only interface will result in a TypeScript error
try {
    // @ts-expect-error
    readonlySignal.fire('This will not run');
} catch (error) {
    console.error('Error firing read-only signal:', error);
}

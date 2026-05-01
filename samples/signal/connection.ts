import { Signal } from '../../src/common/events/signal';

// Create a new signal
const signal = new Signal<[string, number]>();

// Connect a listener to the signal
const connection = signal.connect((message, count) => {
    console.log(`Received message: ${message} with count: ${count}`);
});

// Fire the signal with some arguments
signal.fire('Hello, World!', Math.random());

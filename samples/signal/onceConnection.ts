import { Signal } from '@/common/events/signal';

// Create a new signal
const signal = new Signal<[string, number]>();

// Connect a once listener to the signal
const connection = signal.once((message, count) => {
    console.log(`Received message: ${message} with count: ${count}`);
});

// Fire the signal with some arguments
signal.fire('Hello, World!', Math.random());

// Fire the signal again to demonstrate that the listener has been disconnected
signal.fire('This will not be received', Math.random());

// Attempting to disconnect the listener again will not cause any issues
connection.disconnect();

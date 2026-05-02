export type Listener<T extends any[]> = (...args: T) => void;

export interface SignalConnection {
    disconnect(): void;
}

export interface ExposedSignal<T extends any[]> {
    connect(listener: Listener<T>, persistent?: boolean): SignalConnection;
    once(listener: Listener<T>): SignalConnection;
    disconnect(listener: Listener<T>): void;
}

interface InternalConnection<T extends any[]> {
    listener: Listener<T>;
    persistent: boolean;
}

export class Signal<T extends any[] = []> implements ExposedSignal<T> {
    private _connections = new Set<InternalConnection<T>>();
    public readonly exposed: ExposedSignal<T> = this;

    public connect(listener: Listener<T>, persistent: boolean = false): SignalConnection {
        const connection: InternalConnection<T> = { listener, persistent };
        this._connections.add(connection);

        return {
            disconnect: () => {
                this._connections.delete(connection);
            },
        };
    }

    public once(listener: Listener<T>): SignalConnection {
        let connection: SignalConnection;

        const wrapper = (...args: T): void => {
            connection.disconnect();
            listener(...args);
        };

        connection = this.connect(wrapper);
        return connection;
    }

    public disconnect(listener: Listener<T>): void {
        for (const connection of this._connections) {
            if (connection.listener === listener) {
                this._connections.delete(connection);
            }
        }
    }

    public fire(...args: T): void {
        if (this._connections.size === 0) return;

        const entries = Array.from(this._connections);

        const sorted = entries.sort((a, b) => {
            if (a.persistent === b.persistent) return 0;
            return a.persistent ? 1 : -1;
        });

        for (let i = sorted.length - 1; i >= 0; i--) {
            const connection = sorted[i];
            if (connection) connection.listener(...args);
        }
    }

    public clear(): void {
        for (const connection of this._connections) {
            if (!connection.persistent) {
                this._connections.delete(connection);
            }
        }
    }
}

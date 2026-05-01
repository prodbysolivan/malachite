import type { IUpdatable } from '@/common/interfaces/updatable';
import { Channel } from '@modules/scheduler/other/channel';
import { describe, expect, test } from 'bun:test';

describe('Scheduler: Channel', () => {
    describe('Entries Management', () => {
        test('should add and store updatable entries', () => {
            const channel = new Channel({ name: 'Physics' });
            const entry: IUpdatable = { update: () => {} };

            channel.addToEntries(entry);
            expect(channel.entries.length).toBe(1);
            expect(channel.entries).toContain(entry);
        });

        test('should remove entries from the list', () => {
            const channel = new Channel({ name: 'Graphics' });
            const entry: IUpdatable = { update: () => {} };

            channel.addToEntries(entry);
            channel.removeFromEntries(entry);
            expect(channel.entries.length).toBe(0);
        });
    });

    describe('Execution & Framerate Logic', () => {
        test('should update all entries when enabled', () => {
            const channel = new Channel({ name: 'Logic', framerate: 0 });
            let updated = false;
            const entry: IUpdatable = {
                update: () => {
                    updated = true;
                },
            };

            channel.addToEntries(entry);
            channel.update(0.016);
            expect(updated).toBe(true);
        });

        test('should not update entries when disabled', () => {
            const channel = new Channel({ name: 'Silent', framerate: 0 });
            let updated = false;
            const entry: IUpdatable = {
                update: () => {
                    updated = true;
                },
            };

            channel.enabled = false;
            channel.addToEntries(entry);
            channel.update(0.016);
            expect(updated).toBe(false);
        });

        test('should respect fixed framerate using accumulator', () => {
            const framerate = 30;
            const channel = new Channel({ name: 'Fixed', framerate });
            let ticks = 0;
            const entry: IUpdatable = {
                update: () => {
                    ticks++;
                },
            };

            channel.addToEntries(entry);

            channel.update(0.07);

            expect(ticks).toBe(2);
        });

        test('should fire onUpdate signal with correct deltaTime', () => {
            const channel = new Channel({ name: 'SignalTest', framerate: 0 });
            let capturedDt = 0;

            channel.onUpdate.connect((dt) => {
                capturedDt = dt;
            });

            channel.update(0.0123);
            expect(capturedDt).toBe(0.0123);
        });
    });

    describe('Data Integrity', () => {
        test('entries property should return a ReadonlyArray', () => {
            const channel = new Channel({ name: 'Strict' });
            const entry: IUpdatable = { update: () => {} };
            channel.addToEntries(entry);

            expect(Array.isArray(channel.entries)).toBe(true);
            expect(channel.entries[0]).toBe(entry);
        });

        test('should handle removal of non-existent entries gracefully', () => {
            const channel = new Channel({ name: 'Safe' });
            const entry = { update: () => {} };

            expect(() => channel.removeFromEntries(entry)).not.toThrow();
        });

        test('should cloned entries list during update to prevent concurrent modification errors', () => {
            const channel = new Channel({ name: 'AtomicUpdate' });
            let callCount = 0;

            const entry: IUpdatable = {
                update: () => {
                    callCount++;
                    channel.addToEntries({ update: () => {} });
                },
            };

            channel.addToEntries(entry);
            channel.update(0.016);

            expect(callCount).toBe(1);
            expect(channel.entries.length).toBe(2);
        });
    });
});

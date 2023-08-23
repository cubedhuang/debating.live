import type { Socket } from 'socket.io-client';
import { get, writable, type Updater, type Writable } from 'svelte/store';

import type { ClientToServerEvents, ServerToClientEvents } from './wss/types';
import { browser } from '$app/environment';
import type { RoomInfo } from './types';

export function savedWritable<T>(key: string, initial: T): Writable<T> {
	key = `debating.live:${key}`;

	const store = writable<T>(initial);
	const { subscribe, set, update } = store;

	if (browser) {
		const serial = localStorage.getItem(key);
		if (serial && serial !== 'undefined') {
			let value: T;

			try {
				value = JSON.parse(serial);
			} catch {
				value = initial;
				localStorage.setItem(key, JSON.stringify(value));
			}

			set(value);
		}
	}

	return {
		subscribe,
		set(value: T) {
			if (browser) localStorage.setItem(key, JSON.stringify(value));
			set(value);
		},
		update(updater: Updater<T>) {
			update(updater);

			if (browser) {
				localStorage.setItem(key, JSON.stringify(get(store)));
			}
		}
	};
}

export const socket = writable<Socket<
	ServerToClientEvents,
	ClientToServerEvents
> | null>(null);
export const displayName = writable<string>('');
export const sessionId = savedWritable<string>('sessionId', '');
export const userId = writable<string>('');
export const currentRoom = writable<RoomInfo | null>(null);

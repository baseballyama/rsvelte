import * as $ from 'svelte/internal/server';
import { refreshAll } from '$app/navigation';
import LiveView from './LiveView.svelte';

import {
	increment,
	reset,
	drop,
	get_count,
	reconnect_live,
	reconnect_requested_live,
	reconnect_live_form,
	notify_only,
	get_stats
} from './live.remote.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let show_live = true;
		let stats = 'pending';

		async function refresh_stats() {
			const next = await get_stats();

			stats = JSON.stringify(next);
		}

		let for_await_count = 0;
		let for_await_values = '';
		let stop_iteration = null;

		async function start_for_await() {
			stop_iteration?.abort();
			stop_iteration = new AbortController();

			const signal = stop_iteration.signal;

			for_await_count = 0;
			for_await_values = '';

			const collected = [];

			try {
				for await (const value of get_count()) {
					if (signal.aborted) break;

					for_await_count += 1;
					collected.push(value);
					for_await_values = collected.join(',');

					if (for_await_count >= 3) break;
				}
			} catch(error) {
				for_await_values = `error: ${error.message}`;
			}
		}

		let stream_log = '';
		let stream_iteration = null;

		async function start_stream_log() {
			stream_iteration?.abort();
			stream_iteration = new AbortController();

			const signal = stream_iteration.signal;

			stream_log = '';

			const collected = [];

			try {
				for await (const value of get_count()) {
					if (signal.aborted) break;

					collected.push(value);
					stream_log = collected.join(',');
				}
			} catch(error) {
				stream_log = `error: ${error.message}`;
			}
		}

		let refresh_state = 'idle';

		async function run_refresh_all() {
			refresh_state = 'pending';

			try {
				await refreshAll();
				refresh_state = 'resolved';
			} catch {
				refresh_state = 'rejected';
			}
		}

		$$renderer.push(`<button id="increment">increment</button> <button id="reset">reset</button> <button id="notify-only">notify only</button> <button id="drop">drop connection</button> <button id="reconnect-live">reconnect live query</button> <button id="reconnect-live-requested">reconnect requested live queries</button> <form${$.attributes({
			...reconnect_live_form.enhance(async ({ submit }) => {
				await submit();
			})
		})}><button id="reconnect-live-form" type="submit">reconnect live query (form)</button></form> <button id="toggle-live">toggle live query</button> <button id="stats">refresh stats</button> `);

		if (show_live) {
			$$renderer.push('<!--[0-->');
			LiveView($$renderer, {});
		} else {
			$$renderer.push(`<!--[-1--><p id="detached">detached</p>`);
		}

		$$renderer.push(`<!--]--> <p id="stats-value">${$.escape(stats)}</p> <button id="start-for-await">start for-await</button> <p id="for-await-count">${$.escape(for_await_count)}</p> <p id="for-await-values">${$.escape(for_await_values)}</p> <button id="start-stream-log">start stream log</button> <p id="stream-log">${$.escape(stream_log)}</p> <button id="run-refresh-all">refresh all</button> <p id="refresh-state">${$.escape(refresh_state)}</p>`);
	});
}
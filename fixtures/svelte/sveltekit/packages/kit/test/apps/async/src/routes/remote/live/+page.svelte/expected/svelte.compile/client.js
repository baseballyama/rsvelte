import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<p id="detached">detached</p>`);
var root_1 = $.from_html(`<button id="increment">increment</button> <button id="reset">reset</button> <button id="notify-only">notify only</button> <button id="drop">drop connection</button> <button id="reconnect-live">reconnect live query</button> <button id="reconnect-live-requested">reconnect requested live queries</button> <form><button id="reconnect-live-form" type="submit">reconnect live query (form)</button></form> <button id="toggle-live">toggle live query</button> <button id="stats">refresh stats</button> <!> <p id="stats-value"> </p> <button id="start-for-await">start for-await</button> <p id="for-await-count"> </p> <p id="for-await-values"> </p> <button id="start-stream-log">start stream log</button> <p id="stream-log"> </p> <button id="run-refresh-all">refresh all</button> <p id="refresh-state"> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let show_live = $.state(true);
	let stats = $.state('pending');

	async function refresh_stats() {
		const next = await get_stats();

		$.set(stats, JSON.stringify(next), true);
	}

	let for_await_count = $.state(0);
	let for_await_values = $.state('');
	let stop_iteration = null;

	async function start_for_await() {
		stop_iteration?.abort();
		stop_iteration = new AbortController();

		const signal = stop_iteration.signal;

		$.set(for_await_count, 0);
		$.set(for_await_values, '');

		const collected = [];

		try {
			for await (const value of get_count()) {
				if (signal.aborted) break;

				$.set(for_await_count, $.get(for_await_count) + 1);
				collected.push(value);
				$.set(for_await_values, collected.join(','), true);

				if ($.get(for_await_count) >= 3) break;
			}
		} catch(error) {
			$.set(for_await_values, `error: ${error.message}`);
		}
	}

	let stream_log = $.state('');
	let stream_iteration = null;

	async function start_stream_log() {
		stream_iteration?.abort();
		stream_iteration = new AbortController();

		const signal = stream_iteration.signal;

		$.set(stream_log, '');

		const collected = [];

		try {
			for await (const value of get_count()) {
				if (signal.aborted) break;

				collected.push(value);
				$.set(stream_log, collected.join(','), true);
			}
		} catch(error) {
			$.set(stream_log, `error: ${error.message}`);
		}
	}

	let refresh_state = $.state('idle');

	async function run_refresh_all() {
		$.set(refresh_state, 'pending');

		try {
			await refreshAll();
			$.set(refresh_state, 'resolved');
		} catch {
			$.set(refresh_state, 'rejected');
		}
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);
	var button_4 = $.sibling(button_3, 2);
	var button_5 = $.sibling(button_4, 2);
	var form = $.sibling(button_5, 2);

	$.attribute_effect(form, ($0) => ({ ...$0 }), [
		() => reconnect_live_form.enhance(async ({ submit }) => {
			await submit();
		})
	]);

	var button_6 = $.sibling(form, 2);
	var button_7 = $.sibling(button_6, 2);
	var node = $.sibling(button_7, 2);

	{
		var consequent = ($$anchor) => {
			LiveView($$anchor, {});
		};

		var alternate = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($.get(show_live)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var p_1 = $.sibling(node, 2);
	var text = $.only_child(p_1, true);
	var button_8 = $.sibling(p_1, 2);
	var p_2 = $.sibling(button_8, 2);
	var text_1 = $.only_child(p_2, true);
	var p_3 = $.sibling(p_2, 2);
	var text_2 = $.only_child(p_3, true);
	var button_9 = $.sibling(p_3, 2);
	var p_4 = $.sibling(button_9, 2);
	var text_3 = $.only_child(p_4, true);
	var button_10 = $.sibling(p_4, 2);
	var p_5 = $.sibling(button_10, 2);
	var text_4 = $.only_child(p_5, true);

	$.template_effect(() => {
		$.set_text(text, $.get(stats));
		$.set_text(text_1, $.get(for_await_count));
		$.set_text(text_2, $.get(for_await_values));
		$.set_text(text_3, $.get(stream_log));
		$.set_text(text_4, $.get(refresh_state));
	});

	$.delegated('click', button, () => increment());
	$.delegated('click', button_1, () => reset());
	$.delegated('click', button_2, () => notify_only());
	$.delegated('click', button_3, () => drop());
	$.delegated('click', button_4, () => reconnect_live());
	$.delegated('click', button_5, () => reconnect_requested_live().updates(get_count));
	$.delegated('click', button_6, () => $.set(show_live, !$.get(show_live)));
	$.delegated('click', button_7, refresh_stats);
	$.delegated('click', button_8, start_for_await);
	$.delegated('click', button_9, start_stream_log);
	$.delegated('click', button_10, run_refresh_all);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
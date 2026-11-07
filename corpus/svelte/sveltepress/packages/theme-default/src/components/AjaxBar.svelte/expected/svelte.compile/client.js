import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';

var root = $.from_html(`<div class="ajax-bar svelte-1xmcya1"><div class="progress svelte-1xmcya1"></div></div>`);

export default function AjaxBar($$anchor, $$props) {
	$.push($$props, true);

	let barWidth = $.state(0);
	let startedFlag;
	let interval = 200;

	onDestroy(() => {
		if (startedFlag) clearTimeout(startedFlag);
	});

	/**
	 * Start the ajax bar
	 */
	function start() {
		if (startedFlag) clearTimeout(startedFlag);

		$.set(barWidth, 0);
		interval = 200;

		const next = () => {
			$.set(barWidth, $.get(barWidth) + 1);
			interval += Math.floor(Math.random() * 200);
			startedFlag = setTimeout(next, interval);
		};

		next();
	}

	/**
	 * End the ajax bar
	 */
	function end() {
		if ($.get(barWidth) > 0) $.set(barWidth, 100);
		if (startedFlag) clearInterval(startedFlag);

		setTimeout(
			() => {
				$.set(barWidth, 0);
			},
			100
		);
	}

	var $$exports = { start, end };
	var div = root();

	$.template_effect(() => $.set_style(div, `--ajax-bar-width: ${$.get(barWidth)}%;`));
	$.append($$anchor, div);

	return $.pop($$exports);
}
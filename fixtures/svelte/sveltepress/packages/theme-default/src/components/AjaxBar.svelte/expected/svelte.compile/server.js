import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';

export default function AjaxBar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let barWidth = 0;
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

			barWidth = 0;
			interval = 200;

			const next = () => {
				barWidth += 1;
				interval += Math.floor(Math.random() * 200);
				startedFlag = setTimeout(next, interval);
			};

			next();
		}

		/**
		 * End the ajax bar
		 */
		function end() {
			if (barWidth > 0) barWidth = 100;
			if (startedFlag) clearInterval(startedFlag);

			setTimeout(
				() => {
					barWidth = 0;
				},
				100
			);
		}

		$$renderer.push(`<div class="ajax-bar svelte-1xmcya1"${$.attr_style(`--ajax-bar-width: ${barWidth}%;`)}><div class="progress svelte-1xmcya1"></div></div>`);
		$.bind_props($$props, { start, end });
	});
}
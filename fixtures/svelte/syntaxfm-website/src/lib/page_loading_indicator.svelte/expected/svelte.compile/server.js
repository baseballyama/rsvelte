import * as $ from 'svelte/internal/server';
import { navigating } from '$app/stores';
import { onNavigate } from '$app/navigation';

export default function Page_loading_indicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let visible = false;
		let progress = 0;
		let load_durations = [];
		let average_load = $.derived(() => load_durations.reduce((a, b) => a + b, 0) / load_durations.length);
		const increment = 1;

		onNavigate((navigation) => {
			const typical_load_time = average_load() || 200; //ms
			const frequency = typical_load_time / 100;
			let start = performance.now();

			// Start the progress bar
			visible = true;

			progress = 0;

			const interval = setInterval(
				() => {
					// Increment the progress bar
					progress += increment;
				},
				frequency
			);

			// Resolve the promise when the page is done loading
			$.store_get($$store_subs ??= {}, '$navigating', navigating)?.complete.then(() => {
				progress = 100; // Fill out the progress bar
				clearInterval(interval);

				// after 100 ms hide the progress bar
				setTimeout(
					() => {
						visible = false;
					},
					500
				);

				// Log how long that one took
				const end = performance.now();

				const duration = end - start;

				load_durations = [...load_durations, duration];
			});
		});

		$$renderer.push(`<div${$.attr_class('progress svelte-qdp9z9', void 0, { 'visible': visible })}${$.attr_style('', { '--progress': progress })}><div class="track svelte-qdp9z9"></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
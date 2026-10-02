import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { navigating } from '$app/stores';
import { onNavigate } from '$app/navigation';

var root = $.from_html(`<div><div class="track svelte-qdp9z9"></div></div>`);

export default function Page_loading_indicator($$anchor, $$props) {
	$.push($$props, true);

	const $navigating = () => $.store_get(navigating, '$navigating', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let visible = $.state(false);
	let progress = $.state(0);
	let load_durations = $.state($.proxy([]));
	let average_load = $.derived(() => $.get(load_durations).reduce((a, b) => a + b, 0) / $.get(load_durations).length);
	const increment = 1;

	onNavigate((navigation) => {
		const typical_load_time = $.get(average_load //ms
		) || 200;
		const frequency = typical_load_time / 100;
		let start = performance.now();

		// Start the progress bar
		$.set(visible, true);

		$.set(progress, 0);

		const interval = setInterval(
			() => {
				// Increment the progress bar
				$.set(progress, $.get(progress) + increment);
			},
			frequency
		);

		// Resolve the promise when the page is done loading
		$navigating()?.complete.then(() => {
			$.set(progress, 100 // Fill out the progress bar
			);
			clearInterval(interval);

			// after 100 ms hide the progress bar
			setTimeout(
				() => {
					$.set(visible, false);
				},
				500
			);

			// Log how long that one took
			const end = performance.now();

			const duration = end - start;

			$.set(load_durations, [...$.get(load_durations), duration], true);
		});
	});

	var div = root();
	let classes;
	let styles;

	$.template_effect(() => {
		classes = $.set_class(div, 1, 'progress svelte-qdp9z9', null, classes, { visible: $.get(visible) });
		styles = $.set_style(div, '', styles, { '--progress': $.get(progress) });
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}
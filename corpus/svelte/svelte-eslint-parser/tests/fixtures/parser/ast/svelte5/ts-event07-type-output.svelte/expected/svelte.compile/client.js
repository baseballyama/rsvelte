import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Ts_event07_type_output($$anchor) {
	let count = $.state(0 // count: number, $state(0): 0
	);
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(
		// e: MouseEvent
		// next: number, count: number
		// count: number, next: number
		count
	) ?? ''}`));

	$.event('click', button, (e) => {
		// e: MouseEvent
		const next = $.get(count // next: number, count: number
		) + 1;

		$.set(count, next // count: number, next: number
		);
	});

	$.append($$anchor, button);
}
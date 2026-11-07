import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Ts_event08_type_output($$anchor) {
	let count = $.state(0 // count: number, $state(0): 0
	);
	var button = root();
	var text = $.only_child(button // event: number
	);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(
		// count: number, event: number
		count
	) ?? ''}`));

	$.delegated('click', button, (event) => {
		// event: number
		$.set(
			count, // count: number, event: number
			$.get(count) + event
		);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);
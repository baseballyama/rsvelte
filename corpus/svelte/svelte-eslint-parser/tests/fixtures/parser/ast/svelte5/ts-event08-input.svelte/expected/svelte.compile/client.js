import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Ts_event08_input($$anchor) {
	let count = $.state(0);
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));

	$.delegated('click', button, (event) => {
		$.set(count, $.get(count) + event);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);
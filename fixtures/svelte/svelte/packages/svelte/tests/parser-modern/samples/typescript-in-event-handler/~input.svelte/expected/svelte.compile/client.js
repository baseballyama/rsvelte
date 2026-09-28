import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Input($$anchor) {
	let count = $.state(0);
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));

	$.event('click', button, (e) => {
		const next = $.get(count) + 1;

		$.set(count, next);
	});

	$.append($$anchor, button);
}
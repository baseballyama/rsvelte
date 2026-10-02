import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function _1_input($$anchor) {
	let count = $.state(0);

	function increment() {
		$.set(count, $.get(count) + 1);
	}

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));
	$.event('click', button, increment);
	$.append($$anchor, button);
}
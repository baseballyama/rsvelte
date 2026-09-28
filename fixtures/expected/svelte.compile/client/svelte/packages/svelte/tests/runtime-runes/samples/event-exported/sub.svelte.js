import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Sub($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	function increment() {
		$.set(count, $.get(count) + 1);
	}

	var $$exports = { increment };
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `Count: ${$.get(count) ?? ''}`));
	$.event('click', button, increment);
	$.append($$anchor, button);

	return $.pop($$exports);
}
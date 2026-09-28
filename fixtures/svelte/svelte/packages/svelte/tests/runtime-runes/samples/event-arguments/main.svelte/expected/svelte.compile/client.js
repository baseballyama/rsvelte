import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor) {
	let count = $.state(0);

	function increment() {
		$.set(count, $.get(count) + arguments.length);
	}

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.event('click', button, increment);
	$.append($$anchor, button);
}
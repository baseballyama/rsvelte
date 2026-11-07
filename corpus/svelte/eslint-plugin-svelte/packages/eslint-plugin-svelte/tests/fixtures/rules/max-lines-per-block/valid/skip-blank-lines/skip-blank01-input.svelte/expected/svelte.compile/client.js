import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Skip_blank01_input($$anchor) {
	let count = 0;

	function increment() {
		count++;
	}

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, count));
	$.event('click', button, increment);
	$.append($$anchor, button);
}
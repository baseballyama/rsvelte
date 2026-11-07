import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button class="svelte-459dj6"> </button>`);

export default function Skip_both01_input($$anchor) {
	// Comment line 1
	// Comment line 2
	/* Block comment */
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
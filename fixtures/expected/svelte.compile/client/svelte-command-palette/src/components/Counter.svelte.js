import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="mt-8 py-16 shadow-md flex items-center justify-center text-6xl dark:bg-dark-mode-gray dark:text-light-gray"> </div>`);

export default function Counter($$anchor, $$props) {
	let counter = $.prop($$props, 'counter', 3, 0);
	var div = root();
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, counter()));
	$.append($$anchor, div);
}
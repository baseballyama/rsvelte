import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Counter($$anchor) {
	let count = 0;
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, count));
	$.event('click', button, () => count += 1);
	$.append($$anchor, button);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button class="svelte-1qqjdcz"> </button>`);

export default function Default_input($$anchor) {
	let count = 0;

	function increment() {
		count++;
	}

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `Count: ${count ?? ''}`));
	$.event('click', button, increment);
	$.append($$anchor, button);
}
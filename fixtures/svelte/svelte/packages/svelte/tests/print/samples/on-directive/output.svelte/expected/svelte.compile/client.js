import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Output($$anchor) {
	let count = 0;

	function handleClick(event) {
		count += 1;
	}

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `count: ${count ?? ''}`));
	$.event('click', button, $.preventDefault(handleClick));
	$.append($$anchor, button);
}
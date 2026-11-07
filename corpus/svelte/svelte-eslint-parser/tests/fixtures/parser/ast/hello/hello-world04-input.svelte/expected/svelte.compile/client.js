import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Hello_world04_input($$anchor) {
	let count = 0;

	function handleClick() {
		count += 1;
	}

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `Clicked ${count ?? ''} ${count === 1 ? 'time' : 'times'}`));
	$.event('click', button, handleClick);
	$.append($$anchor, button);
}
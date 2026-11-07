import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <button> </button>`, 1);

export default function Input($$anchor) {
	// here is a comment
	let div;

	let count = 0;
	var fragment = root();
	var div_1 = $.first_child(fragment);

	$.bind_this(div_1, ($$value) => div = $$value, () => div);

	var button = $.sibling(div_1, 2);
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, count));
	$.event('click', button, () => count++);
	$.append($$anchor, fragment);
}
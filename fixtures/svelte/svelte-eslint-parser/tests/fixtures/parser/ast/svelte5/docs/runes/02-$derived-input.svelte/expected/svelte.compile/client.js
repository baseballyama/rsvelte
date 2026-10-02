import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <p> </p>`, 1);

export default function _2_$derived_input($$anchor) {
	let count = $.state(0);
	let double = $.derived(() => $.get(count) * 2);
	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var p = $.sibling(button, 2);
	var text_1 = $.only_child(p);

	$.template_effect(() => {
		$.set_text(text, $.get(double));
		$.set_text(text_1, `${$.get(count) ?? ''} doubled is ${$.get(double) ?? ''}`);
	});

	$.event('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}
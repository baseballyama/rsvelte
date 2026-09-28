import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <button> </button>`, 1);

export default function Output($$anchor) {
	// here is a comment
	let div = $.state(void 0);

	let count = $.state(0);
	var fragment = root();
	var div_1 = $.first_child(fragment);

	$.bind_this(div_1, ($$value) => $.set(div, $$value), () => $.get(div));

	var button = $.sibling(div_1, 2);
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $.get(count)));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
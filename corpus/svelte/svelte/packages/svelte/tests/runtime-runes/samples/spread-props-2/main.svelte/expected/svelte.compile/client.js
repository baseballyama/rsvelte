import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Toggle</button> <h1> </h1>`, 1);

export default function Main($$anchor) {
	let isRed = $.state(true);
	const attributes = $.derived(() => ({ 'data-red': $.get(isRed) ? true : undefined }));
	var fragment = root();
	var button = $.first_child(fragment);
	var h1 = $.sibling(button, 2);

	$.attribute_effect(h1, () => ({ ...$.get(attributes) }));

	var text = $.only_child(h1);

	$.template_effect(() => $.set_text(text, `Style: ${$.get(isRed) ? 'red' : 'not red'}`));
	$.delegated('click', button, () => $.set(isRed, !$.get(isRed)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
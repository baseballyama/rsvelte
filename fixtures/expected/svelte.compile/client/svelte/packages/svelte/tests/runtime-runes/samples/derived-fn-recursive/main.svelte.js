import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>increment</button> `, 1);

export default function Main($$anchor) {
	let count = $.state(0);

	let even = $.derived(() => {
		return $.get(count) > 0 ? $.get(even) : 0;
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.sibling(button);

	$.template_effect(() => $.set_text(text, ` ${$.get(even) ?? ''}`));
	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
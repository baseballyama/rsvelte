import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div> <button>increment</button>`, 1);

export default function Main($$anchor) {
	let value = $.state(1);
	var fragment = root();
	var div = $.first_child(fragment);

	$.attach(div, () => (node) => node.textContent = $.get(value));

	var button = $.sibling(div, 2);

	$.delegated('click', button, () => $.set(value, $.get(value) + 1));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
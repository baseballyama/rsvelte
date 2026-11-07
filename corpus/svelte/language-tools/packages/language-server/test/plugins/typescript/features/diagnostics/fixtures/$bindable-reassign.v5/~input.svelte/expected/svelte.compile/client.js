import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Click me</button>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let foo = $.prop($$props, 'foo', 15);

	function onClick() {
		foo(42);
	}

	var button = root();

	$.delegated('click', button, onClick);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);
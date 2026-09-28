import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <select><option>Hello</option><option>World</option></select>`, 1);

export default function Main($$anchor, $$props) {
	let value = $.prop($$props, 'value', 7, "Hello"),
		spread = $.prop($$props, 'spread', 23, () => ({ disabled: false }));

	var fragment = root();
	var button = $.first_child(fragment);
	var select = $.sibling(button, 2);

	$.attribute_effect(select, () => ({ ...spread() }));
	$.delegated('click', button, () => spread({ disabled: false }));
	$.bind_select_value(select, value);
	$.append($$anchor, fragment);
}

$.delegate(['click']);
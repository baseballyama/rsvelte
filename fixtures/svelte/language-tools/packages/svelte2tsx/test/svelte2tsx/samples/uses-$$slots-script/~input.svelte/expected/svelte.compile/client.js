import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1> </h1> <!> <!> <!>`, 1);

export default function Input($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);
	let name = $$slots.foo;
	let dashedName = $$slots['dashed-name'];
	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var node = $.sibling(h1, 2);

	$.slot(node, $$props, 'foo', {}, null);

	var node_1 = $.sibling(node, 2);

	$.slot(node_1, $$props, 'dashed-name', {}, null);

	var node_2 = $.sibling(node_1, 2);

	$.slot(node_2, $$props, 'default', {}, null);
	$.template_effect(() => $.set_text(text, name));
	$.append($$anchor, fragment);
}
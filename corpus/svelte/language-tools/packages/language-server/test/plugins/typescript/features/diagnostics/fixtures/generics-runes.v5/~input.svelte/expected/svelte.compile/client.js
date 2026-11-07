import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ValueComponent from './ValueComponent.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	let value = "test";
	var fragment = root();
	var node = $.first_child(fragment);

	ValueComponent(node, { value, defaultValue: "foo" });

	var node_1 = $.sibling(node, 2);

	ValueComponent(node_1, { value, defaultValue: 1 });
	$.append($$anchor, fragment);
}
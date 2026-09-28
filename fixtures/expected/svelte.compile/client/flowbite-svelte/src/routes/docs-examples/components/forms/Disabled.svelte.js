import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Disabled($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Input(node, {
		id: 'disabled-input',
		class: 'mb-6',
		disabled: true,
		value: 'Disabled input'
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		id: 'disabled-input-2',
		class: 'mb-6',
		disabled: true,
		readonly: true,
		value: 'Disabled readonly input'
	});

	$.append($$anchor, fragment);
}
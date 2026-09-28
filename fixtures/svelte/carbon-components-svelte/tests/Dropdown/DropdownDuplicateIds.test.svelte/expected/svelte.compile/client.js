import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dropdown from "carbon-components-svelte/Dropdown/Dropdown.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function DropdownDuplicateIds_test($$anchor) {
	const items = [
		{ id: "0", text: "Slack" },
		{ id: "1", text: "Email" },
		{ id: "2", text: "Fax" }
	];

	var fragment = root();
	var node = $.first_child(fragment);

	Dropdown(node, {
		get items() {
			return items;
		},
		id: 'dropdown-a',
		labelText: 'Contact A',
		open: true
	});

	var node_1 = $.sibling(node, 2);

	Dropdown(node_1, {
		get items() {
			return items;
		},
		id: 'dropdown-b',
		labelText: 'Contact B',
		open: true
	});

	$.append($$anchor, fragment);
}
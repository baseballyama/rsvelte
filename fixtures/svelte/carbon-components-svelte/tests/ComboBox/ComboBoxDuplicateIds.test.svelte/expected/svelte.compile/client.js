import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ComboBoxDuplicateIds_test($$anchor) {
	const items = [
		{ id: "0", text: "Slack" },
		{ id: "1", text: "Email" },
		{ id: "2", text: "Fax" }
	];

	var fragment = root();
	var node = $.first_child(fragment);

	ComboBox(node, {
		id: 'combo-a',
		labelText: 'Contact A',
		get items() {
			return items;
		},
		open: true
	});

	var node_1 = $.sibling(node, 2);

	ComboBox(node_1, {
		id: 'combo-b',
		labelText: 'Contact B',
		get items() {
			return items;
		},
		open: true
	});

	$.append($$anchor, fragment);
}
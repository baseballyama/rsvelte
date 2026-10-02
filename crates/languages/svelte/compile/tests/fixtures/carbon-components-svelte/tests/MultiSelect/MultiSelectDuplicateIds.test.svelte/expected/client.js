import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function MultiSelectDuplicateIds_test($$anchor) {
	const items = [
		{ id: "0", text: "Slack" },
		{ id: "1", text: "Email" },
		{ id: "2", text: "Fax" }
	];

	var fragment = root();
	var node = $.first_child(fragment);

	MultiSelect(node, {
		id: 'first',
		labelText: 'First',
		get items() {
			return items;
		},
		open: true
	});

	var node_1 = $.sibling(node, 2);

	MultiSelect(node_1, {
		id: 'second',
		labelText: 'Second',
		get items() {
			return items;
		},
		open: true
	});

	$.append($$anchor, fragment);
}
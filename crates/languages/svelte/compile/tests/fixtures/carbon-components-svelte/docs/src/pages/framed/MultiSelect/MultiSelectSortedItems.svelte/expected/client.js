import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MultiSelect } from "carbon-components-svelte";

var root = $.from_html(`<!> <pre> </pre>`, 1);

export default function MultiSelectSortedItems($$anchor) {
	let sortedItems = [];
	var fragment = root();
	var node = $.first_child(fragment);

	MultiSelect(node, {
		selectionFeedback: 'top',
		labelText: 'Contact',
		label: 'Select contact methods...',
		items: [
			{ id: "0", text: "Slack" },
			{ id: "1", text: "Email" },
			{ id: "2", text: "Fax" }
		],

		get sortedItems() {
			return sortedItems;
		},

		set sortedItems($$value) {
			sortedItems = $$value;
		}
	});

	var pre = $.sibling(node, 2);
	var text = $.only_child(pre, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify(sortedItems, null, 2)]);
	$.append($$anchor, fragment);
}
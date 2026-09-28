import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Search } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function SearchFixture($$anchor) {
	let value = "";
	let valueExpandable = "";
	let expanded = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Search(node, {
		'data-testid': 'search-query',
		labelText: 'Search',
		placeholder: 'Search...',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Search(node_1, {
		'data-testid': 'search-expandable',
		labelText: 'Expandable search',
		placeholder: 'Search...',
		expandable: true,
		get expanded() {
			return expanded;
		},

		set expanded($$value) {
			expanded = $$value;
		},

		get value() {
			return valueExpandable;
		},

		set value($$value) {
			valueExpandable = $$value;
		}
	});

	$.append($$anchor, fragment);
}
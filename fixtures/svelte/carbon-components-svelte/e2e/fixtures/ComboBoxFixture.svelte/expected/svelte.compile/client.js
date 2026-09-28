import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ComboBox } from "carbon-components-svelte";

var root = $.from_html(`<button type="button" data-testid="outside-target">Outside target</button> <!> <a href="#" data-testid="outside-link">Outside</a> <!> <div data-testid="combobox-clear-reopen-wrapper"><!></div>`, 1);

export default function ComboBoxFixture($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{ id: "0", text: "Slack" },
		{ id: "1", text: "Email" },
		{ id: "2", text: "Fax" }
	];

	function shouldFilterItem(item, value) {
		if (!value) return true;

		return item.text.toLowerCase().includes(value.toLowerCase());
	}

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	ComboBox(node, {
		'data-testid': 'combobox-contact',
		labelText: 'Contact',
		placeholder: 'Select contact method',
		get items() {
			return items;
		},
		shouldFilterItem
	});

	var node_1 = $.sibling(node, 4);

	ComboBox(node_1, {
		'data-testid': 'combobox-select-on-focus',
		labelText: 'Select on focus',
		placeholder: 'Select',
		get items() {
			return items;
		},
		selectTextOnFocus: true,
		selectedId: '1',
		value: 'Email'
	});

	var div = $.sibling(node_1, 2);
	var node_2 = $.child(div);

	ComboBox(node_2, {
		'data-testid': 'combobox-clear-reopen',
		labelText: 'Clear reopen',
		placeholder: 'Select',
		get items() {
			return items;
		},
		shouldFilterItem,
		openOnClear: true,
		selectedId: '1',
		value: 'Email'
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}
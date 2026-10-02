import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ComboBox } from "carbon-components-svelte";

export default function FilterableComboBoxCustomLabel($$anchor, $$props) {
	$.push($$props, true);

	const translation = {
		Slack: 'Custom label for "Slack"',
		Email: 'Custom label for "Email"',
		Fax: 'Custom label for "Fax"'
	};

	function itemToString(item) {
		return translation[item.key];
	}

	function shouldFilterItem(item, value) {
		if (!value) return true;

		const comparison = value.toLowerCase();

		return item.key.toLowerCase().includes(comparison) || itemToString(item).toLowerCase().includes(comparison);
	}

	ComboBox($$anchor, {
		labelText: 'Contact',
		placeholder: 'Select contact method',
		items: [
			{ id: "0", key: "Slack" },
			{ id: "1", key: "Email" },
			{ id: "2", key: "Fax" }
		],
		shouldFilterItem,
		itemToString
	});

	$.pop();
}
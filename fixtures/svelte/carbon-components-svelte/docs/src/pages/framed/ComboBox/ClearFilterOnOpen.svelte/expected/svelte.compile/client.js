import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ComboBox } from "carbon-components-svelte";

export default function ClearFilterOnOpen($$anchor, $$props) {
	$.push($$props, true);

	function shouldFilterItem(item, value) {
		if (!value) return true;

		return item.text.toLowerCase().includes(value.toLowerCase());
	}

	ComboBox($$anchor, {
		labelText: 'Contact',
		placeholder: 'Select contact method',
		items: [
			{ id: "0", text: "Slack" },
			{ id: "1", text: "Email" },
			{ id: "2", text: "Fax" }
		],
		shouldFilterItem,
		clearFilterOnOpen: true,
		selectedId: '1',
		helperText: 'Select an item, then reopen to see all items again'
	});

	$.pop();
}
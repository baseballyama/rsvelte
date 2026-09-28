import * as $ from 'svelte/internal/server';
import { ComboBox } from "carbon-components-svelte";

export default function ClearFilterOnOpen($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function shouldFilterItem(item, value) {
			if (!value) return true;

			return item.text.toLowerCase().includes(value.toLowerCase());
		}

		ComboBox($$renderer, {
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
	});
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dropdown } from "carbon-components-svelte";

export default function DropdownFixture($$anchor) {
	const items = [
		{ id: "0", text: "Slack" },
		{ id: "1", text: "Email" },
		{ id: "2", text: "Fax" }
	];

	Dropdown($$anchor, {
		'data-testid': 'dropdown-contact',
		labelText: 'Contact',
		label: 'Choose an option',
		get items() {
			return items;
		}
	});
}
import * as $ from 'svelte/internal/server';
import { Dropdown } from "carbon-components-svelte";

export default function DropdownFixture($$renderer) {
	const items = [
		{ id: "0", text: "Slack" },
		{ id: "1", text: "Email" },
		{ id: "2", text: "Fax" }
	];

	Dropdown($$renderer, {
		'data-testid': 'dropdown-contact',
		labelText: 'Contact',
		label: 'Choose an option',
		items
	});
}
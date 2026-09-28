import * as $ from 'svelte/internal/server';
import Dropdown from "carbon-components-svelte/Dropdown/Dropdown.svelte";

export default function DropdownDuplicateIds_test($$renderer) {
	const items = [
		{ id: "0", text: "Slack" },
		{ id: "1", text: "Email" },
		{ id: "2", text: "Fax" }
	];

	Dropdown($$renderer, { items, id: 'dropdown-a', labelText: 'Contact A', open: true });
	$$renderer.push(`<!----> `);
	Dropdown($$renderer, { items, id: 'dropdown-b', labelText: 'Contact B', open: true });
	$$renderer.push(`<!---->`);
}
import * as $ from 'svelte/internal/server';
import ComboBox from "carbon-components-svelte/ComboBox/ComboBox.svelte";

export default function ComboBoxDuplicateIds_test($$renderer) {
	const items = [
		{ id: "0", text: "Slack" },
		{ id: "1", text: "Email" },
		{ id: "2", text: "Fax" }
	];

	ComboBox($$renderer, { id: 'combo-a', labelText: 'Contact A', items, open: true });
	$$renderer.push(`<!----> `);
	ComboBox($$renderer, { id: 'combo-b', labelText: 'Contact B', items, open: true });
	$$renderer.push(`<!---->`);
}
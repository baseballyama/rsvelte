import * as $ from 'svelte/internal/server';
import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";

export default function MultiSelectDuplicateIds_test($$renderer) {
	const items = [
		{ id: "0", text: "Slack" },
		{ id: "1", text: "Email" },
		{ id: "2", text: "Fax" }
	];

	MultiSelect($$renderer, { id: 'first', labelText: 'First', items, open: true });
	$$renderer.push(`<!----> `);
	MultiSelect($$renderer, { id: 'second', labelText: 'Second', items, open: true });
	$$renderer.push(`<!---->`);
}
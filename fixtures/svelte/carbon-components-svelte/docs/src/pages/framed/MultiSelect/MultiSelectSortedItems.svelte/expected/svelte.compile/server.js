import * as $ from 'svelte/internal/server';
import { MultiSelect } from "carbon-components-svelte";

export default function MultiSelectSortedItems($$renderer) {
	let sortedItems = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		MultiSelect($$renderer, {
			selectionFeedback: 'top',
			labelText: 'Contact',
			label: 'Select contact methods...',
			items: [
				{ id: "0", text: "Slack" },
				{ id: "1", text: "Email" },
				{ id: "2", text: "Fax" }
			],

			get sortedItems() {
				return sortedItems;
			},

			set sortedItems($$value) {
				sortedItems = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <pre>${$.escape(JSON.stringify(sortedItems, null, 2))}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
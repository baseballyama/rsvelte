import * as $ from 'svelte/internal/server';
import { Button, ComboBox } from "carbon-components-svelte";

export default function TypeaheadComboBox($$renderer) {
	let selectedId = undefined;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ComboBox($$renderer, {
			labelText: 'Item',
			placeholder: 'Select an item',
			typeahead: true,
			items: [
				{ id: "0", text: "Apple" },
				{ id: "1", text: "Apricot" },
				{ id: "2", text: "Banana" },
				{ id: "3", text: "Blueberry" },
				{ id: "4", text: "Blackberry" },
				{ id: "5", text: "Cherry" },
				{ id: "6", text: "Cranberry" },
				{ id: "7", text: "Grape" },
				{ id: "8", text: "Mango" },
				{ id: "9", text: "Pineapple" }
			],

			get selectedId() {
				return selectedId;
			},

			set selectedId($$value) {
				selectedId = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <br/> `);

		Button($$renderer, {
			disabled: selectedId === undefined,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Set to undefined (unselected)`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
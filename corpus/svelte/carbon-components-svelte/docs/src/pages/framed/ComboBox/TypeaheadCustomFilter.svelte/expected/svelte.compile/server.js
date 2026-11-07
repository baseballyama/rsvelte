import * as $ from 'svelte/internal/server';
import { ComboBox, fuzzyMatch } from "carbon-components-svelte";

export default function TypeaheadCustomFilter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selectedId = undefined;

		// Reuse the built-in fuzzy matcher as the filter predicate. Each typed
		// character must appear in order within the item text, so "bl" matches
		// "Blueberry" and "Blackberry". Only the `matched` boolean is used here.
		const shouldFilterItem = (item, value) => fuzzyMatch(item.text, value).matched;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ComboBox($$renderer, {
				labelText: 'Item',
				placeholder: 'Select an item',
				typeahead: true,
				autoHighlight: 'first-match',
				shouldFilterItem,
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
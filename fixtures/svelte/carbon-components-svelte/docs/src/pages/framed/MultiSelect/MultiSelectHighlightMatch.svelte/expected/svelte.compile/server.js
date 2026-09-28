import * as $ from 'svelte/internal/server';
import { fuzzyMatch, highlightSegments, MultiSelect } from "carbon-components-svelte";

export default function MultiSelectHighlightMatch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = "";

		const items = [
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
		];

		// One matcher drives filtering and highlighting. `filterItem` keeps the
		// items whose text fuzzy-matches the filter value; the default slot reuses
		// the same match and bolds the characters that matched. Bind `value` to read
		// the filter text inside the slot.
		const filterItem = (item, value) => fuzzyMatch(item.text, value).matched;

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MultiSelect($$renderer, {
				filterable: true,
				filterItem,
				labelText: 'Item',
				placeholder: 'Filter items...',
				items,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { item }) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(highlightSegments(item.text, fuzzyMatch(item.text, value).indices));

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let segment = each_array[$$index];

							if (segment.match) {
								$$renderer.push(`<!--[0--><strong>${$.escape(segment.text)}</strong>`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(segment.text)}`);
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					}
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
import * as $ from 'svelte/internal/server';
import { MultiSelect, Stack } from "carbon-components-svelte";

export default function VirtualizeItemHeight($$renderer) {
	const items = Array.from({ length: 10_000 }, (_, i) => ({
		id: i,
		text: `Item ${i + 1}`,
		description: `Description for item ${i + 1}`
	}));

	let selectedIds = [1000];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		MultiSelect($$renderer, {
			virtualize: { itemHeight: 60 },
			filterable: true,
			labelText: 'Custom item height (60px)',
			items,
			get selectedIds() {
				return selectedIds;
			},

			set selectedIds($$value) {
				selectedIds = $$value;
				$$settled = false;
			},
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { item }) => {
					Stack($$renderer, {
						gap: 2,
						children: ($$renderer) => {
							$$renderer.push(`<strong>${$.escape(item.text)}</strong> <span>${$.escape(item.description)}</span>`);
						},
						$$slots: { default: true }
					});
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
}
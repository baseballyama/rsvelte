import * as $ from 'svelte/internal/server';
import { Dropdown, Stack } from "carbon-components-svelte";

export default function VirtualizeItemHeight($$renderer) {
	const items = Array.from({ length: 10_000 }, (_, i) => ({
		id: i,
		text: `Item ${i + 1}`,
		description: `Description for item ${i + 1}`
	}));

	let selectedId = 1000;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Dropdown($$renderer, {
			virtualize: { itemHeight: 60 },
			labelText: 'Custom item height (60px)',
			items,
			get selectedId() {
				return selectedId;
			},

			set selectedId($$value) {
				selectedId = $$value;
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
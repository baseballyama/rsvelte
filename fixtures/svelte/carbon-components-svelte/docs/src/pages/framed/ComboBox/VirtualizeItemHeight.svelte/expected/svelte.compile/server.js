import * as $ from 'svelte/internal/server';
import { ComboBox, Stack } from "carbon-components-svelte";

export default function VirtualizeItemHeight($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = Array.from({ length: 10_000 }, (_, i) => ({
			id: i,
			text: `Item ${i + 1}`,
			description: `Description for item ${i + 1}`
		}));

		let value = "";
		let selectedId = undefined;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ComboBox($$renderer, {
				virtualize: { itemHeight: 60 },
				labelText: 'Custom item height (60px)',
				placeholder: 'Filter...',
				items,
				shouldFilterItem: (item, value) => item.text.toLowerCase().includes(value.toLowerCase()),
				get selectedId() {
					return selectedId;
				},

				set selectedId($$value) {
					selectedId = $$value;
					$$settled = false;
				},

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
	});
}
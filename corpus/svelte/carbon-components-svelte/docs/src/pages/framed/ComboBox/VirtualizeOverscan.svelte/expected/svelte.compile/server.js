import * as $ from 'svelte/internal/server';
import { ComboBox } from "carbon-components-svelte";

export default function VirtualizeOverscan($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = Array.from({ length: 10_000 }, (_, i) => ({ id: i, text: `Item ${i + 1}` }));
		let value = "";
		let selectedId = undefined;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			ComboBox($$renderer, {
				virtualize: { overscan: 100 },
				labelText: 'High overscan (10,000 items, overscan: 100)',
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
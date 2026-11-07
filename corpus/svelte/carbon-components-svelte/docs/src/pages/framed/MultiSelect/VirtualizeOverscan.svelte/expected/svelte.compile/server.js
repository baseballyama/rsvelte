import * as $ from 'svelte/internal/server';
import { MultiSelect } from "carbon-components-svelte";

export default function VirtualizeOverscan($$renderer) {
	const items = Array.from({ length: 10_000 }, (_, i) => ({ id: i, text: `Item ${i + 1}` }));
	let selectedIds = [1000];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		MultiSelect($$renderer, {
			virtualize: { overscan: 100 },
			filterable: true,
			labelText: 'High overscan (10,000 items, overscan: 100)',
			items,
			get selectedIds() {
				return selectedIds;
			},

			set selectedIds($$value) {
				selectedIds = $$value;
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
}
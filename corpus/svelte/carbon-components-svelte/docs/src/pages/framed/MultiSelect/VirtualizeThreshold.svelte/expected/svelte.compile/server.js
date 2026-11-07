import * as $ from 'svelte/internal/server';
import { MultiSelect } from "carbon-components-svelte";

export default function VirtualizeThreshold($$renderer) {
	const items = Array.from({ length: 100 }, (_, i) => ({ id: i, text: `Item ${i + 1}` }));
	let selectedIds = [50];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		MultiSelect($$renderer, {
			virtualize: { threshold: 200 },
			filterable: true,
			labelText: 'Custom threshold (threshold: 200)',
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
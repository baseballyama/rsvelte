import * as $ from 'svelte/internal/server';
import { Dropdown } from "carbon-components-svelte";

export default function VirtualizeThreshold($$renderer) {
	const items = Array.from({ length: 100 }, (_, i) => ({ id: i, text: `Item ${i + 1}` }));
	let selectedId = 50;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Dropdown($$renderer, {
			virtualize: { threshold: 200 },
			labelText: 'Custom threshold (threshold: 200)',
			items,
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
}
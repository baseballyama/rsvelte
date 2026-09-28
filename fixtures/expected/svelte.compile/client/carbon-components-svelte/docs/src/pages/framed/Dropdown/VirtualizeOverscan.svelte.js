import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dropdown } from "carbon-components-svelte";

export default function VirtualizeOverscan($$anchor) {
	const items = Array.from({ length: 10_000 }, (_, i) => ({ id: i, text: `Item ${i + 1}` }));
	let selectedId = 1000;

	Dropdown($$anchor, {
		virtualize: { overscan: 100 },
		labelText: 'High overscan (10,000 items, overscan: 100)',
		get items() {
			return items;
		},

		get selectedId() {
			return selectedId;
		},

		set selectedId($$value) {
			selectedId = $$value;
		}
	});
}
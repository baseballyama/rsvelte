import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MultiSelect } from "carbon-components-svelte";

export default function VirtualizeOverscan($$anchor) {
	const items = Array.from({ length: 10_000 }, (_, i) => ({ id: i, text: `Item ${i + 1}` }));
	let selectedIds = [1000];

	MultiSelect($$anchor, {
		virtualize: { overscan: 100 },
		filterable: true,
		labelText: 'High overscan (10,000 items, overscan: 100)',
		get items() {
			return items;
		},

		get selectedIds() {
			return selectedIds;
		},

		set selectedIds($$value) {
			selectedIds = $$value;
		}
	});
}
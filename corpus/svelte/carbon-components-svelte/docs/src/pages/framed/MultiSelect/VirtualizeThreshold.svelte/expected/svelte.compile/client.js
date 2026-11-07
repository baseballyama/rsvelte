import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MultiSelect } from "carbon-components-svelte";

export default function VirtualizeThreshold($$anchor) {
	const items = Array.from({ length: 100 }, (_, i) => ({ id: i, text: `Item ${i + 1}` }));
	let selectedIds = [50];

	MultiSelect($$anchor, {
		virtualize: { threshold: 200 },
		filterable: true,
		labelText: 'Custom threshold (threshold: 200)',
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
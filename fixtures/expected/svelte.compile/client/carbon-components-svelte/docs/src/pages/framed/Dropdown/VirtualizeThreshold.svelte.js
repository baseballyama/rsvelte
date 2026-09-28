import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dropdown } from "carbon-components-svelte";

export default function VirtualizeThreshold($$anchor) {
	const items = Array.from({ length: 100 }, (_, i) => ({ id: i, text: `Item ${i + 1}` }));
	let selectedId = 50;

	Dropdown($$anchor, {
		virtualize: { threshold: 200 },
		labelText: 'Custom threshold (threshold: 200)',
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
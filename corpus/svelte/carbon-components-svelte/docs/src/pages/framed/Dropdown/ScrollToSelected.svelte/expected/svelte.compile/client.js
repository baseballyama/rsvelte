import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dropdown } from "carbon-components-svelte";

export default function ScrollToSelected($$anchor) {
	const items = Array.from({ length: 50 }, (_, i) => ({ id: i, text: `Item ${i + 1}` }));
	let selectedId = 42;

	Dropdown($$anchor, {
		labelText: 'Items',
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
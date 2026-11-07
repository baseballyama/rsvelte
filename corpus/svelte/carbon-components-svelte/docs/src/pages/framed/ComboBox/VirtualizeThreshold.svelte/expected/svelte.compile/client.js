import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ComboBox } from "carbon-components-svelte";

export default function VirtualizeThreshold($$anchor, $$props) {
	$.push($$props, true);

	const items = Array.from({ length: 100 }, (_, i) => ({ id: i, text: `Item ${i + 1}` }));
	let value = "";
	let selectedId = undefined;

	ComboBox($$anchor, {
		virtualize: { threshold: 200 },
		labelText: 'Custom threshold (threshold: 200)',
		placeholder: 'Filter...',
		get items() {
			return items;
		},
		shouldFilterItem: (item, value) => item.text.toLowerCase().includes(value.toLowerCase()),
		get selectedId() {
			return selectedId;
		},

		set selectedId($$value) {
			selectedId = $$value;
		},

		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	$.pop();
}
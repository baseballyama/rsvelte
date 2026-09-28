import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";

export default function MultiSelectItemToStringId_test($$anchor) {
	/** itemToString may return Item["id"] (e.g. number), matching default `text ?? id`. */
	const items = [
		{ id: 101, text: "SKU label A" },
		{ id: 102, text: "SKU label B" }
	];

	MultiSelect($$anchor, {
		get items() {
			return items;
		},
		itemToString: (item) => item.id,
		label: 'Choose SKU',
		labelText: 'SKU',
		$$events: { select: () => {} }
	});
}
import * as $ from 'svelte/internal/server';
import MultiSelect from "carbon-components-svelte/MultiSelect/MultiSelect.svelte";

export default function MultiSelectItemToStringId_test($$renderer) {
	/** itemToString may return Item["id"] (e.g. number), matching default `text ?? id`. */
	const items = [
		{ id: 101, text: "SKU label A" },
		{ id: 102, text: "SKU label B" }
	];

	MultiSelect($$renderer, {
		items,
		itemToString: (item) => item.id,
		label: 'Choose SKU',
		labelText: 'SKU'
	});
}
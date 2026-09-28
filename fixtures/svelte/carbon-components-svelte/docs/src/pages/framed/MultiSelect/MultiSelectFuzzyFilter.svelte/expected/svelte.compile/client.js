import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fuzzyMatch, MultiSelect } from "carbon-components-svelte";

export default function MultiSelectFuzzyFilter($$anchor, $$props) {
	$.push($$props, true);

	// Reuse the built-in fuzzy matcher as the filter predicate. Each typed
	// character must appear in order within the item text, so "bl" matches
	// "Blueberry" and "Blackberry". Only the `matched` boolean is used here.
	const filterItem = (item, value) => fuzzyMatch(item.text, value).matched;

	MultiSelect($$anchor, {
		filterable: true,
		filterItem,
		labelText: 'Item',
		placeholder: 'Filter items...',
		items: [
			{ id: "0", text: "Apple" },
			{ id: "1", text: "Apricot" },
			{ id: "2", text: "Banana" },
			{ id: "3", text: "Blueberry" },
			{ id: "4", text: "Blackberry" },
			{ id: "5", text: "Cherry" },
			{ id: "6", text: "Cranberry" },
			{ id: "7", text: "Grape" },
			{ id: "8", text: "Mango" },
			{ id: "9", text: "Pineapple" }
		]
	});

	$.pop();
}
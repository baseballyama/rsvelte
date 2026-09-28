import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ComboBox } from "carbon-components-svelte";

var root = $.from_html(`<!> <br/> <!>`, 1);

export default function TypeaheadComboBox($$anchor) {
	let selectedId = undefined;
	var fragment = root();
	var node = $.first_child(fragment);

	ComboBox(node, {
		labelText: 'Item',
		placeholder: 'Select an item',
		typeahead: true,
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
		],

		get selectedId() {
			return selectedId;
		},

		set selectedId($$value) {
			selectedId = $$value;
		}
	});

	var node_1 = $.sibling(node, 4);

	{
		let $0 = $.derived(() => selectedId === undefined);

		Button(node_1, {
			get disabled() {
				return $.get($0);
			},
			$$events: { click: () => selectedId = undefined },
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Set to undefined (unselected)');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
}
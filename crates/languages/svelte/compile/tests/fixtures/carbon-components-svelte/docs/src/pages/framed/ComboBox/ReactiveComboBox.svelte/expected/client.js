import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ComboBox } from "carbon-components-svelte";

var root = $.from_html(`<!> <br/> <!> <!>`, 1);

export default function ReactiveComboBox($$anchor) {
	let selectedId = "1";
	var fragment = root();
	var node = $.first_child(fragment);

	ComboBox(node, {
		labelText: 'Contact',
		placeholder: 'Select contact method',
		items: [
			{ id: "0", text: "Slack" },
			{ id: "1", text: "Email" },
			{ id: "2", text: "Fax" }
		],

		get selectedId() {
			return selectedId;
		},

		set selectedId($$value) {
			selectedId = $$value;
		}
	});

	var node_1 = $.sibling(node, 4);

	Button(node_1, {
		$$events: { click: () => selectedId = undefined },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Set to undefined (unselected)');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		$$events: { click: () => selectedId = "2" },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Set to 2 (Fax)');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
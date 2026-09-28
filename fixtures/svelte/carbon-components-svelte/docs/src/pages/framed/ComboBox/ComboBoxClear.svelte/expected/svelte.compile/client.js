import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ComboBox } from "carbon-components-svelte";

var root = $.from_html(`<!> <br/> <!> <!> <!>`, 1);

export default function ComboBoxClear($$anchor) {
	let ref;
	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(
		ComboBox(node, {
			labelText: 'Contact',
			placeholder: 'Select contact method',
			selectedId: '1',
			items: [
				{ id: "0", text: "Slack" },
				{ id: "1", text: "Email" },
				{ id: "2", text: "Fax" }
			]
		}),
		($$value) => ref = $$value,
		() => ref
	);

	var node_1 = $.sibling(node, 4);

	Button(node_1, {
		$$events: { click: () => ref.clear() },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Clear');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		$$events: { click: () => ref.clear({ focus: false }) },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Clear (no focus)');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		$$events: { click: () => ref.clear({ open: true }) },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Clear (reopen menu)');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
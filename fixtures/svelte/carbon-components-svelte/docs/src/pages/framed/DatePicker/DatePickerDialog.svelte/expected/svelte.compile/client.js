import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, DatePicker, DatePickerInput, Dialog, Stack } from "carbon-components-svelte";

var root = $.from_html(`<p>With <code>portalMenu</code>, the calendar auto-mounts into the nearest <code>&lt;dialog&gt;</code> ancestor so it renders above the modal backdrop.</p> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function DatePickerDialog($$anchor) {
	let open = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open dialog');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Dialog(node_1, {
		modal: true,
		'aria-label': 'Meeting scheduler',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				gap: 5,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_2 = $.sibling($.first_child(fragment_2), 2);

					DatePicker(node_2, {
						portalMenu: true,
						datePickerType: 'single',
						children: ($$anchor, $$slotProps) => {
							DatePickerInput($$anchor, { labelText: 'Meeting date', placeholder: 'mm/dd/yyyy' });
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						kind: 'secondary',
						$$events: { click: () => open = false },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Close');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
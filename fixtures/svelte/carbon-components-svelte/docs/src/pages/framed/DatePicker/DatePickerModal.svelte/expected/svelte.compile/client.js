import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, DatePicker, DatePickerInput, Modal } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function DatePickerModal($$anchor) {
	let open = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select date');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		size: 'sm',
		modalHeading: 'Meeting date',
		primaryButtonText: 'Confirm',
		secondaryButtonText: 'Cancel',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},
		$$events: { 'click:button--secondary': () => open = false },
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, {
				datePickerType: 'single',
				children: ($$anchor, $$slotProps) => {
					DatePickerInput($$anchor, { labelText: 'Meeting date', placeholder: 'mm/dd/yyyy' });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
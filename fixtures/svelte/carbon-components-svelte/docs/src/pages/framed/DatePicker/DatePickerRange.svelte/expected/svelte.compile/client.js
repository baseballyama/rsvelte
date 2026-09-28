import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function DatePickerRange($$anchor, $$props) {
	DatePicker($$anchor, {
		datePickerType: 'range',
		$$events: {
			change: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			DatePickerInput(node, { labelText: 'Start date', placeholder: 'mm/dd/yyyy' });

			var node_1 = $.sibling(node, 2);

			DatePickerInput(node_1, { labelText: 'End date', placeholder: 'mm/dd/yyyy' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
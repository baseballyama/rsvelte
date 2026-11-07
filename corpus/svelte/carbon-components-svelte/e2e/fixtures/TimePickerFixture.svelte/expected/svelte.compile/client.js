import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SelectItem, TimePicker, TimePickerSelect } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function TimePickerFixture($$anchor) {
	let value = "";

	TimePicker($$anchor, {
		'data-testid': 'time-picker',
		labelText: 'Meeting time',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			TimePickerSelect($$anchor, {
				value: 'pm',
				labelText: 'AM/PM',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					SelectItem(node, { value: 'am', text: 'AM' });

					var node_1 = $.sibling(node, 2);

					SelectItem(node_1, { value: 'pm', text: 'PM' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}
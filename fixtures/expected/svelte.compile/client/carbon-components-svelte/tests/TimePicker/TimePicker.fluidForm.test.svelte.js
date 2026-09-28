import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FluidForm from "carbon-components-svelte/FluidForm/FluidForm.svelte";
import SelectItem from "carbon-components-svelte/Select/SelectItem.svelte";
import TimePicker from "carbon-components-svelte/TimePicker/TimePicker.svelte";
import TimePickerSelect from "carbon-components-svelte/TimePicker/TimePickerSelect.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function TimePicker_fluidForm_test($$anchor) {
	FluidForm($$anchor, {
		children: ($$anchor, $$slotProps) => {
			TimePicker($$anchor, {
				labelText: 'Time',
				placeholder: 'hh:mm',
				children: ($$anchor, $$slotProps) => {
					TimePickerSelect($$anchor, {
						labelText: 'Clock',
						value: 'am',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node = $.first_child(fragment_3);

							SelectItem(node, { value: 'am', text: 'AM' });

							var node_1 = $.sibling(node, 2);

							SelectItem(node_1, { value: 'pm', text: 'PM' });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}
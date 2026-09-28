import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DatePicker from "carbon-components-svelte/DatePicker/DatePicker.svelte";
import DatePickerInput from "carbon-components-svelte/DatePicker/DatePickerInput.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom label content</span>`);

export default function DatePickerInput_slot_test($$anchor) {
	DatePicker($$anchor, {
		datePickerType: 'simple',
		children: ($$anchor, $$slotProps) => {
			DatePickerInput($$anchor, {
				labelText: 'Default label',
				$$slots: {
					labelChildren: ($$anchor, $$slotProps) => {
						var span = root();

						$.append($$anchor, span);
					}
				}
			});
		},
		$$slots: { default: true }
	});
}
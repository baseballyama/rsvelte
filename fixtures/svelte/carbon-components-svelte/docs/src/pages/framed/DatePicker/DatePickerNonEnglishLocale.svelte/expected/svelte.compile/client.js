import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";
import { German } from "flatpickr/dist/l10n/de";

export default function DatePickerNonEnglishLocale($$anchor, $$props) {
	DatePicker($$anchor, {
		datePickerType: 'single',
		get locale() {
			return German;
		},

		$$events: {
			change: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			DatePickerInput($$anchor, { labelText: 'Termin', placeholder: 'tt.mm.jjjj' });
		},
		$$slots: { default: true }
	});
}
import * as $ from 'svelte/internal/server';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";
import { German } from "flatpickr/dist/l10n/de";

export default function DatePickerNonEnglishLocale($$renderer) {
	DatePicker($$renderer, {
		datePickerType: 'single',
		locale: German,
		children: ($$renderer) => {
			DatePickerInput($$renderer, { labelText: 'Termin', placeholder: 'tt.mm.jjjj' });
		},
		$$slots: { default: true }
	});
}
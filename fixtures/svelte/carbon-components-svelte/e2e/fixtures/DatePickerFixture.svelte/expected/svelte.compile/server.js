import * as $ from 'svelte/internal/server';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

export default function DatePickerFixture($$renderer) {
	/** @type {string[]} */
	let singleCloseTriggers = [];

	/** @type {string[]} */
	let rangeCloseTriggers = [];

	$$renderer.push(`<div data-testid="date-picker-single">`);

	DatePicker($$renderer, {
		datePickerType: 'single',
		value: '03/15/2024',
		flatpickrProps: { static: true, minDate: "03/01/2024", maxDate: "03/31/2024" },
		children: ($$renderer) => {
			DatePickerInput($$renderer, {
				'data-testid': 'date-picker-meeting',
				labelText: 'Meeting date',
				placeholder: 'mm/dd/yyyy'
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p data-testid="date-picker-single-close-triggers">${$.escape(singleCloseTriggers.join(","))}</p></div> <div data-testid="outside-date-picker" style="margin-top: 1rem; padding: 1rem;">Click target (outside pickers)</div> <div data-testid="date-picker-range">`);

	DatePicker($$renderer, {
		datePickerType: 'range',
		flatpickrProps: { static: true, minDate: "03/01/2024", maxDate: "03/31/2024" },
		children: ($$renderer) => {
			DatePickerInput($$renderer, {
				'data-testid': 'date-picker-range-start',
				labelText: 'Start date',
				placeholder: 'mm/dd/yyyy'
			});

			$$renderer.push(`<!----> `);

			DatePickerInput($$renderer, {
				'data-testid': 'date-picker-range-end',
				labelText: 'End date',
				placeholder: 'mm/dd/yyyy'
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p data-testid="date-picker-range-close-triggers">${$.escape(rangeCloseTriggers.join(","))}</p></div> <div data-testid="date-picker-month">`);

	DatePicker($$renderer, {
		datePickerType: 'month',
		dateFormat: 'F Y',
		value: 'March 2024',
		flatpickrProps: { static: true },
		children: ($$renderer) => {
			DatePickerInput($$renderer, {
				'data-testid': 'date-picker-billing-month',
				labelText: 'Billing month',
				placeholder: 'Month Year'
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}
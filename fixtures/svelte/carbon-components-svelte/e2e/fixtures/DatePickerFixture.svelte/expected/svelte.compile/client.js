import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker, DatePickerInput } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div data-testid="date-picker-single"><!> <p data-testid="date-picker-single-close-triggers"> </p></div> <div data-testid="outside-date-picker" style="margin-top: 1rem; padding: 1rem;">Click target (outside pickers)</div> <div data-testid="date-picker-range"><!> <p data-testid="date-picker-range-close-triggers"> </p></div> <div data-testid="date-picker-month"><!></div>`, 1);

export default function DatePickerFixture($$anchor, $$props) {
	/** @type {string[]} */
	let singleCloseTriggers = [];

	/** @type {string[]} */
	let rangeCloseTriggers = [];

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	DatePicker(node, {
		datePickerType: 'single',
		value: '03/15/2024',
		flatpickrProps: { static: true, minDate: "03/01/2024", maxDate: "03/31/2024" },
		$$events: {
			change: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},
			close: (e) => singleCloseTriggers = [...singleCloseTriggers, e.detail?.trigger ?? "null"]
		},

		children: ($$anchor, $$slotProps) => {
			DatePickerInput($$anchor, {
				'data-testid': 'date-picker-meeting',
				labelText: 'Meeting date',
				placeholder: 'mm/dd/yyyy'
			});
		},
		$$slots: { default: true }
	});

	var p = $.sibling(node, 2);
	var text = $.only_child(p, true);

	$.reset(div);

	var div_1 = $.sibling(div, 4);
	var node_1 = $.child(div_1);

	DatePicker(node_1, {
		datePickerType: 'range',
		flatpickrProps: { static: true, minDate: "03/01/2024", maxDate: "03/31/2024" },
		$$events: {
			change: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},
			close: (e) => rangeCloseTriggers = [...rangeCloseTriggers, e.detail?.trigger ?? "null"]
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_2 = $.first_child(fragment_2);

			DatePickerInput(node_2, {
				'data-testid': 'date-picker-range-start',
				labelText: 'Start date',
				placeholder: 'mm/dd/yyyy'
			});

			var node_3 = $.sibling(node_2, 2);

			DatePickerInput(node_3, {
				'data-testid': 'date-picker-range-end',
				labelText: 'End date',
				placeholder: 'mm/dd/yyyy'
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var p_1 = $.sibling(node_1, 2);
	var text_1 = $.only_child(p_1, true);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.child(div_2);

	DatePicker(node_4, {
		datePickerType: 'month',
		dateFormat: 'F Y',
		value: 'March 2024',
		flatpickrProps: { static: true },
		$$events: {
			change: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			DatePickerInput($$anchor, {
				'data-testid': 'date-picker-billing-month',
				labelText: 'Billing month',
				placeholder: 'Month Year'
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $0);
			$.set_text(text_1, $1);
		},
		[
			() => singleCloseTriggers.join(","),
			() => rangeCloseTriggers.join(",")
		]
	);

	$.append($$anchor, fragment);
}
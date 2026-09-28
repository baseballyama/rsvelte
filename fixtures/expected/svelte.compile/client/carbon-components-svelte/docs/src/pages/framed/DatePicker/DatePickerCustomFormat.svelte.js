import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, DatePicker, DatePickerInput, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<form><!></form>`);

export default function DatePickerCustomFormat($$anchor) {
	let value = "";
	let submittedValue = "";
	var form = root_1();
	var node = $.child(form);

	Stack(node, {
		inline: true,
		gap: 4,
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			DatePicker(node_1, {
				datePickerType: 'single',
				dateFormat: 'Y-m-d',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => submittedValue ? `Submitted: ${submittedValue}` : "");

						DatePickerInput($$anchor, {
							labelText: 'Date of birth',
							placeholder: 'yyyy-mm-dd',
							get helperText() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			{
				let $0 = $.derived(() => !value);

				Button(node_2, {
					type: 'submit',
					get disabled() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Submit');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(form);
	$.event('submit', form, $.preventDefault(() => submittedValue = value));
	$.append($$anchor, form);
}
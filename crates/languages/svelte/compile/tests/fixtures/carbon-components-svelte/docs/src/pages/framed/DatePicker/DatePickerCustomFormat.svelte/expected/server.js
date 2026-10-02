import * as $ from 'svelte/internal/server';
import { Button, DatePicker, DatePickerInput, Stack } from "carbon-components-svelte";

export default function DatePickerCustomFormat($$renderer) {
	let value = "";
	let submittedValue = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<form>`);

		Stack($$renderer, {
			inline: true,
			gap: 4,
			children: ($$renderer) => {
				DatePicker($$renderer, {
					datePickerType: 'single',
					dateFormat: 'Y-m-d',
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						DatePickerInput($$renderer, {
							labelText: 'Date of birth',
							placeholder: 'yyyy-mm-dd',
							helperText: submittedValue ? `Submitted: ${submittedValue}` : ""
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					type: 'submit',
					disabled: !value,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Submit`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></form>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
import * as $ from 'svelte/internal/server';
import { Button, DatePicker, DatePickerInput, Modal } from "carbon-components-svelte";

export default function DatePickerModal($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Select date`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			size: 'sm',
			modalHeading: 'Meeting date',
			primaryButtonText: 'Confirm',
			secondaryButtonText: 'Cancel',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				DatePicker($$renderer, {
					datePickerType: 'single',
					children: ($$renderer) => {
						DatePickerInput($$renderer, { labelText: 'Meeting date', placeholder: 'mm/dd/yyyy' });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
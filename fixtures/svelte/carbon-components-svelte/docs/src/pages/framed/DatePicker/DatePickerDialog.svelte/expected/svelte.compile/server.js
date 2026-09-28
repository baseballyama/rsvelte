import * as $ from 'svelte/internal/server';
import { Button, DatePicker, DatePickerInput, Dialog, Stack } from "carbon-components-svelte";

export default function DatePickerDialog($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open dialog`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Dialog($$renderer, {
			modal: true,
			'aria-label': 'Meeting scheduler',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				Stack($$renderer, {
					gap: 5,
					children: ($$renderer) => {
						$$renderer.push(`<p>With <code>portalMenu</code>, the calendar auto-mounts into the nearest <code>&lt;dialog></code> ancestor so it renders above the modal backdrop.</p> `);

						DatePicker($$renderer, {
							portalMenu: true,
							datePickerType: 'single',
							children: ($$renderer) => {
								DatePickerInput($$renderer, { labelText: 'Meeting date', placeholder: 'mm/dd/yyyy' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							kind: 'secondary',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Close`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
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
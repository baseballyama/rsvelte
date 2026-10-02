import * as $ from 'svelte/internal/server';
import { Label, Datepicker } from "flowbite-svelte";

export default function InputProps($$renderer) {
	let selectedDate = undefined;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Label($$renderer, {
			class: 'mb-2 flex items-center font-bold italic',
			children: ($$renderer) => {
				$$renderer.push(`<!---->My Datepicker`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Datepicker($$renderer, {
			inputProps: { id: "my-datepicker" },
			get value() {
				return selectedDate;
			},

			set value($$value) {
				selectedDate = $$value;
				$$settled = false;
			}
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
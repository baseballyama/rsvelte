import * as $ from 'svelte/internal/server';
import { Label, Timepicker } from "flowbite-svelte";

export default function StateAndBind($$renderer) {
	let selectedTime = "09:00";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Label($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Select Time: ${$.escape(selectedTime)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Timepicker($$renderer, {
			get value() {
				return selectedTime;
			},

			set value($$value) {
				selectedTime = $$value;
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
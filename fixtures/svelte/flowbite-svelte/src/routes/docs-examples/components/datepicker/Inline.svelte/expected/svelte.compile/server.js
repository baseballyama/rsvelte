import * as $ from 'svelte/internal/server';
import { Datepicker, P } from "flowbite-svelte";

export default function Inline($$renderer) {
	let selectedDate = undefined;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="md:w-1/2">`);

		Datepicker($$renderer, {
			inline: true,
			get value() {
				return selectedDate;
			},

			set value($$value) {
				selectedDate = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'mt-4',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Selected date: ${$.escape(selectedDate ? selectedDate.toLocaleDateString() : "None")}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
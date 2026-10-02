import * as $ from 'svelte/internal/server';
import { Datepicker, Button } from "flowbite-svelte";

export default function ElementRef($$renderer) {
	let datepickerRef = void 0;
	let selectedDate = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Datepicker($$renderer, {
			placeholder: 'Select a date',
			get elementRef() {
				return datepickerRef;
			},

			set elementRef($$value) {
				datepickerRef = $$value;
				$$settled = false;
			},

			get value() {
				return selectedDate;
			},

			set value($$value) {
				selectedDate = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div class="mt-4 flex flex-wrap gap-2">`);

		Button($$renderer, {
			onclick: () => datepickerRef?.focus(),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Focus Datepicker`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => datepickerRef?.select(),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Select All Text`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => datepickerRef?.blur(),
			children: ($$renderer) => {
				$$renderer.push(`<!---->Blur Datepicker`);
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
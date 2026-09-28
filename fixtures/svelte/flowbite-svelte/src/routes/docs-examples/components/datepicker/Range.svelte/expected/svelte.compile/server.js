import * as $ from 'svelte/internal/server';
import { Datepicker, P } from "flowbite-svelte";

export default function Range($$renderer) {
	let dateRange = { from: undefined, to: undefined };
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="mb-64 md:w-1/2">`);

		Datepicker($$renderer, {
			range: true,
			color: 'blue',
			get rangeFrom() {
				return dateRange.from;
			},

			set rangeFrom($$value) {
				dateRange.from = $$value;
				$$settled = false;
			},

			get rangeTo() {
				return dateRange.to;
			},

			set rangeTo($$value) {
				dateRange.to = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'mt-4',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Selected range:
    ${$.escape(dateRange.from ? dateRange.from.toLocaleDateString() : "None")} -
    ${$.escape(dateRange.to ? dateRange.to.toLocaleDateString() : "None")}`);
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
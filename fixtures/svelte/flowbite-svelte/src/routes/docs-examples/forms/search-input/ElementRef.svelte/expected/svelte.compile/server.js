import * as $ from 'svelte/internal/server';
import { Search, Button } from "flowbite-svelte";

export default function ElementRef($$renderer) {
	let searchRef = void 0;
	let elementTxt = "This text has NOT been updated.";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<form id="example-form">`);

		Search($$renderer, {
			get value() {
				return elementTxt;
			},

			set value($$value) {
				elementTxt = $$value;
				$$settled = false;
			},

			get elementRef() {
				return searchRef;
			},

			set elementRef($$value) {
				searchRef = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			class: 'mt-2',
			onclick: () => {
				searchRef?.setRangeText("ALREADY", 14, 17, "select");
				searchRef?.select();
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Update text`);
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
import * as $ from 'svelte/internal/server';
import { FloatingLabelInput, Button } from "flowbite-svelte";

export default function ElementRef($$renderer) {
	let floatingRef = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		FloatingLabelInput($$renderer, {
			variant: 'outlined',
			id: 'element_outlined',
			name: 'element_outlined',
			type: 'text',
			class: 'my-4',
			get elementRef() {
				return floatingRef;
			},

			set elementRef($$value) {
				floatingRef = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Floating filled`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => {
				floatingRef?.select();
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Select`);
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
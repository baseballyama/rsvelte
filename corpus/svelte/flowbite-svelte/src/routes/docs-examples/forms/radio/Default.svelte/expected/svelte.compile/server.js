import * as $ from 'svelte/internal/server';
import { Radio } from "flowbite-svelte";

export default function Default($$renderer) {
	let selectedValue = "2";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Radio($$renderer, {
			name: 'example1',
			value: '1',
			get group() {
				return selectedValue;
			},

			set group($$value) {
				selectedValue = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Default radio`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Radio($$renderer, {
			name: 'example1',
			value: '2',
			get group() {
				return selectedValue;
			},

			set group($$value) {
				selectedValue = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Checked state`);
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
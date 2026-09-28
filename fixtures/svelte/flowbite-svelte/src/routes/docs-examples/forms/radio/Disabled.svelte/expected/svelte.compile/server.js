import * as $ from 'svelte/internal/server';
import { Radio } from "flowbite-svelte";

export default function Disabled($$renderer) {
	let selectedValue = "2";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Radio($$renderer, {
			name: 'disabled-state',
			disabled: true,
			value: '1',
			get group() {
				return selectedValue;
			},

			set group($$value) {
				selectedValue = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Disabled radio`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Radio($$renderer, {
			name: 'disabled-state',
			disabled: true,
			value: '2',
			get group() {
				return selectedValue;
			},

			set group($$value) {
				selectedValue = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Disabled checked`);
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
import * as $ from 'svelte/internal/server';
import { Radio } from "flowbite-svelte";

export default function Bordered($$renderer) {
	let selectedValue3 = "2";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="grid grid-cols-2 gap-6"><div class="rounded-sm border border-gray-200 dark:border-gray-700">`);

		Radio($$renderer, {
			name: 'bordered',
			value: '1',
			classes: { label: "w-full p-4" },
			get group() {
				return selectedValue3;
			},

			set group($$value) {
				selectedValue3 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Default radio`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="rounded-sm border border-gray-200 dark:border-gray-700">`);

		Radio($$renderer, {
			name: 'bordered',
			value: '2',
			classes: { label: "w-full p-4" },
			get group() {
				return selectedValue3;
			},

			set group($$value) {
				selectedValue3 = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Checked state`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
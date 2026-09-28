import * as $ from 'svelte/internal/server';
import { Button, Dropdown, Radio } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";

export default function RadioBackground($$renderer) {
	let group2 = 2;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Dropdown radio`);
				ChevronDownOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Dropdown($$renderer, {
			simple: true,
			class: 'w-48 space-y-1 p-3',
			children: ($$renderer) => {
				$$renderer.push(`<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">`);

				Radio($$renderer, {
					name: 'group2',
					value: 1,
					get group() {
						return group2;
					},

					set group($$value) {
						group2 = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Default radio`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></li> <li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">`);

				Radio($$renderer, {
					name: 'group2',
					value: 2,
					get group() {
						return group2;
					},

					set group($$value) {
						group2 = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Checked state`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></li> <li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">`);

				Radio($$renderer, {
					name: 'group2',
					value: 3,
					get group() {
						return group2;
					},

					set group($$value) {
						group2 = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Default radio`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></li>`);
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
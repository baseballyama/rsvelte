import * as $ from 'svelte/internal/server';
import { Button, Dropdown, Radio } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";

export default function Radio_1($$renderer) {
	let group1 = 2;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Dropdown radio ${$.escape(group1)}`);
				ChevronDownOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Dropdown($$renderer, {
			simple: true,
			class: 'w-44 space-y-3 p-3 text-sm',
			children: ($$renderer) => {
				$$renderer.push(`<li>`);

				Radio($$renderer, {
					name: 'group1',
					value: 1,
					get group() {
						return group1;
					},

					set group($$value) {
						group1 = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Default radio`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></li> <li>`);

				Radio($$renderer, {
					name: 'group1',
					value: 2,
					get group() {
						return group1;
					},

					set group($$value) {
						group1 = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Checked state`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></li> <li>`);

				Radio($$renderer, {
					name: 'group1',
					value: 3,
					get group() {
						return group1;
					},

					set group($$value) {
						group1 = $$value;
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
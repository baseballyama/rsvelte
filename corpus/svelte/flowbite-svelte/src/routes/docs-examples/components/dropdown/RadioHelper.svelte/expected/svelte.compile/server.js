import * as $ from 'svelte/internal/server';
import { Button, Dropdown, Radio, Helper } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";

export default function RadioHelper($$renderer) {
	let group3 = 2;
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
			class: 'w-60 space-y-1 p-3',
			children: ($$renderer) => {
				$$renderer.push(`<li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">`);

				Radio($$renderer, {
					name: 'group3',
					value: 1,
					get group() {
						return group3;
					},

					set group($$value) {
						group3 = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Enable notifications`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Helper($$renderer, {
					class: 'ps-6',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Some helpful instruction goes over here.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></li> <li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">`);

				Radio($$renderer, {
					name: 'group3',
					value: 2,
					get group() {
						return group3;
					},

					set group($$value) {
						group3 = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Enable 2FA auth`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Helper($$renderer, {
					class: 'ps-6',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Some helpful instruction goes over here.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></li> <li class="rounded-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-600">`);

				Radio($$renderer, {
					name: 'group3',
					value: 3,
					get group() {
						return group3;
					},

					set group($$value) {
						group3 = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Subscribe newsletter`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Helper($$renderer, {
					class: 'ps-6',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Some helpful instruction goes over here.`);
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
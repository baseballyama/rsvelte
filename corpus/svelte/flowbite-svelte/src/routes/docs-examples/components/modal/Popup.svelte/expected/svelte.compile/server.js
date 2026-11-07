import * as $ from 'svelte/internal/server';
import { Button, Modal } from "flowbite-svelte";
import { ExclamationCircleOutline } from "flowbite-svelte-icons";
import { slide } from "svelte/transition";

export default function Popup($$renderer) {
	let popupModal = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			onclick: () => popupModal = true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Pop-up modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			form: true,
			size: 'xs',
			transition: slide,
			permanent: true,
			get open() {
				return popupModal;
			},

			set open($$value) {
				popupModal = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<div class="text-center">`);

				ExclamationCircleOutline($$renderer, {
					class: 'mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200'
				});

				$$renderer.push(`<!----> <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this product?</h3> <div class="space-x-2">`);

				Button($$renderer, {
					type: 'submit',
					value: 'yes',
					color: 'red',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Yes, I'm sure`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					type: 'submit',
					value: 'no',
					color: 'alternative',
					children: ($$renderer) => {
						$$renderer.push(`<!---->No, cancel`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
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
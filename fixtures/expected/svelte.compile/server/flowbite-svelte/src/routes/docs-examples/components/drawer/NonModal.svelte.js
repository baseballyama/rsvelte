import * as $ from 'svelte/internal/server';
import { Drawer, CardPlaceholder, Button } from "flowbite-svelte";
import { InfoCircleSolid, ArrowRightOutline } from "flowbite-svelte-icons";

export default function NonModal($$renderer) {
	let openNonModal = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="text-center">`);

		Button($$renderer, {
			onclick: () => openNonModal = true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show drawer`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		CardPlaceholder($$renderer, { size: '2xl', class: 'mt-6' });
		$$renderer.push(`<!----></div> `);

		Drawer($$renderer, {
			modal: false,
			get open() {
				return openNonModal;
			},

			set open($$value) {
				openNonModal = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<h5 class="mb-4 inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400">`);
				InfoCircleSolid($$renderer, { class: 'me-2.5 h-5 w-5' });
				$$renderer.push(`<!---->Info</h5> <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Supercharge your hiring by taking advantage of our <a href="/" class="text-primary-600 dark:text-primary-500 underline hover:no-underline">limited-time sale</a> for Flowbite Docs + Job Board. Unlimited access to over 190K top-ranked candidates and the #1 design job board.</p> <div class="grid grid-cols-2 gap-2">`);

				Button($$renderer, {
					color: 'light',
					href: '#/',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Learn more`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					href: '#/',
					class: 'px-4',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Get access `);
						ArrowRightOutline($$renderer, { class: 'ms-2 h-5 w-5' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
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
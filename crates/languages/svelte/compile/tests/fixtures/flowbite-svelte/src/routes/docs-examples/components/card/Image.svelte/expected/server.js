import * as $ from 'svelte/internal/server';
import { Card, Button, Toggle } from "flowbite-svelte";
import { ArrowRightOutline } from "flowbite-svelte-icons";

export default function Image($$renderer) {
	let vCard = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="space-y-4">`);

		Card($$renderer, {
			img: '/images/image-1.webp',
			reverse: vCard,
			children: ($$renderer) => {
				$$renderer.push(`<div class="m-6"><h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5> <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p> `);

				Button($$renderer, {
					class: 'w-40',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Read more `);
						ArrowRightOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Toggle($$renderer, {
			class: 'italic dark:text-gray-500',
			get checked() {
				return vCard;
			},

			set checked($$value) {
				vCard = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Reverse`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
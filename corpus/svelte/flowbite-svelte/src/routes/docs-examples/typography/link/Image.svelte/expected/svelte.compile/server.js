import * as $ from 'svelte/internal/server';
import { Card, Button } from "flowbite-svelte";
import { ArrowRightOutline } from "flowbite-svelte-icons";

export default function Image($$renderer) {
	Card($$renderer, {
		img: '/images/image-1.webp',
		href: '/cards',
		children: ($$renderer) => {
			$$renderer.push(`<div class="m-6"><h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5> <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Read more `);
					ArrowRightOutline($$renderer, { class: 'ms-2 h-6 w-6' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}
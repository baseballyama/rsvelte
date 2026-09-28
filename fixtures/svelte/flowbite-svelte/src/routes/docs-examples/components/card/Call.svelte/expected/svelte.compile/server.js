import * as $ from 'svelte/internal/server';
import { Card, Button, Rating, Badge } from "flowbite-svelte";

export default function Call($$renderer) {
	Card($$renderer, {
		class: 'p-0',
		children: ($$renderer) => {
			$$renderer.push(`<a href="/"><img class="rounded-t-lg p-8" src="/images/product-1.webp" alt="product 1"/></a> <div class="px-5 pb-5"><a href="/"><h5 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Apple Watch Series 7 GPS, Aluminium Case, Starlight Sport</h5></a> `);

			{
				function text($$renderer) {
					Badge($$renderer, {
						class: 'ms-3',
						children: ($$renderer) => {
							$$renderer.push(`<!---->4`);
						},
						$$slots: { default: true }
					});
				}

				Rating($$renderer, {
					rating: 4,
					size: 24,
					class: 'mt-2.5 mb-5',
					text,
					$$slots: { text: true }
				});
			}

			$$renderer.push(`<!----> <div class="flex items-center justify-between"><span class="text-3xl font-bold text-gray-900 dark:text-white">$599</span> `);

			Button($$renderer, {
				href: '/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Buy now`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}
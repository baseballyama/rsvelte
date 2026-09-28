import * as $ from 'svelte/internal/server';
import { Rating } from "flowbite-svelte";

export default function Count($$renderer) {
	Rating($$renderer, {
		count: true,
		rating: 4.95,
		id: 'example-4',
		children: ($$renderer) => {
			$$renderer.push(`<span class="mx-1.5 h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span> <a href="/" class="text-sm font-medium text-gray-900 underline hover:no-underline dark:text-white">73 reviews</a>`);
		},
		$$slots: { default: true }
	});
}
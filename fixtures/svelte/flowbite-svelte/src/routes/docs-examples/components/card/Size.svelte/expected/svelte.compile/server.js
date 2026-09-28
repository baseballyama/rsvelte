import * as $ from 'svelte/internal/server';
import { Card } from "flowbite-svelte";

export default function Size($$renderer) {
	$$renderer.push(`<div class="flex justify-center">`);

	Card($$renderer, {
		class: 'max-w-[250px] p-6',
		children: ($$renderer) => {
			$$renderer.push(`<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Technology acquisitions</h5> <p class="leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions.</p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}
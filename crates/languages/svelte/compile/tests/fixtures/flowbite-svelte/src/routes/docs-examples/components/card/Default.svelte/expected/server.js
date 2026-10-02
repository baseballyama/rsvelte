import * as $ from 'svelte/internal/server';
import { Card } from "flowbite-svelte";

export default function Default($$renderer) {
	Card($$renderer, {
		href: '/cards',
		class: 'p-4 sm:p-6 md:p-8',
		children: ($$renderer) => {
			$$renderer.push(`<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5> <p class="leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>`);
		},
		$$slots: { default: true }
	});
}
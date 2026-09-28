import * as $ from 'svelte/internal/server';
import { Card, Button } from "flowbite-svelte";

export default function Action($$renderer) {
	Card($$renderer, {
		size: 'lg',
		class: 'p-4 text-center sm:p-8 md:p-10',
		children: ($$renderer) => {
			$$renderer.push(`<h5 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Work fast from anywhere</h5> <p class="mb-5 text-base text-gray-500 sm:text-lg dark:text-gray-400">Stay up to date and move work forward with Flowbite on iOS &amp; Android. Download the app today.</p> <div class="items-center justify-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">`);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Download it`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Get it on`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}
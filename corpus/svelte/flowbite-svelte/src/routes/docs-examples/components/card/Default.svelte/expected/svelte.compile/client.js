import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card } from "flowbite-svelte";

var root = $.from_html(`<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5> <p class="leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>`, 1);

export default function Default($$anchor) {
	Card($$anchor, {
		href: '/cards',
		class: 'p-4 sm:p-6 md:p-8',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
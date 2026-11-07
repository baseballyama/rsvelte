import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Rating } from "flowbite-svelte";

var root = $.from_html(`<span class="mx-1.5 h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400"></span> <a href="/" class="text-sm font-medium text-gray-900 underline hover:no-underline dark:text-white">73 reviews</a>`, 1);

export default function Count($$anchor) {
	Rating($$anchor, {
		count: true,
		rating: 4.95,
		id: 'example-4',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
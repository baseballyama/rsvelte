import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Banner, Skeleton, ImagePlaceholder } from "flowbite-svelte";

var root = $.from_html(`<a href="https://flowbite-svelte.com/" class="mb-2 flex items-center border-gray-200 md:me-4 md:mb-0 md:border-e md:pe-4 dark:border-gray-600"><img src="/images/flowbite-svelte-icon-logo.svg" class="me-2 h-6" alt="Flowbite Logo"/> <span class="self-center text-lg font-semibold whitespace-nowrap dark:text-white">Flowbite</span></a> <p class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">Build websites even faster with components on top of Tailwind CSS</p>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Cta($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Skeleton(node, { class: 'py-4' });

	var node_1 = $.sibling(node, 2);

	ImagePlaceholder(node_1, { class: 'py-4' });

	var node_2 = $.sibling(node_1, 2);

	Banner(node_2, {
		class: 'absolute top-6 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 rounded-lg border border-gray-100 bg-white shadow-xs lg:max-w-7xl dark:border-gray-600 dark:bg-gray-700',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
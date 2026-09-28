import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { A } from "flowbite-svelte";
import { ArrowRightOutline } from "flowbite-svelte-icons";
import Figma from "$icons/Figma.svelte";

var root = $.from_html(`<!> <span class="ms-3 w-full">Get started with our Figma Design System</span> <!>`, 1);

export default function Cta($$anchor) {
	A($$anchor, {
		href: '/',
		class: 'inline-flex items-center justify-center rounded-lg bg-gray-50 p-5 text-base font-medium hover:bg-gray-100 hover:text-gray-900 hover:no-underline dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Figma(node, {});

			var node_1 = $.sibling(node, 4);

			ArrowRightOutline(node_1, { class: 'ms-2 h-6 w-6' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
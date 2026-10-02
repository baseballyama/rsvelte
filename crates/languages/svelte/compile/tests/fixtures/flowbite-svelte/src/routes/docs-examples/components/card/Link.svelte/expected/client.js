import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card } from "flowbite-svelte";
import { GiftBoxSolid, ArrowUpRightFromSquareOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <a href="/"><h5 class="mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">Need a help in Claim?</h5></a> <p class="mb-3 font-normal text-gray-500 dark:text-gray-400">Go to this step by step guideline process on how to certify for your weekly benefits:</p> <a href="/" class="text-primary-600 inline-flex items-center hover:underline">See our guideline <!></a>`, 1);

export default function Link($$anchor) {
	Card($$anchor, {
		class: 'p-4 sm:p-6 md:p-8',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			GiftBoxSolid(node, { class: 'mb-3 h-8 w-8 text-gray-500 dark:text-gray-400' });

			var a = $.sibling(node, 6);
			var node_1 = $.sibling($.child(a));

			ArrowUpRightFromSquareOutline(node_1, { class: 'ms-2.5 h-4 w-4' });
			$.reset(a);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
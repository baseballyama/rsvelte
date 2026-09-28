import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { List, Li } from "flowbite-svelte";

var root = $.from_html(`<div class="flex items-center space-x-4 rtl:space-x-reverse"><div class="shrink-0"><img class="h-8 w-8 rounded-full" src="/images/profile-picture-1.webp" alt="Neil profile"/></div> <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-gray-900 dark:text-white">Neil Sims</p> <p class="truncate text-sm text-gray-500 dark:text-gray-400">email@flowbite.com</p></div> <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">$320</div></div>`);
var root_1 = $.from_html(`<div class="flex items-center space-x-4 rtl:space-x-reverse"><div class="shrink-0"><img class="h-8 w-8 rounded-full" src="/images/profile-picture-2.webp" alt="Bonnie profile"/></div> <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-gray-900 dark:text-white">Bonnie Green</p> <p class="truncate text-sm text-gray-500 dark:text-gray-400">email@flowbite.com</p></div> <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">$3467</div></div>`);
var root_2 = $.from_html(`<div class="flex items-center space-x-4 rtl:space-x-reverse"><div class="shrink-0"><img class="h-8 w-8 rounded-full" src="/images/profile-picture-3.webp" alt="Michael profile"/></div> <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-gray-900 dark:text-white">Michael Gough</p> <p class="truncate text-sm text-gray-500 dark:text-gray-400">email@flowbite.com</p></div> <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">$67</div></div>`);
var root_3 = $.from_html(`<div class="flex items-center space-x-4 rtl:space-x-reverse"><div class="shrink-0"><img class="h-8 w-8 rounded-full" src="/images/profile-picture-4.webp" alt="Thomas profile"/></div> <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-gray-900 dark:text-white">Thomas Lean</p> <p class="truncate text-sm text-gray-500 dark:text-gray-400">email@flowbite.com</p></div> <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">$2367</div></div>`);
var root_4 = $.from_html(`<div class="flex items-center space-x-4 rtl:space-x-reverse"><div class="shrink-0"><img class="h-8 w-8 rounded-full" src="/images/profile-picture-5.webp" alt="Lana profile"/></div> <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-gray-900 dark:text-white">Lana Byrd</p> <p class="truncate text-sm text-gray-500 dark:text-gray-400">email@flowbite.com</p></div> <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">$367</div></div>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Advanced($$anchor) {
	List($$anchor, {
		tag: 'dl',
		class: 'max-w-md divide-y divide-gray-200 dark:divide-gray-700',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_5();
			var node = $.first_child(fragment_1);

			Li(node, {
				class: 'pb-3 sm:pb-4',
				children: ($$anchor, $$slotProps) => {
					var div = root();

					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Li(node_1, {
				class: 'py-3 sm:py-4',
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_1();

					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Li(node_2, {
				class: 'py-3 sm:py-4',
				children: ($$anchor, $$slotProps) => {
					var div_2 = root_2();

					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Li(node_3, {
				class: 'py-3 sm:py-4',
				children: ($$anchor, $$slotProps) => {
					var div_3 = root_3();

					$.append($$anchor, div_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Li(node_4, {
				class: 'py-3 sm:py-4',
				children: ($$anchor, $$slotProps) => {
					var div_4 = root_4();

					$.append($$anchor, div_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
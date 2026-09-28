import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Radio } from "flowbite-svelte";
import { ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<div class="dark:peer-checked:text-primary-500 peer-checked:border-primary-600 peer-checked:text-primary-600 inline-flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"><div><div class="w-full text-lg font-semibold">0-50 MB</div> <div class="w-full">Good for small websites</div></div> <!></div>`);
var root_1 = $.from_html(`<div class="dark:peer-checked:text-primary-500 peer-checked:border-primary-600 peer-checked:text-primary-600 inline-flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-5 text-gray-500 hover:bg-gray-100 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"><div class="block"><div class="w-full text-lg font-semibold">500-1000 MB</div> <div class="w-full">Good for large websites</div></div> <!></div>`);
var root_2 = $.from_html(`<p class="mb-5 text-lg font-medium text-gray-900 dark:text-white">Choose technology:</p> <div class="grid w-full gap-6 md:grid-cols-2"><!> <!></div>`, 1);

export default function Advanced($$anchor) {
	var fragment = root_2();
	var div = $.sibling($.first_child(fragment), 2);
	var node = $.child(div);

	Radio(node, {
		name: 'custom',
		custom: true,
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var node_1 = $.sibling($.child(div_1), 2);

			ArrowRightOutline(node_1, { class: 'ms-3 h-10 w-10' });
			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Radio(node_2, {
		name: 'custom',
		custom: true,
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_1();
			var node_3 = $.sibling($.child(div_2), 2);

			ArrowRightOutline(node_3, { class: 'ms-3 h-10 w-10' });
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Button } from "flowbite-svelte";
import { DatabaseSolid, ChevronRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Storage status`, 1);
var root_1 = $.from_html(`<div class="space-y-2"><h3 class="font-semibold text-gray-900 dark:text-white">Available storage</h3> <p class="text-gray-500 dark:text-gray-400">This server has <span class="font-semibold text-gray-900 dark:text-white">30</span> of <span class="font-semibold text-gray-900 dark:text-white">150 GB</span> of block storage remaining.</p> <div class="mb-4 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700"><div class="h-2.5 rounded-full bg-red-600" style="width: 85%"></div></div> <a href="/" class="text-primary-600 dark:text-primary-500 dark:hover:text-primary-600 hover:text-primary-700 flex items-center font-medium">Upgrade now <!></a></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Progress($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			DatabaseSolid(node_1, { class: 'me-2 h-5 w-5 text-white dark:text-white' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Popover(node_2, {
		class: 'w-64 text-sm font-light',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var a = $.sibling($.child(div), 6);
			var node_3 = $.sibling($.child(a));

			ChevronRightOutline(node_3, {
				class: 'text-primary-600 dark:text-primary-500 ms-1.5 h-4 w-4'
			});

			$.reset(a);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
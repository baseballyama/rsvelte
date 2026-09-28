import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "flowbite-svelte";

var root = $.from_html(`<p class="mb-4 font-semibold text-gray-900 dark:text-white">Identification</p> <ul class="w-full items-center divide-x divide-gray-200 rounded-lg border border-gray-200 sm:flex rtl:divide-x-reverse dark:divide-gray-600 dark:border-gray-600 dark:bg-gray-800"><li class="w-full"><!></li> <li class="w-full"><!></li> <li class="w-full"><!></li> <li class="w-full"><!></li></ul>`, 1);

export default function Horizontal($$anchor) {
	var fragment = root();
	var ul = $.sibling($.first_child(fragment), 2);
	var li = $.child(ul);
	var node = $.child(li);

	Checkbox(node, {
		classes: { div: "p-3" },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Svelte');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(li);

	var li_1 = $.sibling(li, 2);
	var node_1 = $.child(li_1);

	Checkbox(node_1, {
		classes: { div: "p-3" },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Vue JS');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(li_1);

	var li_2 = $.sibling(li_1, 2);
	var node_2 = $.child(li_2);

	Checkbox(node_2, {
		classes: { div: "p-3" },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('React');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(li_2);

	var li_3 = $.sibling(li_2, 2);
	var node_3 = $.child(li_3);

	Checkbox(node_3, {
		classes: { div: "p-3" },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Angular');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(li_3);
	$.reset(ul);
	$.append($$anchor, fragment);
}
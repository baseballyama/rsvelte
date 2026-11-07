import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Indicator, Avatar, Badge } from "flowbite-svelte";

var root = $.from_html(`<!>Available`, 1);
var root_1 = $.from_html(`<!>Unavailable`, 1);
var root_2 = $.from_html(`<ul class="w-full max-w-sm divide-y divide-gray-200 dark:divide-gray-700"><li class="py-3 sm:py-4"><div class="flex items-center space-x-3 rtl:space-x-reverse"><!> <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold text-gray-900 dark:text-white">Neil Sims</p> <p class="truncate text-sm text-gray-500 dark:text-gray-400">email@flowbite.com</p></div> <!></div></li> <li class="py-3 sm:py-4"><div class="flex items-center space-x-3 rtl:space-x-reverse"><div class="shrink-0"><!></div> <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold text-gray-900 dark:text-white">Bonnie Green</p> <p class="truncate text-sm text-gray-500 dark:text-gray-400">email@flowbite.com</p></div> <!></div></li></ul>`);

export default function Badge_1($$anchor) {
	var ul = root_2();
	var li = $.child(ul);
	var div = $.child(li);
	var node = $.child(div);

	Avatar(node, { src: '/images/profile-picture-5.webp', alt: 'Neil image' });

	var node_1 = $.sibling(node, 4);

	Badge(node_1, {
		color: 'green',
		class: 'px-2.5 py-0.5',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_2 = $.first_child(fragment);

			Indicator(node_2, { color: 'green', size: 'xs', class: 'me-1' });
			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.reset(li);

	var li_1 = $.sibling(li, 2);
	var div_1 = $.child(li_1);
	var div_2 = $.child(div_1);
	var node_3 = $.child(div_2);

	Avatar(node_3, { src: '/images/profile-picture-4.webp', alt: 'Bonnie image' });
	$.reset(div_2);

	var node_4 = $.sibling(div_2, 4);

	Badge(node_4, {
		color: 'red',
		class: 'px-2.5 py-0.5',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_5 = $.first_child(fragment_1);

			Indicator(node_5, { color: 'red', size: 'xs', class: 'me-1' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(li_1);
	$.reset(ul);
	$.append($$anchor, ul);
}
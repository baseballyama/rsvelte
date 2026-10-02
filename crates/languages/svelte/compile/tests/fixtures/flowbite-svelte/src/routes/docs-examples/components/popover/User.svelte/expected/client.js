import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Button, Avatar } from "flowbite-svelte";

var root = $.from_html(`<div class="p-3"><div class="mb-2 flex items-center justify-between"><!> <!></div> <div class="text-base leading-none font-semibold text-gray-900 dark:text-white"><a href="/">Jese Leos</a></div> <div class="mb-3 text-sm font-normal"><a href="/" class="hover:underline">@jeseleos</a></div> <div class="mb-4 text-sm font-light">Open-source contributor. Building <a href="/" class="text-primary-600 dark:text-primary-500 hover:underline">flowbite.com</a> .</div> <ul class="flex text-sm font-light"><li class="me-2"><a href="/" class="hover:underline"><span class="font-semibold text-gray-900 dark:text-white">799</span> <span>Following</span></a></li> <li><a href="/" class="hover:underline"><span class="font-semibold text-gray-900 dark:text-white">3,758</span> <span>Followers</span></a></li></ul></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function User($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('User profile');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Popover(node_1, {
		class: 'w-64 bg-white text-sm font-light text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var node_2 = $.child(div_1);

			Avatar(node_2, {
				href: '/',
				src: '/images/profile-picture-1.webp',
				alt: 'Jese Leos'
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				size: 'xs',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Follow');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.next(8);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
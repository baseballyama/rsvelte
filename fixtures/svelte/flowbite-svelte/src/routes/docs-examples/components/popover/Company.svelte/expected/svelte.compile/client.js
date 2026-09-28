import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Button, Avatar } from "flowbite-svelte";

import {
	GlobeOutline,
	HeartSolid,
	ThumbsUpSolid,
	DotsHorizontalOutline
} from "flowbite-svelte-icons";

var root = $.from_html(`<!> Like page`, 1);
var root_1 = $.from_html(`<div class="flex"><div class="me-3 shrink-0"><a href="/" class="block rounded-lg bg-gray-100 p-2 dark:bg-gray-700"><img class="h-8 w-8 rounded-full" src="/images/flowbite-svelte-icon-logo.svg" alt="Flowbite logo"/></a></div> <div><p class="mb-1 text-base leading-none font-semibold text-gray-900 dark:text-white"><a href="/" class="hover:underline">Flowbite</a></p> <p class="mb-3 text-sm font-normal">Tech company</p> <p class="mb-4 text-sm font-light">Open-source library of Tailwind CSS components and Figma design system.</p> <ul class="text-sm font-light"><li class="mb-2 flex items-center"><!> <a href="/" class="text-primary-600 dark:text-primary-500 hover:underline">https://flowbite.com/</a></li> <li class="mb-2 flex items-start"><!> <span>4,567,346 people like this including 5 of your friends</span></li></ul> <div class="ms-4 mb-3 flex"><!> <!> <!> <!></div> <div class="flex"><!> <!></div></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Company($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Company profile');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Popover(node_1, {
		class: 'w-80 text-sm',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var div_1 = $.sibling($.child(div), 2);
			var ul = $.sibling($.child(div_1), 6);
			var li = $.child(ul);
			var node_2 = $.child(li);

			GlobeOutline(node_2, { class: 'me-2 h-3.5 w-3.5' });
			$.next(2);
			$.reset(li);

			var li_1 = $.sibling(li, 2);
			var node_3 = $.child(li_1);

			HeartSolid(node_3, { class: 'me-2 h-5 w-5' });
			$.next(2);
			$.reset(li_1);
			$.reset(ul);

			var div_2 = $.sibling(ul, 2);
			var node_4 = $.child(div_2);

			Avatar(node_4, { src: '/images/profile-picture-1.webp', stacked: true });

			var node_5 = $.sibling(node_4, 2);

			Avatar(node_5, { src: '/images/profile-picture-2.webp', stacked: true });

			var node_6 = $.sibling(node_5, 2);

			Avatar(node_6, { src: '/images/profile-picture-3.webp', stacked: true });

			var node_7 = $.sibling(node_6, 2);

			Avatar(node_7, {
				stacked: true,
				href: '/',
				class: 'bg-gray-700 text-white hover:bg-gray-600 dark:bg-gray-700',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('+3');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var node_8 = $.child(div_3);

			Button(node_8, {
				color: 'alternative',
				class: 'me-2 w-full',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_9 = $.first_child(fragment_1);

					ThumbsUpSolid(node_9, { class: 'me-2' });
					$.next();
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_8, 2);

			Button(node_10, {
				color: 'alternative',
				children: ($$anchor, $$slotProps) => {
					DotsHorizontalOutline($$anchor, { class: 'h-3.5 w-3.5' });
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
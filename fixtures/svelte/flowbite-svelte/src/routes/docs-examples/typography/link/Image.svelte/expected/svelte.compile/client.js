import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Button } from "flowbite-svelte";
import { ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Read more <!>`, 1);
var root_1 = $.from_html(`<div class="m-6"><h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5> <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p> <!></div>`);

export default function Image($$anchor) {
	Card($$anchor, {
		img: '/images/image-1.webp',
		href: '/cards',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.sibling($.child(div), 4);

			Button(node, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root();
					var node_1 = $.sibling($.first_child(fragment_1));

					ArrowRightOutline(node_1, { class: 'ms-2 h-6 w-6' });
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}
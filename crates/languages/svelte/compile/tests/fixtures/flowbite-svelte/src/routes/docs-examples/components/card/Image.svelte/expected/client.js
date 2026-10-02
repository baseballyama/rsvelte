import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Button, Toggle } from "flowbite-svelte";
import { ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Read more <!>`, 1);
var root_1 = $.from_html(`<div class="m-6"><h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5> <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p> <!></div>`);
var root_2 = $.from_html(`<div class="space-y-4"><!> <!></div>`);

export default function Image($$anchor) {
	let vCard = false;
	var div = root_2();
	var node = $.child(div);

	Card(node, {
		img: '/images/image-1.webp',
		get reverse() {
			return vCard;
		},

		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();
			var node_1 = $.sibling($.child(div_1), 4);

			Button(node_1, {
				class: 'w-40',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment = root();
					var node_2 = $.sibling($.first_child(fragment));

					ArrowRightOutline(node_2, { class: 'ms-2 h-6 w-6 text-white' });
					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Toggle(node_3, {
		class: 'italic dark:text-gray-500',
		get checked() {
			return vCard;
		},

		set checked($$value) {
			vCard = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Reverse');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}
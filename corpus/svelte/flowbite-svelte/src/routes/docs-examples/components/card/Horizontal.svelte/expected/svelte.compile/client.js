import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Toggle } from "flowbite-svelte";

var root = $.from_html(`<div class="m-6"><h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5> <p class="mb-3 leading-tight font-normal text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p></div>`);
var root_1 = $.from_html(`<div class="space-y-4"><!> <!></div>`);

export default function Horizontal($$anchor) {
	let hCard = false;
	var div = root_1();
	var node = $.child(div);

	Card(node, {
		img: '/images/image-1.webp',
		href: '/',
		horizontal: true,
		size: 'md',
		get reverse() {
			return hCard;
		},

		children: ($$anchor, $$slotProps) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Toggle(node_1, {
		class: 'italic dark:text-gray-500',
		get checked() {
			return hCard;
		},

		set checked($$value) {
			hCard = $$value;
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
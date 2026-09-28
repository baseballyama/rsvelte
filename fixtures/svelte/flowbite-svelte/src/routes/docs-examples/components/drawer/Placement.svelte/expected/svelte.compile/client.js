import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Drawer, CardPlaceholder, Button } from "flowbite-svelte";
import { InfoCircleSolid, ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Get access <!>`, 1);
var root_1 = $.from_html(`<h5 class="mb-4 inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400"><!>Info</h5> <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Supercharge your hiring by taking advantage of our <a href="/" class="text-primary-600 dark:text-primary-500 underline hover:no-underline">limited-time sale</a> for Flowbite Docs + Job Board. Unlimited access to over 190K top-ranked candidates and the #1 design job board.</p> <div class="grid grid-cols-2 gap-2"><!> <!></div>`, 1);
var root_2 = $.from_html(`<div class="text-center"><!> <div class="my-2 space-x-6"><!> <!></div> <!> <!></div> <!>`, 1);

export default function Placement($$anchor) {
	let open5 = $.state(false);
	let placement = $.state("right");
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: () => ($.set(placement, "top"), $.set(open5, true)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Top drawer');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Button(node_1, {
		onclick: () => ($.set(placement, "left"), $.set(open5, true)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Left drawer');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => ($.set(placement, "right"), $.set(open5, true)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Right drawer');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	Button(node_3, {
		onclick: () => ($.set(placement, "bottom"), $.set(open5, true)),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Bottom drawer');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	CardPlaceholder(node_4, { size: '2xl', class: 'mt-6' });
	$.reset(div);

	var node_5 = $.sibling(div, 2);

	Drawer(node_5, {
		get placement() {
			return $.get(placement);
		},

		get open() {
			return $.get(open5);
		},

		set open($$value) {
			$.set(open5, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var h5 = $.first_child(fragment_1);
			var node_6 = $.child(h5);

			InfoCircleSolid(node_6, { class: 'me-2.5 h-5 w-5' });
			$.next();
			$.reset(h5);

			var div_2 = $.sibling(h5, 4);
			var node_7 = $.child(div_2);

			Button(node_7, {
				color: 'light',
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Learn more');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Button(node_8, {
				href: '/',
				class: 'px-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node_9 = $.sibling($.first_child(fragment_2));

					ArrowRightOutline(node_9, { class: 'ms-2 h-5 w-5' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
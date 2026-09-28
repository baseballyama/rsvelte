import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Drawer, CardPlaceholder, Button } from "flowbite-svelte";
import { InfoCircleSolid, ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Get access <!>`, 1);
var root_1 = $.from_html(`<h5 class="mb-4 inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400"><!>Info</h5> <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">Supercharge your hiring by taking advantage of our <a href="/" class="text-primary-600 dark:text-primary-500 underline hover:no-underline">limited-time sale</a> for Flowbite Docs + Job Board. Unlimited access to over 190K top-ranked candidates and the #1 design job board.</p> <div class="grid grid-cols-2 gap-2"><!> <!></div>`, 1);
var root_2 = $.from_html(`<div class="text-center"><!> <!></div> <!>`, 1);

export default function DisablingOutside($$anchor) {
	let openDisablingOnlyOutsideClick = $.state(false);
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: () => $.set(openDisablingOnlyOutsideClick, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Show drawer');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	CardPlaceholder(node_1, { size: '2xl', class: 'mt-6' });
	$.reset(div);

	var node_2 = $.sibling(div, 2);

	Drawer(node_2, {
		outsideclose: false,
		get open() {
			return $.get(openDisablingOnlyOutsideClick);
		},

		set open($$value) {
			$.set(openDisablingOnlyOutsideClick, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var h5 = $.first_child(fragment_1);
			var node_3 = $.child(h5);

			InfoCircleSolid(node_3, { class: 'me-2.5 h-5 w-5' });
			$.next();
			$.reset(h5);

			var div_1 = $.sibling(h5, 4);
			var node_4 = $.child(div_1);

			Button(node_4, {
				color: 'light',
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Learn more');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Button(node_5, {
				href: '/',
				class: 'px-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node_6 = $.sibling($.first_child(fragment_2));

					ArrowRightOutline(node_6, { class: 'ms-2 h-5 w-5' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
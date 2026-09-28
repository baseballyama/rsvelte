import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Drawer, Button, A } from "flowbite-svelte";
import { InfoCircleSolid, ArrowRightOutline } from "flowbite-svelte-icons";
import { sineIn } from "svelte/easing";

var root = $.from_html(`Get access <!>`, 1);

var root_1 = $.from_html(
	`<h5 id="drawer-label" class="mb-4 inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400"><!>Top drawer</h5> <p class="mb-6 max-w-lg text-sm text-gray-500 dark:text-gray-400">Supercharge your hiring by taking advantage of our <!> for Flowbite Docs + Job Board. Unlimited
    access to over 190K top-ranked candidates and the #1 design job board.</p> <!> <!>`,
	1
);

var root_2 = $.from_html(`<div class="text-center"><!></div> <!>`, 1);

export default function Top($$anchor) {
	let open7 = $.state(false);
	let transitionParamsTop = { y: -320, duration: 200, easing: sineIn };
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Button(node, {
		onclick: () => $.set(open7, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Show drawer');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_1 = $.sibling(div, 2);

	Drawer(node_1, {
		placement: 'top',
		class: 'w-full',
		get transitionParams() {
			return transitionParamsTop;
		},

		get open() {
			return $.get(open7);
		},

		set open($$value) {
			$.set(open7, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var h5 = $.first_child(fragment_1);
			var node_2 = $.child(h5);

			InfoCircleSolid(node_2, { class: 'me-2.5 h-5 w-5' });
			$.next();
			$.reset(h5);

			var p = $.sibling(h5, 2);
			var node_3 = $.sibling($.child(p));

			A(node_3, {
				href: '/',
				class: 'text-primary-600 dark:text-primary-500 underline hover:no-underline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('limited-time sale');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.next();
			$.reset(p);

			var node_4 = $.sibling(p, 2);

			Button(node_4, {
				color: 'light',
				href: '/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Learn more');

					$.append($$anchor, text_2);
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

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
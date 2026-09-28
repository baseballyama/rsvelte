import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { slide } from "svelte/transition";
import { quintOut } from "svelte/easing";
import { Banner, Skeleton, ImagePlaceholder, A } from "flowbite-svelte";
import { BullhornSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<p class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400"><span class="me-3 inline-flex rounded-full bg-gray-200 p-1 dark:bg-gray-600"><!> <span class="sr-only">Light bulb</span></span> <span>New brand identity has been launched for the <!></span></p>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Transition($$anchor) {
	const params = { delay: 250, duration: 500, easing: quintOut };
	var fragment = root_1();
	var node = $.first_child(fragment);

	Skeleton(node, { class: 'py-4' });

	var node_1 = $.sibling(node, 2);

	ImagePlaceholder(node_1, { class: 'py-4' });

	var node_2 = $.sibling(node_1, 2);

	Banner(node_2, {
		get transition() {
			return slide;
		},

		get params() {
			return params;
		},
		class: 'absolute',
		children: ($$anchor, $$slotProps) => {
			var p = root();
			var span = $.child(p);
			var node_3 = $.child(span);

			BullhornSolid(node_3, { class: 'h-3 w-3 text-gray-500 dark:text-gray-400' });
			$.next(2);
			$.reset(span);

			var span_1 = $.sibling(span, 2);
			var node_4 = $.sibling($.child(span_1));

			A(node_4, {
				href: 'https://flowbite.com',
				class: 'font-medium underline decoration-solid decoration-2 underline-offset-2 hover:no-underline dark:decoration-1',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Flowbite Library');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(span_1);
			$.reset(p);
			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
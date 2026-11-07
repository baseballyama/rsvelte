import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Banner, Skeleton, ImagePlaceholder, Button } from "flowbite-svelte";
import { BookOpenOutline, ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> Learn more`, 1);
var root_1 = $.from_html(`Get started <!>`, 1);
var root_2 = $.from_html(`<div class="mb-4 md:me-4 md:mb-0"><h2 class="mb-1 text-base font-semibold text-gray-900 dark:text-white">Integration is the key</h2> <p class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400">You can integrate Flowbite with many tools to make your work even more efficient and lightning fast based on Tailwind CSS.</p></div> <div class="flex shrink-0 items-center gap-3"><!> <!></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Informational($$anchor) {
	var fragment = root_3();
	var node = $.first_child(fragment);

	Skeleton(node, { class: 'py-4' });

	var node_1 = $.sibling(node, 2);

	ImagePlaceholder(node_1, { class: 'py-4' });

	var node_2 = $.sibling(node_1, 2);

	Banner(node_2, {
		class: 'absolute',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var div = $.sibling($.first_child(fragment_1), 2);
			var node_3 = $.child(div);

			Button(node_3, {
				href: '/',
				size: 'sm',
				color: 'alternative',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_4 = $.first_child(fragment_2);

					BookOpenOutline(node_4, { class: 'me-2 h-3 w-3' });
					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_3, 2);

			Button(node_5, {
				href: '/',
				size: 'sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_3 = root_1();
					var node_6 = $.sibling($.first_child(fragment_3));

					ArrowRightOutline(node_6, { class: 'ms-2 h-3 w-3' });
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
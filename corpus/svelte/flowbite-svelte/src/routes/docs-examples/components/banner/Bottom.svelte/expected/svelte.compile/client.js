import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Banner, Skeleton, ImagePlaceholder, A } from "flowbite-svelte";
import { SalePercentSolid, ArrowRightOutline } from "flowbite-svelte-icons";

var root = $.from_html(`Become a partner <!>`, 1);
var root_1 = $.from_html(`<p class="flex items-center text-sm font-normal text-gray-500 dark:text-gray-400"><span class="me-3 inline-flex rounded-full bg-gray-200 p-1 dark:bg-gray-600"><!> <span class="sr-only">Discount coupon</span></span> <span>Get 5% commission per sale <!></span></p>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Bottom($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Skeleton(node, { class: 'py-4' });

	var node_1 = $.sibling(node, 2);

	ImagePlaceholder(node_1, { class: 'py-4' });

	var node_2 = $.sibling(node_1, 2);

	Banner(node_2, {
		type: 'bottom',
		class: 'absolute',
		children: ($$anchor, $$slotProps) => {
			var p = root_1();
			var span = $.child(p);
			var node_3 = $.child(span);

			SalePercentSolid(node_3, { class: 'h-4 w-4 text-gray-500 dark:text-gray-400' });
			$.next(2);
			$.reset(span);

			var span_1 = $.sibling(span, 2);
			var node_4 = $.sibling($.child(span_1));

			A(node_4, {
				href: 'https://flowbite.com',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root();
					var node_5 = $.sibling($.first_child(fragment_1));

					ArrowRightOutline(node_5, { class: 'ms-2 h-3 w-3' });
					$.append($$anchor, fragment_1);
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
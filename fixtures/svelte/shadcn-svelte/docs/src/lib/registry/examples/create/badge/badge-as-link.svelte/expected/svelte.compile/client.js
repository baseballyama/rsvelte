import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`Link <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-wrap gap-2"><!> <!> <!> <!> <!> <!></div>`);

export default function Badge_as_link($$anchor) {
	Example($$anchor, {
		title: 'As Link',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			Badge(node, {
				href: '#/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_1 = root();
					var node_1 = $.sibling($.first_child(fragment_1));

					IconPlaceholder(node_1, {
						lucide: 'ArrowUpRightIcon',
						tabler: 'IconArrowUpRight',
						hugeicons: 'ArrowUpRightIcon',
						phosphor: 'ArrowUpRightIcon',
						remixicon: 'RiArrowRightUpLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			Badge(node_2, {
				variant: 'secondary',
				href: '#/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node_3 = $.sibling($.first_child(fragment_2));

					IconPlaceholder(node_3, {
						lucide: 'ArrowUpRightIcon',
						tabler: 'IconArrowUpRight',
						hugeicons: 'ArrowUpRightIcon',
						phosphor: 'ArrowUpRightIcon',
						remixicon: 'RiArrowRightUpLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Badge(node_4, {
				variant: 'destructive',
				href: '#/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_3 = root();
					var node_5 = $.sibling($.first_child(fragment_3));

					IconPlaceholder(node_5, {
						lucide: 'ArrowUpRightIcon',
						tabler: 'IconArrowUpRight',
						hugeicons: 'ArrowUpRightIcon',
						phosphor: 'ArrowUpRightIcon',
						remixicon: 'RiArrowRightUpLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Badge(node_6, {
				variant: 'outline',
				href: '#/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_4 = root();
					var node_7 = $.sibling($.first_child(fragment_4));

					IconPlaceholder(node_7, {
						lucide: 'ArrowUpRightIcon',
						tabler: 'IconArrowUpRight',
						hugeicons: 'ArrowUpRightIcon',
						phosphor: 'ArrowUpRightIcon',
						remixicon: 'RiArrowRightUpLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_6, 2);

			Badge(node_8, {
				variant: 'ghost',
				href: '#/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_5 = root();
					var node_9 = $.sibling($.first_child(fragment_5));

					IconPlaceholder(node_9, {
						lucide: 'ArrowUpRightIcon',
						tabler: 'IconArrowUpRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowUpRightIcon',
						remixicon: 'RiArrowRightUpLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_8, 2);

			Badge(node_10, {
				variant: 'link',
				href: '#/',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_6 = root();
					var node_11 = $.sibling($.first_child(fragment_6));

					IconPlaceholder(node_11, {
						lucide: 'ArrowUpRightIcon',
						tabler: 'IconArrowUpRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowUpRightIcon',
						remixicon: 'RiArrowRightUpLine',
						'data-icon': 'inline-end'
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}
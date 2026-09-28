import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Default`, 1);
var root_1 = $.from_html(`<!> Secondary`, 1);
var root_2 = $.from_html(`<!> Destructive`, 1);
var root_3 = $.from_html(`<!> Outline`, 1);
var root_4 = $.from_html(`<!> Ghost`, 1);
var root_5 = $.from_html(`<!> Link`, 1);
var root_6 = $.from_html(`<div class="flex flex-wrap gap-2"><!> <!> <!> <!> <!> <!></div>`);

export default function Badge_with_icon_left($$anchor) {
	Example($$anchor, {
		title: 'Icon Left',
		class: 'max-w-fit',
		children: ($$anchor, $$slotProps) => {
			var div = root_6();
			var node = $.child(div);

			Badge(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					IconPlaceholder(node_1, {
						lucide: 'BadgeCheck',
						tabler: 'IconRosetteDiscountCheck',
						hugeicons: 'CheckmarkBadge02Icon',
						phosphor: 'CheckCircleIcon',
						remixicon: 'RiCheckboxCircleLine',
						'data-icon': 'inline-start'
					});

					$.next();
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			Badge(node_2, {
				variant: 'secondary',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_3 = $.first_child(fragment_2);

					IconPlaceholder(node_3, {
						lucide: 'BadgeCheck',
						tabler: 'IconRosetteDiscountCheck',
						hugeicons: 'CheckmarkBadge02Icon',
						phosphor: 'CheckCircleIcon',
						remixicon: 'RiCheckboxCircleLine',
						'data-icon': 'inline-start'
					});

					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			Badge(node_4, {
				variant: 'destructive',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var node_5 = $.first_child(fragment_3);

					IconPlaceholder(node_5, {
						lucide: 'BadgeCheck',
						tabler: 'IconRosetteDiscountCheck',
						hugeicons: 'CheckmarkBadge02Icon',
						phosphor: 'CheckCircleIcon',
						remixicon: 'RiCheckboxCircleLine',
						'data-icon': 'inline-start'
					});

					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_4, 2);

			Badge(node_6, {
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_3();
					var node_7 = $.first_child(fragment_4);

					IconPlaceholder(node_7, {
						lucide: 'BadgeCheck',
						tabler: 'IconRosetteDiscountCheck',
						hugeicons: 'CheckmarkBadge02Icon',
						phosphor: 'CheckCircleIcon',
						remixicon: 'RiCheckboxCircleLine',
						'data-icon': 'inline-start'
					});

					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_6, 2);

			Badge(node_8, {
				variant: 'ghost',
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_4();
					var node_9 = $.first_child(fragment_5);

					IconPlaceholder(node_9, {
						lucide: 'BadgeCheck',
						tabler: 'IconRosetteDiscountCheck',
						hugeicons: 'CheckmarkBadge02Icon',
						phosphor: 'CheckCircleIcon',
						remixicon: 'RiCheckboxCircleLine',
						'data-icon': 'inline-start'
					});

					$.next();
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_8, 2);

			Badge(node_10, {
				variant: 'link',
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_5();
					var node_11 = $.first_child(fragment_6);

					IconPlaceholder(node_11, {
						lucide: 'BadgeCheck',
						tabler: 'IconRosetteDiscountCheck',
						hugeicons: 'CheckmarkBadge02Icon',
						phosphor: 'CheckCircleIcon',
						remixicon: 'RiCheckboxCircleLine',
						'data-icon': 'inline-start'
					});

					$.next();
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
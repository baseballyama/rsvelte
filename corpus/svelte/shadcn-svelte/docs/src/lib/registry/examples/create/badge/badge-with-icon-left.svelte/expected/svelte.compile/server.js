import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Badge_with_icon_left($$renderer) {
	Example($$renderer, {
		title: 'Icon Left',
		class: 'max-w-fit',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap gap-2">`);

			Badge($$renderer, {
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'BadgeCheck',
						tabler: 'IconRosetteDiscountCheck',
						hugeicons: 'CheckmarkBadge02Icon',
						phosphor: 'CheckCircleIcon',
						remixicon: 'RiCheckboxCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'secondary',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'BadgeCheck',
						tabler: 'IconRosetteDiscountCheck',
						hugeicons: 'CheckmarkBadge02Icon',
						phosphor: 'CheckCircleIcon',
						remixicon: 'RiCheckboxCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'destructive',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'BadgeCheck',
						tabler: 'IconRosetteDiscountCheck',
						hugeicons: 'CheckmarkBadge02Icon',
						phosphor: 'CheckCircleIcon',
						remixicon: 'RiCheckboxCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Destructive`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'BadgeCheck',
						tabler: 'IconRosetteDiscountCheck',
						hugeicons: 'CheckmarkBadge02Icon',
						phosphor: 'CheckCircleIcon',
						remixicon: 'RiCheckboxCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Outline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'ghost',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'BadgeCheck',
						tabler: 'IconRosetteDiscountCheck',
						hugeicons: 'CheckmarkBadge02Icon',
						phosphor: 'CheckCircleIcon',
						remixicon: 'RiCheckboxCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Ghost`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'link',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'BadgeCheck',
						tabler: 'IconRosetteDiscountCheck',
						hugeicons: 'CheckmarkBadge02Icon',
						phosphor: 'CheckCircleIcon',
						remixicon: 'RiCheckboxCircleLine',
						'data-icon': 'inline-start'
					});

					$$renderer.push(`<!----> Link`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}
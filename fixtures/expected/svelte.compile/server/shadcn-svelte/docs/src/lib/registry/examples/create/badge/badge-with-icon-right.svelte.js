import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Badge_with_icon_right($$renderer) {
	Example($$renderer, {
		title: 'Icon Right',
		class: 'max-w-fit',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap gap-2">`);

			Badge($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default `);

					IconPlaceholder($$renderer, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary `);

					IconPlaceholder($$renderer, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'destructive',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Destructive `);

					IconPlaceholder($$renderer, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Outline `);

					IconPlaceholder($$renderer, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'ghost',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Ghost `);

					IconPlaceholder($$renderer, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'link',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link `);

					IconPlaceholder($$renderer, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}
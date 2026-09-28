import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Badge_as_link($$renderer) {
	Example($$renderer, {
		title: 'As Link',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap gap-2">`);

			Badge($$renderer, {
				href: '#/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link `);

					IconPlaceholder($$renderer, {
						lucide: 'ArrowUpRightIcon',
						tabler: 'IconArrowUpRight',
						hugeicons: 'ArrowUpRightIcon',
						phosphor: 'ArrowUpRightIcon',
						remixicon: 'RiArrowRightUpLine',
						'data-icon': 'inline-end'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'secondary',
				href: '#/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link `);

					IconPlaceholder($$renderer, {
						lucide: 'ArrowUpRightIcon',
						tabler: 'IconArrowUpRight',
						hugeicons: 'ArrowUpRightIcon',
						phosphor: 'ArrowUpRightIcon',
						remixicon: 'RiArrowRightUpLine',
						'data-icon': 'inline-end'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'destructive',
				href: '#/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link `);

					IconPlaceholder($$renderer, {
						lucide: 'ArrowUpRightIcon',
						tabler: 'IconArrowUpRight',
						hugeicons: 'ArrowUpRightIcon',
						phosphor: 'ArrowUpRightIcon',
						remixicon: 'RiArrowRightUpLine',
						'data-icon': 'inline-end'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'outline',
				href: '#/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link `);

					IconPlaceholder($$renderer, {
						lucide: 'ArrowUpRightIcon',
						tabler: 'IconArrowUpRight',
						hugeicons: 'ArrowUpRightIcon',
						phosphor: 'ArrowUpRightIcon',
						remixicon: 'RiArrowRightUpLine',
						'data-icon': 'inline-end'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'ghost',
				href: '#/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link `);

					IconPlaceholder($$renderer, {
						lucide: 'ArrowUpRightIcon',
						tabler: 'IconArrowUpRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowUpRightIcon',
						remixicon: 'RiArrowRightUpLine',
						'data-icon': 'inline-end'
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Badge($$renderer, {
				variant: 'link',
				href: '#/',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Link `);

					IconPlaceholder($$renderer, {
						lucide: 'ArrowUpRightIcon',
						tabler: 'IconArrowUpRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowUpRightIcon',
						remixicon: 'RiArrowRightUpLine',
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
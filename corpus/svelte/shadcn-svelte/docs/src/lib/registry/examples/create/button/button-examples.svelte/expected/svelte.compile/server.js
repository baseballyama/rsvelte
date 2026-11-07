import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_examples($$renderer) {
	Example($$renderer, {
		title: 'Examples',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-wrap items-center gap-4"><div class="flex items-center gap-2">`);

			Button($$renderer, {
				variant: 'outline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Cancel`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Submit `);

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

			$$renderer.push(`<!----></div> <div class="flex items-center gap-2">`);

			Button($$renderer, {
				variant: 'destructive',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Delete`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'icon',
				children: ($$renderer) => {
					IconPlaceholder($$renderer, {
						lucide: 'ArrowRightIcon',
						tabler: 'IconArrowRight',
						hugeicons: 'ArrowRight02Icon',
						phosphor: 'ArrowRightIcon',
						remixicon: 'RiArrowRightLine',
						'data-icon': 'inline-end'
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});
}
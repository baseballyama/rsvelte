import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_vertical($$renderer) {
	Example($$renderer, {
		title: 'Vertical',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex gap-6">`);

			ButtonGroup($$renderer, {
				orientation: 'vertical',
				'aria-label': 'Media controls',
				class: 'h-fit',
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'outline',
						size: 'icon',
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'PlusIcon',
								tabler: 'IconPlus',
								hugeicons: 'PlusSignIcon',
								phosphor: 'PlusIcon',
								remixicon: 'RiAddLine'
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'outline',
						size: 'icon',
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'MinusIcon',
								tabler: 'IconMinus',
								hugeicons: 'MinusSignIcon',
								phosphor: 'MinusIcon',
								remixicon: 'RiSubtractLine'
							});
						},
						$$slots: { default: true }
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
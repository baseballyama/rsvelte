import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_with_icons($$renderer) {
	Example($$renderer, {
		title: 'With Icons',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex flex-col gap-4">`);

			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'FlipHorizontalIcon',
								tabler: 'IconFlipHorizontal',
								hugeicons: 'FlipHorizontalIcon',
								phosphor: 'ArrowsHorizontalIcon',
								remixicon: 'RiFlipHorizontalLine'
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'FlipVerticalIcon',
								tabler: 'IconFlipVertical',
								hugeicons: 'FlipVerticalIcon',
								phosphor: 'ArrowsVerticalIcon',
								remixicon: 'RiFlipVerticalLine'
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'RotateCwIcon',
								tabler: 'IconRotateClockwise2',
								hugeicons: 'Rotate01Icon',
								phosphor: 'ArrowClockwiseIcon',
								remixicon: 'RiRefreshLine'
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
import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_with_like($$renderer) {
	Example($$renderer, {
		title: 'With Like',
		children: ($$renderer) => {
			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							IconPlaceholder($$renderer, {
								lucide: 'HeartIcon',
								tabler: 'IconBell',
								hugeicons: 'Notification02Icon',
								phosphor: 'HeartIcon',
								remixicon: 'RiHeartLine',
								'data-icon': 'inline-start'
							});

							$$renderer.push(`<!----> Like`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						variant: 'outline',
						size: 'icon',
						class: 'w-12',
						children: ($$renderer) => {
							$$renderer.push(`<!---->1.2K`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}
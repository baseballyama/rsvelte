import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_navigation($$renderer) {
	Example($$renderer, {
		title: 'Navigation',
		children: ($$renderer) => {
			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					ButtonGroup($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'ArrowLeftIcon',
										tabler: 'IconArrowLeft',
										hugeicons: 'ArrowLeft01Icon',
										phosphor: 'ArrowLeftIcon',
										remixicon: 'RiArrowLeftLine'
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'outline',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'ArrowRightIcon',
										tabler: 'IconArrowRight',
										hugeicons: 'ArrowRight01Icon',
										phosphor: 'ArrowRightIcon',
										remixicon: 'RiArrowRightLine'
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ButtonGroup($$renderer, {
						'aria-label': 'Single navigation button',
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'icon',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'ArrowLeftIcon',
										tabler: 'IconArrowLeft',
										hugeicons: 'ArrowLeft01Icon',
										phosphor: 'ArrowLeftIcon',
										remixicon: 'RiArrowLeftLine'
									});
								},
								$$slots: { default: true }
							});
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
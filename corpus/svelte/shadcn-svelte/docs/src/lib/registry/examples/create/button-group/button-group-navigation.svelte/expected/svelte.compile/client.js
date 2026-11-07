import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Button_group_navigation($$anchor) {
	Example($$anchor, {
		title: 'Navigation',
		children: ($$anchor, $$slotProps) => {
			ButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					ButtonGroup(node, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							Button(node_1, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'ArrowLeftIcon',
										tabler: 'IconArrowLeft',
										hugeicons: 'ArrowLeft01Icon',
										phosphor: 'ArrowLeftIcon',
										remixicon: 'RiArrowLeftLine'
									});
								},
								$$slots: { default: true }
							});

							var node_2 = $.sibling(node_1, 2);

							Button(node_2, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'ArrowRightIcon',
										tabler: 'IconArrowRight',
										hugeicons: 'ArrowRight01Icon',
										phosphor: 'ArrowRightIcon',
										remixicon: 'RiArrowRightLine'
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node, 2);

					ButtonGroup(node_3, {
						'aria-label': 'Single navigation button',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'outline',
								size: 'icon',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
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

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}
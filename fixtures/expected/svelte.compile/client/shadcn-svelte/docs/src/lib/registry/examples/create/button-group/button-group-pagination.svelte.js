import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Previous`, 1);
var root_1 = $.from_html(`Next <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Button_group_pagination($$anchor) {
	Example($$anchor, {
		title: 'Pagination',
		children: ($$anchor, $$slotProps) => {
			ButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node = $.first_child(fragment_2);

					Button(node, {
						variant: 'outline',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							IconPlaceholder(node_1, {
								lucide: 'ArrowLeftIcon',
								tabler: 'IconArrowLeft',
								hugeicons: 'ArrowLeft02Icon',
								phosphor: 'ArrowLeftIcon',
								remixicon: 'RiArrowLeftLine',
								'data-icon': 'inline-start'
							});

							$.next();
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node, 2);

					Button(node_2, {
						variant: 'outline',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('1');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						variant: 'outline',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('2');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Button(node_4, {
						variant: 'outline',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('3');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Button(node_5, {
						variant: 'outline',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('4');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Button(node_6, {
						variant: 'outline',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('5');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Button(node_7, {
						variant: 'outline',
						size: 'sm',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_4 = root_1();
							var node_8 = $.sibling($.first_child(fragment_4));

							IconPlaceholder(node_8, {
								lucide: 'ArrowRightIcon',
								tabler: 'IconArrowRight',
								hugeicons: 'ArrowRight02Icon',
								phosphor: 'ArrowRightIcon',
								remixicon: 'RiArrowRightLine',
								'data-icon': 'inline-end'
							});

							$.append($$anchor, fragment_4);
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
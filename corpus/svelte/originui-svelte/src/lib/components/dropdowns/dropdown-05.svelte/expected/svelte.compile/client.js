import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import Bolt from '@lucide/svelte/icons/bolt';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import CopyPlus from '@lucide/svelte/icons/copy-plus';
import Files from '@lucide/svelte/icons/files';
import Layers2 from '@lucide/svelte/icons/layers-2';
import Trash from '@lucide/svelte/icons/trash';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

var root = $.from_html(`Grouped items <!>`, 1);
var root_1 = $.from_html(`<!> Copy`, 1);
var root_2 = $.from_html(`<!> Edit`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> Group`, 1);
var root_5 = $.from_html(`<!> Clone`, 1);
var root_6 = $.from_html(`<!> Delete`, 1);
var root_7 = $.from_html(`<!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Dropdown_05($$anchor) {
	DropdownMenu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			{
				const child = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;

					Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_3 = root();
							var node_1 = $.sibling($.first_child(fragment_3));

							ChevronDown(node_1, { class: '-me-1 opacity-60', size: 16, 'aria-hidden': 'true' });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					}));
				};

				DropdownMenuTrigger(node, { child, $$slots: { child: true } });
			}

			var node_2 = $.sibling(node, 2);

			DropdownMenuContent(node_2, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_8();
					var node_3 = $.first_child(fragment_4);

					DropdownMenuLabel(node_3, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Label');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					DropdownMenuGroup(node_4, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_3();
							var node_5 = $.first_child(fragment_5);

							DropdownMenuItem(node_5, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_1();
									var node_6 = $.first_child(fragment_6);

									CopyPlus(node_6, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next();
									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_5, 2);

							DropdownMenuItem(node_7, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_2();
									var node_8 = $.first_child(fragment_7);

									Bolt(node_8, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next();
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_4, 2);

					DropdownMenuSeparator(node_9, {});

					var node_10 = $.sibling(node_9, 2);

					DropdownMenuLabel(node_10, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Label');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					DropdownMenuGroup(node_11, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_7();
							var node_12 = $.first_child(fragment_8);

							DropdownMenuItem(node_12, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_4();
									var node_13 = $.first_child(fragment_9);

									Layers2(node_13, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next();
									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							var node_14 = $.sibling(node_12, 2);

							DropdownMenuItem(node_14, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_5();
									var node_15 = $.first_child(fragment_10);

									Files(node_15, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next();
									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_14, 2);

							DropdownMenuItem(node_16, {
								class: 'text-destructive focus:text-destructive',
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_6();
									var node_17 = $.first_child(fragment_11);

									Trash(node_17, { size: 16, 'aria-hidden': 'true' });
									$.next();
									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
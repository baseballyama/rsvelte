import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "$lib/registry/ui/card/index.js";

import { Field, FieldGroup, FieldLabel } from "$lib/registry/ui/field/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "$lib/registry/ui/item/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-between"><!> <a href="/" class="text-xs font-medium tracking-wider text-muted-foreground uppercase hover:text-foreground">Forgot?</a></div> <!>`, 1);
var root_2 = $.from_html(`<!> Update Security`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Account_access($$anchor) {
	Card($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			CardHeader(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					CardTitle(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Account Access');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					CardDescription(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Update your credentials or re-authenticate.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			CardContent(node_3, {
				children: ($$anchor, $$slotProps) => {
					FieldGroup($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_4 = $.first_child(fragment_4);

							Field(node_4, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_5 = $.first_child(fragment_5);

									FieldLabel(node_5, {
										for: 'email-address',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Email Address');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_6 = $.sibling(node_5, 2);

									Input(node_6, {
										id: 'email-address',
										type: 'email',
										placeholder: 'artist@studio.inc'
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_4, 2);

							Field(node_7, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_1();
									var div = $.first_child(fragment_6);
									var node_8 = $.child(div);

									FieldLabel(node_8, {
										for: 'current-password',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Current Password');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.next(2);
									$.reset(div);

									var node_9 = $.sibling(div, 2);

									Input(node_9, {
										id: 'current-password',
										type: 'password',
										placeholder: '••••••••••••••••••••••••'
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_3, 2);

			CardFooter(node_10, {
				class: 'flex-col gap-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root();
					var node_11 = $.first_child(fragment_7);

					Button(node_11, {
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_2();
							var node_12 = $.first_child(fragment_8);

							IconPlaceholder(node_12, {
								lucide: 'LockKeyholeIcon',
								tabler: 'IconLock',
								hugeicons: 'SquareLock02Icon',
								phosphor: 'LockKeyIcon',
								remixicon: 'RiLockLine'
							});

							$.next();
							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_11, 2);

					Item(node_13, {
						variant: 'muted',
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root_3();
							var node_14 = $.first_child(fragment_9);

							ItemMedia(node_14, {
								variant: 'icon',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'CircleAlertIcon',
										tabler: 'IconAlertCircle',
										hugeicons: 'AlertCircleIcon',
										phosphor: 'WarningCircleIcon',
										remixicon: 'RiErrorWarningLine',
										class: 'text-destructive'
									});
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_14, 2);

							ItemContent(node_15, {
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root();
									var node_16 = $.first_child(fragment_11);

									ItemTitle(node_16, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Danger Zone');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});

									var node_17 = $.sibling(node_16, 2);

									ItemDescription(node_17, {
										class: 'line-clamp-1',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Archive account and remove catalog');

											$.append($$anchor, text_5);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});

							var node_18 = $.sibling(node_15, 2);

							IconPlaceholder(node_18, {
								lucide: 'ArrowRightIcon',
								tabler: 'IconArrowRight',
								hugeicons: 'ArrowRight01Icon',
								phosphor: 'ArrowRightIcon',
								remixicon: 'RiArrowRightLine',
								class: 'size-4'
							});

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
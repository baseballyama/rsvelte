import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ArchiveRestore from '@lucide/svelte/icons/archive-restore';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Plus from '@lucide/svelte/icons/plus';
import Share2 from '@lucide/svelte/icons/share-2';
import Trash from '@lucide/svelte/icons/trash';

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

var root = $.from_html(`Rich menu with icons <!>`, 1);
var root_1 = $.from_html(`<!> <span>New</span> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <span>Share</span>`, 1);
var root_5 = $.from_html(`<!> <span>Archive</span>`, 1);
var root_6 = $.from_html(`<!> <span>Delete</span> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Dropdown_09($$anchor) {
	let framework = $.state('sveltekit');
	let emailNotifications = $.state(true);
	let pushNotifications = $.state(false);

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
					var fragment_4 = root_7();
					var node_3 = $.first_child(fragment_4);

					DropdownMenuGroup(node_3, {
						children: ($$anchor, $$slotProps) => {
							DropdownMenuItem($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_1();
									var node_4 = $.first_child(fragment_6);

									Plus(node_4, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });

									var node_5 = $.sibling(node_4, 4);

									DropdownMenuShortcut(node_5, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('⌘N');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_3, 2);

					DropdownMenuSeparator(node_6, {});

					var node_7 = $.sibling(node_6, 2);

					DropdownMenuGroup(node_7, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root_3();
							var node_8 = $.first_child(fragment_7);

							DropdownMenuSub(node_8, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_3();
									var node_9 = $.first_child(fragment_8);

									DropdownMenuSubTrigger(node_9, {
										inset: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('Framework');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_9, 2);

									DropdownMenuSubContent(node_10, {
										children: ($$anchor, $$slotProps) => {
											DropdownMenuRadioGroup($$anchor, {
												get value() {
													return $.get(framework);
												},
												onValueChange: (value) => $.set(framework, value, true),
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = root_2();
													var node_11 = $.first_child(fragment_10);

													DropdownMenuRadioItem(node_11, {
														value: 'sveltekit',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('SvelteKit');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});

													var node_12 = $.sibling(node_11, 2);

													DropdownMenuRadioItem(node_12, {
														value: 'nextjs',
														disabled: true,
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Next.js');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});

													var node_13 = $.sibling(node_12, 2);

													DropdownMenuRadioItem(node_13, {
														value: 'remix',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Remix');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});

													var node_14 = $.sibling(node_13, 2);

													DropdownMenuRadioItem(node_14, {
														value: 'astro',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Astro');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_10);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_8, 2);

							DropdownMenuSub(node_15, {
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_3();
									var node_16 = $.first_child(fragment_11);

									DropdownMenuSubTrigger(node_16, {
										inset: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('Notifications');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									var node_17 = $.sibling(node_16, 2);

									DropdownMenuSubContent(node_17, {
										children: ($$anchor, $$slotProps) => {
											var fragment_12 = root_3();
											var node_18 = $.first_child(fragment_12);

											DropdownMenuCheckboxItem(node_18, {
												get checked() {
													return $.get(emailNotifications);
												},
												onCheckedChange: (checked) => $.set(emailNotifications, checked, true),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Email');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});

											var node_19 = $.sibling(node_18, 2);

											DropdownMenuCheckboxItem(node_19, {
												get checked() {
													return $.get(pushNotifications);
												},
												onCheckedChange: (checked) => $.set(pushNotifications, checked, true),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Push');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_12);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					var node_20 = $.sibling(node_7, 2);

					DropdownMenuSeparator(node_20, {});

					var node_21 = $.sibling(node_20, 2);

					DropdownMenuGroup(node_21, {
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_3();
							var node_22 = $.first_child(fragment_13);

							DropdownMenuItem(node_22, {
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root_4();
									var node_23 = $.first_child(fragment_14);

									Share2(node_23, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});

							var node_24 = $.sibling(node_22, 2);

							DropdownMenuItem(node_24, {
								children: ($$anchor, $$slotProps) => {
									var fragment_15 = root_5();
									var node_25 = $.first_child(fragment_15);

									ArchiveRestore(node_25, { size: 16, class: 'opacity-60', 'aria-hidden': 'true' });
									$.next(2);
									$.append($$anchor, fragment_15);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});

					var node_26 = $.sibling(node_21, 2);

					DropdownMenuSeparator(node_26, {});

					var node_27 = $.sibling(node_26, 2);

					DropdownMenuItem(node_27, {
						class: 'text-destructive focus:text-destructive',
						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root_6();
							var node_28 = $.first_child(fragment_16);

							Trash(node_28, { size: 16, 'aria-hidden': 'true' });

							var node_29 = $.sibling(node_28, 4);

							DropdownMenuShortcut(node_29, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('⌘⌫');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_16);
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
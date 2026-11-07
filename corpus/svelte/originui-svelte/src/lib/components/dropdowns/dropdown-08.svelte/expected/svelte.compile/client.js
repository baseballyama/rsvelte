import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/ui/button.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from '$lib/components/ui/dropdowns';

var root = $.from_html(`Rich menu <!>`, 1);
var root_1 = $.from_html(`<span>Edit</span> <!>`, 1);
var root_2 = $.from_html(`<span>Duplicate</span> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<span>Archive</span> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<span>Delete</span> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Dropdown_08($$anchor) {
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
							var fragment_5 = root_3();
							var node_4 = $.first_child(fragment_5);

							DropdownMenuItem(node_4, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_1();
									var node_5 = $.sibling($.first_child(fragment_6), 2);

									DropdownMenuShortcut(node_5, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('⌘E');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_4, 2);

							DropdownMenuItem(node_6, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_2();
									var node_7 = $.sibling($.first_child(fragment_7), 2);

									DropdownMenuShortcut(node_7, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('⌘D');

											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_3, 2);

					DropdownMenuSeparator(node_8, {});

					var node_9 = $.sibling(node_8, 2);

					DropdownMenuGroup(node_9, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root_3();
							var node_10 = $.first_child(fragment_8);

							DropdownMenuItem(node_10, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_4();
									var node_11 = $.sibling($.first_child(fragment_9), 2);

									DropdownMenuShortcut(node_11, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('⌘A');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_10, 2);

							DropdownMenuSub(node_12, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_3();
									var node_13 = $.first_child(fragment_10);

									DropdownMenuSubTrigger(node_13, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('More');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									var node_14 = $.sibling(node_13, 2);

									DropdownMenuSubContent(node_14, {
										children: ($$anchor, $$slotProps) => {
											var fragment_11 = root_5();
											var node_15 = $.first_child(fragment_11);

											DropdownMenuItem(node_15, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Move to project');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});

											var node_16 = $.sibling(node_15, 2);

											DropdownMenuItem(node_16, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Move to folder');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});

											var node_17 = $.sibling(node_16, 2);

											DropdownMenuSeparator(node_17, {});

											var node_18 = $.sibling(node_17, 2);

											DropdownMenuItem(node_18, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Advanced options');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_11);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_9, 2);

					DropdownMenuSeparator(node_19, {});

					var node_20 = $.sibling(node_19, 2);

					DropdownMenuGroup(node_20, {
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root_3();
							var node_21 = $.first_child(fragment_12);

							DropdownMenuItem(node_21, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Share');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							var node_22 = $.sibling(node_21, 2);

							DropdownMenuItem(node_22, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Add to favorites');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});

					var node_23 = $.sibling(node_20, 2);

					DropdownMenuSeparator(node_23, {});

					var node_24 = $.sibling(node_23, 2);

					DropdownMenuItem(node_24, {
						class: 'text-destructive focus:text-destructive',
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_6();
							var node_25 = $.sibling($.first_child(fragment_13), 2);

							DropdownMenuShortcut(node_25, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('⌘⌫');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_13);
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
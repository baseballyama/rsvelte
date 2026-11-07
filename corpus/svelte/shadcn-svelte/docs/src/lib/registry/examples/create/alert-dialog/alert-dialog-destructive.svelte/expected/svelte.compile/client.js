import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`This will permanently delete this chat conversation. View <a href="#/">Settings</a> delete any memories saved during this chat.`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Alert_dialog_destructive($$anchor) {
	let open = $.state(false);

	Example($$anchor, {
		title: 'Destructive',
		class: 'items-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
				AlertDialog_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => AlertDialog.Trigger, ($$anchor, AlertDialog_Trigger) => {
							AlertDialog_Trigger($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										variant: 'destructive',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Delete Chat');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
							AlertDialog_Content($$anchor, {
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_2();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
										AlertDialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => AlertDialog.Media, ($$anchor, AlertDialog_Media) => {
													AlertDialog_Media($$anchor, {
														class: 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive',
														children: ($$anchor, $$slotProps) => {
															IconPlaceholder($$anchor, {
																lucide: 'Trash2Icon',
																tabler: 'IconTrash',
																hugeicons: 'Delete02Icon',
																phosphor: 'TrashIcon',
																remixicon: 'RiDeleteBinLine'
															});
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
													AlertDialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Delete chat?');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
													AlertDialog_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var fragment_7 = root();

															$.next(2);
															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_7 = $.sibling(node_3, 2);

									$.component(node_7, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
										AlertDialog_Footer($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_2();
												var node_8 = $.first_child(fragment_8);

												$.component(node_8, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
													AlertDialog_Cancel($$anchor, {
														variant: 'ghost',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Cancel');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
													AlertDialog_Action($$anchor, {
														variant: 'destructive',
														onclick: () => $.set(open, false),
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Delete');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
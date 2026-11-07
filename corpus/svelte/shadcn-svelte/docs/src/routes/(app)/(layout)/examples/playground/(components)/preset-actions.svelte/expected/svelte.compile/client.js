import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

var root = $.from_html(`<span class="sr-only">Actions</span> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<span class="font-semibold">Show a warning when content is flagged</span> <span class="text-sm text-muted-foreground">A warning will be shown when sexual, hateful, violent or self-harm content is detected.</span>`, 1);
var root_4 = $.from_html(`<!> <div class="py-6"><h4 class="text-sm text-muted-foreground">Playground Warnings</h4> <div class="flex items-start justify-between space-x-4 pt-3"><!> <!></div></div> <!>`, 1);

export default function Preset_actions($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let showDeleteDialog = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: "secondary" }));

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_2 = $.sibling($.first_child(fragment_2), 2);

								EllipsisIcon(node_2, {});
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						align: 'end',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
								DropdownMenu_Item($$anchor, {
									onSelect: () => $.set(open, true),
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Content filter preferences');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
								DropdownMenu_Separator($$anchor, {});
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
								DropdownMenu_Item_1($$anchor, {
									onSelect: () => $.set(showDeleteDialog, true),
									class: 'text-red-600',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Delete preset');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node, 2);

	$.component(node_7, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_4 = $.comment();
				var node_8 = $.first_child(fragment_4);

				$.component(node_8, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_4();
							var node_9 = $.first_child(fragment_5);

							$.component(node_9, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_2();
										var node_10 = $.first_child(fragment_6);

										$.component(node_10, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Content filter preferences');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_10, 2);

										$.component(node_11, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('The content filter flags text that may violate our content policy. It\'s powered by our\n				moderation endpoint which is free to use to moderate your OpenAI API traffic. Learn more.');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var div = $.sibling(node_9, 2);
							var div_1 = $.sibling($.child(div), 2);
							var node_12 = $.child(div_1);

							Switch(node_12, { name: 'show', id: 'show', checked: true });

							var node_13 = $.sibling(node_12, 2);

							Label(node_13, {
								class: 'grid gap-1 font-normal',
								for: 'show',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_3();

									$.next(2);
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							$.reset(div_1);
							$.reset(div);

							var node_14 = $.sibling(div, 2);

							$.component(node_14, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										Button($$anchor, {
											variant: 'secondary',
											onclick: () => $.set(open, false),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Close');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	var node_15 = $.sibling(node_7, 2);

	$.component(node_15, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			get open() {
				return $.get(showDeleteDialog);
			},

			set open($$value) {
				$.set(showDeleteDialog, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_9 = $.comment();
				var node_16 = $.first_child(fragment_9);

				$.component(node_16, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root_2();
							var node_17 = $.first_child(fragment_10);

							$.component(node_17, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root_2();
										var node_18 = $.first_child(fragment_11);

										$.component(node_18, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Are you sure absolutely sure?');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_19 = $.sibling(node_18, 2);

										$.component(node_19, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('This action cannot be undone. This preset will no longer be accessible by you or others\n				you\'ve shared it with.');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							var node_20 = $.sibling(node_17, 2);

							$.component(node_20, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root_2();
										var node_21 = $.first_child(fragment_12);

										$.component(node_21, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Cancel');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										});

										var node_22 = $.sibling(node_21, 2);

										Button(node_22, {
											variant: 'destructive',
											onclick: () => {
												$.set(showDeleteDialog, false);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('Delete');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}
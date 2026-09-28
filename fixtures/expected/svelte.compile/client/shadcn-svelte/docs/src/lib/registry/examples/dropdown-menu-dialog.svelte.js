import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MoreHorizontal from "@lucide/svelte/icons/more-horizontal";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Dropdown_menu_dialog($$anchor, $$props) {
	$.push($$props, true);

	let showNewDialog = $.state(false);
	let showShareDialog = $.state(false);
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: "outline", size: "icon-sm" }));

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								MoreHorizontal($$anchor, {});
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						class: 'w-40',
						align: 'end',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
								DropdownMenu_Label($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('File Actions');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
								DropdownMenu_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
											DropdownMenu_Item($$anchor, {
												onSelect: () => $.set(showNewDialog, true),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('New File...');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
											DropdownMenu_Item_1($$anchor, {
												onSelect: () => $.set(showShareDialog, true),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Share...');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
											DropdownMenu_Item_2($$anchor, {
												disabled: true,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Download');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
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

	var node_8 = $.sibling(node, 2);

	$.component(node_8, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(showNewDialog);
			},

			set open($$value) {
				$.set(showNewDialog, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_5 = $.comment();
				var node_9 = $.first_child(fragment_5);

				$.component(node_9, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'sm:max-w-[425px]',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_10 = $.first_child(fragment_6);

							$.component(node_10, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_1();
										var node_11 = $.first_child(fragment_7);

										$.component(node_11, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Create New File');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_11, 2);

										$.component(node_12, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Provide a name for your new file. Click create when you\'re done.');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							var node_13 = $.sibling(node_10, 2);

							$.component(node_13, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									class: 'pb-3',
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = $.comment();
										var node_14 = $.first_child(fragment_8);

										$.component(node_14, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root_1();
													var node_15 = $.first_child(fragment_9);

													$.component(node_15, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'filename',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text('File Name');

																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														});
													});

													var node_16 = $.sibling(node_15, 2);

													Input(node_16, {
														id: 'filename',
														name: 'filename',
														placeholder: 'document.txt'
													});

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							var node_17 = $.sibling(node_13, 2);

							$.component(node_17, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
								Dialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root_1();
										var node_18 = $.first_child(fragment_10);

										{
											let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

											$.component(node_18, () => Dialog.Close, ($$anchor, Dialog_Close) => {
												Dialog_Close($$anchor, {
													get class() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_7 = $.text('Cancel');

														$.append($$anchor, text_7);
													},
													$$slots: { default: true }
												});
											});
										}

										var node_19 = $.sibling(node_18, 2);

										Button(node_19, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('Create');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	var node_20 = $.sibling(node_8, 2);

	$.component(node_20, () => Dialog.Root, ($$anchor, Dialog_Root_1) => {
		Dialog_Root_1($$anchor, {
			get open() {
				return $.get(showShareDialog);
			},

			set open($$value) {
				$.set(showShareDialog, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_11 = $.comment();
				var node_21 = $.first_child(fragment_11);

				$.component(node_21, () => Dialog.Content, ($$anchor, Dialog_Content_1) => {
					Dialog_Content_1($$anchor, {
						class: 'sm:max-w-[425px]',
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root();
							var node_22 = $.first_child(fragment_12);

							$.component(node_22, () => Dialog.Header, ($$anchor, Dialog_Header_1) => {
								Dialog_Header_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_13 = root_1();
										var node_23 = $.first_child(fragment_13);

										$.component(node_23, () => Dialog.Title, ($$anchor, Dialog_Title_1) => {
											Dialog_Title_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('Share File');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});
										});

										var node_24 = $.sibling(node_23, 2);

										$.component(node_24, () => Dialog.Description, ($$anchor, Dialog_Description_1) => {
											Dialog_Description_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_10 = $.text('Anyone with the link will be able to view this file.');

													$.append($$anchor, text_10);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_13);
									},
									$$slots: { default: true }
								});
							});

							var node_25 = $.sibling(node_22, 2);

							$.component(node_25, () => Field.Group, ($$anchor, Field_Group_1) => {
								Field_Group_1($$anchor, {
									class: 'py-3',
									children: ($$anchor, $$slotProps) => {
										var fragment_14 = root_1();
										var node_26 = $.first_child(fragment_14);

										$.component(node_26, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = root_1();
													var node_27 = $.first_child(fragment_15);

													Label(node_27, {
														for: 'email',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('Email Address');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});

													var node_28 = $.sibling(node_27, 2);

													Input(node_28, {
														id: 'email',
														name: 'email',
														type: 'email',
														placeholder: 'shadcn@vercel.com'
													});

													$.append($$anchor, fragment_15);
												},
												$$slots: { default: true }
											});
										});

										var node_29 = $.sibling(node_26, 2);

										$.component(node_29, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_16 = root_1();
													var node_30 = $.first_child(fragment_16);

													$.component(node_30, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'message',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_12 = $.text('Message (Optional)');

																$.append($$anchor, text_12);
															},
															$$slots: { default: true }
														});
													});

													var node_31 = $.sibling(node_30, 2);

													Textarea(node_31, {
														id: 'message',
														name: 'message',
														placeholder: 'Check out this file'
													});

													$.append($$anchor, fragment_16);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_14);
									},
									$$slots: { default: true }
								});
							});

							var node_32 = $.sibling(node_25, 2);

							$.component(node_32, () => Dialog.Footer, ($$anchor, Dialog_Footer_1) => {
								Dialog_Footer_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_17 = root_1();
										var node_33 = $.first_child(fragment_17);

										{
											let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

											$.component(node_33, () => Dialog.Close, ($$anchor, Dialog_Close_1) => {
												Dialog_Close_1($$anchor, {
													get class() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_13 = $.text('Cancel');

														$.append($$anchor, text_13);
													},
													$$slots: { default: true }
												});
											});
										}

										var node_34 = $.sibling(node_33, 2);

										Button(node_34, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_14 = $.text('Send Invite');

												$.append($$anchor, text_14);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_17);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_11);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}
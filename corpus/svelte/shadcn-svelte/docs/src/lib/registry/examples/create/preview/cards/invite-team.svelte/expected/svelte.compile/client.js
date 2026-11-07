import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> Add another`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-3"><div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div></div> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Invite_team($$anchor, $$props) {
	$.push($$props, true);

	const roles = [
		{ value: "admin", label: "Admin" },
		{ value: "editor", label: "Editor" },
		{ value: "viewer", label: "Viewer" }
	];

	let role1 = $.state("editor");
	let role2 = $.state("viewer");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Invite Team');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Add members to your workspace');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var div = $.first_child(fragment_3);
							var div_1 = $.child(div);
							var node_5 = $.child(div_1);

							$.component(node_5, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
								InputGroup_Root($$anchor, {
									class: 'flex-1',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
											InputGroup_Input($$anchor, { value: 'alex@example.com', readonly: true });
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_5, 2);

							$.component(node_7, () => Select.Root, ($$anchor, Select_Root) => {
								Select_Root($$anchor, {
									type: 'single',
									get value() {
										return $.get(role1);
									},

									set value($$value) {
										$.set(role1, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_8 = $.first_child(fragment_5);

										$.component(node_8, () => Select.Trigger, ($$anchor, Select_Trigger) => {
											Select_Trigger($$anchor, {
												class: 'w-24',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text();

													$.template_effect(($0) => $.set_text(text_2, $0), [
														() => roles.find((role) => role.value === $.get(role1))?.label
													]);

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => Select.Content, ($$anchor, Select_Content) => {
											Select_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = $.comment();
													var node_10 = $.first_child(fragment_7);

													$.each(node_10, 17, () => roles, (role) => role.value, ($$anchor, role) => {
														var fragment_8 = $.comment();
														var node_11 = $.first_child(fragment_8);

														$.component(node_11, () => Select.Item, ($$anchor, Select_Item) => {
															Select_Item($$anchor, {
																get value() {
																	return $.get(role).value;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text();

																	$.template_effect(() => $.set_text(text_3, $.get(role).label));
																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_8);
													});

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

							$.reset(div_1);

							var div_2 = $.sibling(div_1, 2);
							var node_12 = $.child(div_2);

							$.component(node_12, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
								InputGroup_Root_1($$anchor, {
									class: 'flex-1',
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = $.comment();
										var node_13 = $.first_child(fragment_10);

										$.component(node_13, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
											InputGroup_Input_1($$anchor, { value: 'sam@example.com', readonly: true });
										});

										$.append($$anchor, fragment_10);
									},
									$$slots: { default: true }
								});
							});

							var node_14 = $.sibling(node_12, 2);

							$.component(node_14, () => Select.Root, ($$anchor, Select_Root_1) => {
								Select_Root_1($$anchor, {
									type: 'single',
									get value() {
										return $.get(role2);
									},

									set value($$value) {
										$.set(role2, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root();
										var node_15 = $.first_child(fragment_11);

										$.component(node_15, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
											Select_Trigger_1($$anchor, {
												class: 'w-24',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text();

													$.template_effect(($0) => $.set_text(text_4, $0), [
														() => roles.find((role) => role.value === $.get(role2))?.label
													]);

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_15, 2);

										$.component(node_16, () => Select.Content, ($$anchor, Select_Content_1) => {
											Select_Content_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = $.comment();
													var node_17 = $.first_child(fragment_13);

													$.each(node_17, 17, () => roles, (role) => role.value, ($$anchor, role) => {
														var fragment_14 = $.comment();
														var node_18 = $.first_child(fragment_14);

														$.component(node_18, () => Select.Item, ($$anchor, Select_Item_1) => {
															Select_Item_1($$anchor, {
																get value() {
																	return $.get(role).value;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_5 = $.text();

																	$.template_effect(() => $.set_text(text_5, $.get(role).label));
																	$.append($$anchor, text_5);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_14);
													});

													$.append($$anchor, fragment_13);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_2);
							$.reset(div);

							var node_19 = $.sibling(div, 2);

							Button(node_19, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									var fragment_16 = root_1();
									var node_20 = $.first_child(fragment_16);

									IconPlaceholder(node_20, {
										lucide: 'PlusIcon',
										tabler: 'IconPlus',
										hugeicons: 'PlusSignIcon',
										phosphor: 'PlusIcon',
										remixicon: 'RiAddLine',
										'data-icon': 'inline-start'
									});

									$.next();
									$.append($$anchor, fragment_16);
								},
								$$slots: { default: true }
							});

							var node_21 = $.sibling(node_19, 2);

							Separator(node_21, {});

							var node_22 = $.sibling(node_21, 2);

							$.component(node_22, () => Field.Field, ($$anchor, Field_Field) => {
								Field_Field($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_17 = root();
										var node_23 = $.first_child(fragment_17);

										$.component(node_23, () => Field.Label, ($$anchor, Field_Label) => {
											Field_Label($$anchor, {
												for: 'invite-link',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Or share invite link');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_24 = $.sibling(node_23, 2);

										$.component(node_24, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
											InputGroup_Root_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_18 = root();
													var node_25 = $.first_child(fragment_18);

													$.component(node_25, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
														InputGroup_Input_2($$anchor, {
															id: 'invite-link',
															value: 'https://app.co/invite/x8f2k',
															readonly: true
														});
													});

													var node_26 = $.sibling(node_25, 2);

													$.component(node_26, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
														InputGroup_Addon($$anchor, {
															align: 'inline-end',
															children: ($$anchor, $$slotProps) => {
																var fragment_19 = $.comment();
																var node_27 = $.first_child(fragment_19);

																$.component(node_27, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
																	InputGroup_Button($$anchor, {
																		size: 'icon-xs',
																		'aria-label': 'Copy link',
																		children: ($$anchor, $$slotProps) => {
																			IconPlaceholder($$anchor, {
																				lucide: 'CopyIcon',
																				tabler: 'IconCopy',
																				hugeicons: 'Copy01Icon',
																				phosphor: 'CopyIcon',
																				remixicon: 'RiFileCopyLine'
																			});
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_19);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_18);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_17);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_28 = $.sibling(node_4, 2);

				$.component(node_28, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Send Invites');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}
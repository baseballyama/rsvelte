import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<form><!> <!></form>`);

export default function Dialog_with_form($$anchor) {
	Example($$anchor, {
		title: 'With Form',
		class: 'w-full items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var form = root_2();
						var node_1 = $.child(form);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Edit Profile');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
								Dialog_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
							Dialog_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
										Dialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
													Dialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Edit profile');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
													Dialog_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Make changes to your profile here. Click save when you\'re done. Your profile will\n						be updated immediately.');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_3, 2);

									$.component(node_6, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_7 = $.first_child(fragment_5);

												$.component(node_7, () => Field.Field, ($$anchor, Field_Field) => {
													Field_Field($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root();
															var node_8 = $.first_child(fragment_6);

															$.component(node_8, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	for: 'name-1',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Name');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_9 = $.sibling(node_8, 2);

															Input(node_9, { id: 'name-1', name: 'name', value: 'Pedro Duarte' });
															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_7, 2);

												$.component(node_10, () => Field.Field, ($$anchor, Field_Field_1) => {
													Field_Field_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_11 = $.first_child(fragment_7);

															$.component(node_11, () => Field.Label, ($$anchor, Field_Label_1) => {
																Field_Label_1($$anchor, {
																	for: 'username-1',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('Username');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															var node_12 = $.sibling(node_11, 2);

															Input(node_12, { id: 'username-1', name: 'username', value: '@peduarte' });
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

									var node_13 = $.sibling(node_6, 2);

									$.component(node_13, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
										Dialog_Footer($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_14 = $.first_child(fragment_8);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text('Cancel');

																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														}));
													};

													$.component(node_14, () => Dialog.Close, ($$anchor, Dialog_Close) => {
														Dialog_Close($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_15 = $.sibling(node_14, 2);

												Button(node_15, {
													type: 'submit',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_6 = $.text('Save changes');

														$.append($$anchor, text_6);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.reset(form);
						$.append($$anchor, form);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}
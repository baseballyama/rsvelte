import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Sheet from "$lib/registry/ui/sheet/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <div class="style-vega:px-4 style-nova:px-4 style-lyra:px-4 style-maia:px-6 style-mira:px-6 style-luma:px-6 style-rhea:px-6"><!></div> <!>`, 1);

export default function Sheet_with_form($$anchor) {
	Example($$anchor, {
		title: 'With Form',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Sheet.Root, ($$anchor, Sheet_Root) => {
				Sheet_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Open');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Sheet.Trigger, ($$anchor, Sheet_Trigger) => {
								Sheet_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Sheet.Content, ($$anchor, Sheet_Content) => {
							Sheet_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Sheet.Header, ($$anchor, Sheet_Header) => {
										Sheet_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => Sheet.Title, ($$anchor, Sheet_Title) => {
													Sheet_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Edit profile');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Sheet.Description, ($$anchor, Sheet_Description) => {
													Sheet_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Make changes to your profile here. Click save when you\'re done.');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var div = $.sibling(node_3, 2);
									var node_6 = $.child(div);

									$.component(node_6, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_7 = $.first_child(fragment_6);

												$.component(node_7, () => Field.Field, ($$anchor, Field_Field) => {
													Field_Field($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_8 = $.first_child(fragment_7);

															$.component(node_8, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	for: 'sheet-demo-name',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Name');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_9 = $.sibling(node_8, 2);

															Input(node_9, { id: 'sheet-demo-name', value: 'Pedro Duarte' });
															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_7, 2);

												$.component(node_10, () => Field.Field, ($$anchor, Field_Field_1) => {
													Field_Field_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root();
															var node_11 = $.first_child(fragment_8);

															$.component(node_11, () => Field.Label, ($$anchor, Field_Label_1) => {
																Field_Label_1($$anchor, {
																	for: 'sheet-demo-username',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('Username');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															var node_12 = $.sibling(node_11, 2);

															Input(node_12, { id: 'sheet-demo-username', value: '@peduarte' });
															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div);

									var node_13 = $.sibling(div, 2);

									$.component(node_13, () => Sheet.Footer, ($$anchor, Sheet_Footer) => {
										Sheet_Footer($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root();
												var node_14 = $.first_child(fragment_9);

												Button(node_14, {
													type: 'submit',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text('Save changes');

														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});

												var node_15 = $.sibling(node_14, 2);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_6 = $.text('Close');

																$.append($$anchor, text_6);
															},
															$$slots: { default: true }
														}));
													};

													$.component(node_15, () => Sheet.Close, ($$anchor, Sheet_Close) => {
														Sheet_Close($$anchor, { child, $$slots: { child: true } });
													});
												}

												$.append($$anchor, fragment_9);
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
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Input from "$lib/registry/ui/input/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Collapsible_settings($$anchor) {
	let isOpen = $.state(false);

	Example($$anchor, {
		title: 'Settings',
		class: 'items-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'mx-auto w-full max-w-xs',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Radius');

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

												var text_1 = $.text('Set the corner radius of the element.');

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

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
										Collapsible_Root($$anchor, {
											class: 'flex items-start gap-2',
											get open() {
												return $.get(isOpen);
											},

											set open($$value) {
												$.set(isOpen, $$value, true);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_6 = $.first_child(fragment_5);

												$.component(node_6, () => Field.Group, ($$anchor, Field_Group) => {
													Field_Group($$anchor, {
														class: 'grid w-full grid-cols-2 gap-2',
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_1();
															var node_7 = $.first_child(fragment_6);

															$.component(node_7, () => Field.Field, ($$anchor, Field_Field) => {
																Field_Field($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root();
																		var node_8 = $.first_child(fragment_7);

																		$.component(node_8, () => Field.Label, ($$anchor, Field_Label) => {
																			Field_Label($$anchor, {
																				for: 'radius-x',
																				class: 'sr-only',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_2 = $.text('Radius X');

																					$.append($$anchor, text_2);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_9 = $.sibling(node_8, 2);

																		$.component(node_9, () => Input.Root, ($$anchor, Input_Root) => {
																			Input_Root($$anchor, { id: 'radius', placeholder: '0' });
																		});

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
																				for: 'radius-y',
																				class: 'sr-only',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_3 = $.text('Radius Y');

																					$.append($$anchor, text_3);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_12 = $.sibling(node_11, 2);

																		$.component(node_12, () => Input.Root, ($$anchor, Input_Root_1) => {
																			Input_Root_1($$anchor, { id: 'radius', placeholder: '0' });
																		});

																		$.append($$anchor, fragment_8);
																	},
																	$$slots: { default: true }
																});
															});

															var node_13 = $.sibling(node_10, 2);

															$.component(node_13, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
																Collapsible_Content($$anchor, {
																	class: 'col-span-full grid grid-cols-subgrid gap-2',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = root();
																		var node_14 = $.first_child(fragment_9);

																		$.component(node_14, () => Field.Field, ($$anchor, Field_Field_2) => {
																			Field_Field_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = root();
																					var node_15 = $.first_child(fragment_10);

																					$.component(node_15, () => Field.Label, ($$anchor, Field_Label_2) => {
																						Field_Label_2($$anchor, {
																							for: 'radius-x',
																							class: 'sr-only',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_4 = $.text('Radius X');

																								$.append($$anchor, text_4);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_16 = $.sibling(node_15, 2);

																					$.component(node_16, () => Input.Root, ($$anchor, Input_Root_2) => {
																						Input_Root_2($$anchor, { id: 'radius', placeholder: '0' });
																					});

																					$.append($$anchor, fragment_10);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_17 = $.sibling(node_14, 2);

																		$.component(node_17, () => Field.Field, ($$anchor, Field_Field_3) => {
																			Field_Field_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = root();
																					var node_18 = $.first_child(fragment_11);

																					$.component(node_18, () => Field.Label, ($$anchor, Field_Label_3) => {
																						Field_Label_3($$anchor, {
																							for: 'radius-y',
																							class: 'sr-only',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_5 = $.text('Radius Y');

																								$.append($$anchor, text_5);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_19 = $.sibling(node_18, 2);

																					$.component(node_19, () => Input.Root, ($$anchor, Input_Root_3) => {
																						Input_Root_3($$anchor, { id: 'radius', placeholder: '0' });
																					});

																					$.append($$anchor, fragment_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_9);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_20 = $.sibling(node_6, 2);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;
														var fragment_12 = $.comment();
														var node_21 = $.first_child(fragment_12);

														$.component(node_21, () => Button.Root, ($$anchor, Button_Root) => {
															Button_Root($$anchor, $.spread_props({ variant: 'outline', size: 'icon' }, props, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_13 = $.comment();
																	var node_22 = $.first_child(fragment_13);

																	{
																		var consequent = ($$anchor) => {
																			IconPlaceholder($$anchor, {
																				lucide: 'MinimizeIcon',
																				tabler: 'IconMinimize',
																				hugeicons: 'ArrowShrinkIcon',
																				phosphor: 'CornersInIcon',
																				remixicon: 'RiContractUpDownLine'
																			});
																		};

																		var alternate = ($$anchor) => {
																			IconPlaceholder($$anchor, {
																				lucide: 'MaximizeIcon',
																				tabler: 'IconBorderCorners',
																				hugeicons: 'ArrowExpandIcon',
																				phosphor: 'CornersOutIcon',
																				remixicon: 'RiExpandUpDownLine'
																			});
																		};

																		$.if(node_22, ($$render) => {
																			if ($.get(isOpen)) $$render(consequent); else $$render(alternate, -1);
																		});
																	}

																	$.append($$anchor, fragment_13);
																},
																$$slots: { default: true }
															}));
														});

														$.append($$anchor, fragment_12);
													};

													$.component(node_20, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
														Collapsible_Trigger($$anchor, { class: 'rounded-md', child, $$slots: { child: true } });
													});
												}

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
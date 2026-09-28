import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Alert from "$lib/registry/ui/alert/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`Your use is subject to Vercel's <a href="#/">Public Beta Agreement</a> and <a href="#/">AI Product Terms</a>.`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<strong> </strong> `, 1);
var root_3 = $.from_html(`<strong> </strong> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <div class="no-scrollbar flex max-h-[50vh] flex-col gap-4 overflow-y-auto"><!> <!></div> <!>`, 1);

export default function Activate_agent_dialog($$anchor) {
	const agentFeatures = [
		{
			id: "code-reviews",
			title: "Code reviews",
			description: "with full codebase context to catch",
			highlight: "hard-to-find",
			endText: "bugs."
		},

		{
			id: "code-suggestions",
			title: "Code suggestions",
			description: "validated in sandboxes before you merge."
		},

		{
			id: "root-cause",
			title: "Root-cause analysis",
			description: "for production issues with deployment context.",
			hasBadge: true
		}
	];

	Example($$anchor, {
		title: 'Activate Agent',
		class: 'items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
				Dialog_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Activate Agent');

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
								showCloseButton: false,
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_4();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
										Dialog_Header($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
													Dialog_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Ship faster & safer with Vercel Agent');

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

															var fragment_6 = root();

															$.next(4);
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

									var div = $.sibling(node_3, 2);
									var node_6 = $.child(div);

									$.component(node_6, () => Item.Group, ($$anchor, Item_Group) => {
										Item_Group($$anchor, {
											class: 'gap-0 pr-2',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = $.comment();
												var node_7 = $.first_child(fragment_7);

												$.each(node_7, 17, () => agentFeatures, (feature) => feature.id, ($$anchor, feature) => {
													var fragment_8 = $.comment();
													var node_8 = $.first_child(fragment_8);

													$.component(node_8, () => Item.Root, ($$anchor, Item_Root) => {
														Item_Root($$anchor, {
															size: 'xs',
															class: 'px-0',
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = root_1();
																var node_9 = $.first_child(fragment_9);

																$.component(node_9, () => Item.Media, ($$anchor, Item_Media) => {
																	Item_Media($$anchor, {
																		variant: 'icon',
																		class: 'self-start',
																		children: ($$anchor, $$slotProps) => {
																			IconPlaceholder($$anchor, {
																				lucide: 'CheckCircle2Icon',
																				tabler: 'IconCircleCheckFilled',
																				hugeicons: 'CheckmarkCircle02Icon',
																				phosphor: 'CheckCircleIcon',
																				remixicon: 'RiCheckboxCircleLine',
																				class: 'size-5 fill-primary text-primary-foreground'
																			});
																		},
																		$$slots: { default: true }
																	});
																});

																var node_10 = $.sibling(node_9, 2);

																$.component(node_10, () => Item.Content, ($$anchor, Item_Content) => {
																	Item_Content($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_11 = $.comment();
																			var node_11 = $.first_child(fragment_11);

																			$.component(node_11, () => Item.Title, ($$anchor, Item_Title) => {
																				Item_Title($$anchor, {
																					class: 'inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_12 = root_3();
																						var strong = $.first_child(fragment_12);
																						var text_2 = $.only_child(strong, true);
																						var text_3 = $.sibling(strong);
																						var node_12 = $.sibling(text_3);

																						{
																							var consequent = ($$anchor) => {
																								var fragment_13 = root_2();
																								var strong_1 = $.first_child(fragment_13);
																								var text_4 = $.only_child(strong_1, true);
																								var text_5 = $.sibling(strong_1);

																								$.template_effect(() => {
																									$.set_text(text_4, $.get(feature).highlight);
																									$.set_text(text_5, ` ${$.get(feature).endText ?? ''}`);
																								});

																								$.append($$anchor, fragment_13);
																							};

																							$.if(node_12, ($$render) => {
																								if ($.get(feature).highlight) $$render(consequent);
																							});
																						}

																						var node_13 = $.sibling(node_12, 2);

																						{
																							var consequent_1 = ($$anchor) => {
																								Badge($$anchor, {
																									variant: 'secondary',
																									class: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_6 = $.text('Requires Observability Plus');

																										$.append($$anchor, text_6);
																									},
																									$$slots: { default: true }
																								});
																							};

																							$.if(node_13, ($$render) => {
																								if ($.get(feature).hasBadge) $$render(consequent_1);
																							});
																						}

																						$.template_effect(() => {
																							$.set_text(text_2, $.get(feature).title);
																							$.set_text(text_3, ` ${$.get(feature).description ?? ''} `);
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

																$.append($$anchor, fragment_9);
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

									var node_14 = $.sibling(node_6, 2);

									$.component(node_14, () => Alert.Root, ($$anchor, Alert_Root) => {
										Alert_Root($$anchor, {
											class: 'hidden sm:grid',
											children: ($$anchor, $$slotProps) => {
												var fragment_15 = root_1();
												var node_15 = $.first_child(fragment_15);

												IconPlaceholder(node_15, {
													lucide: 'CircleDollarSignIcon',
													hugeicons: 'DollarCircleIcon',
													tabler: 'IconCoin',
													phosphor: 'CurrencyCircleDollarIcon',
													remixicon: 'RiMoneyDollarCircleLine'
												});

												var node_16 = $.sibling(node_15, 2);

												$.component(node_16, () => Alert.Description, ($$anchor, Alert_Description) => {
													Alert_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('Pro teams get $100 in Vercel Agent trial credit for 2 weeks.');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_15);
											},
											$$slots: { default: true }
										});
									});

									$.reset(div);

									var node_17 = $.sibling(div, 2);

									$.component(node_17, () => Dialog.Footer, ($$anchor, Dialog_Footer) => {
										Dialog_Footer($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_16 = root_1();
												var node_18 = $.first_child(fragment_16);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text('Cancel');

																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														}));
													};

													$.component(node_18, () => Dialog.Close, ($$anchor, Dialog_Close) => {
														Dialog_Close($$anchor, { child, $$slots: { child: true } });
													});
												}

												var node_19 = $.sibling(node_18, 2);

												Button(node_19, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_9 = $.text('Enable with $100 credits');

														$.append($$anchor, text_9);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_16);
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
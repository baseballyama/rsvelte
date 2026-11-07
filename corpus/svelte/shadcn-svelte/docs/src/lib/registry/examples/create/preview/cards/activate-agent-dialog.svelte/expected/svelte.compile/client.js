import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Alert from "$lib/registry/ui/alert/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<strong>Ship faster & safer</strong> with <strong>Vercel Agent</strong>`, 1);
var root_1 = $.from_html(`Your use is subject to Vercel's <a href="https://vercel.com/legal" class="underline">Public Beta Agreement</a> and <a href="https://vercel.com/legal/ai-terms" class="underline">AI Product Terms</a>.`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<strong>Code reviews</strong> with full codebase context to catch <strong>hard-to-find</strong> bugs.`, 1);
var root_4 = $.from_html(`<strong>Code suggestions</strong> validated in sandboxes before you merge.`, 1);
var root_5 = $.from_html(`<strong>Root-cause analysis</strong> for production issues with deployment context. <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);

export default function Activate_agent_dialog($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_6();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();

										$.next(2);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_4 = root_1();

										$.next(4);
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

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root_2();
							var node_5 = $.first_child(fragment_5);

							$.component(node_5, () => Item.Group, ($$anchor, Item_Group) => {
								Item_Group($$anchor, {
									class: 'gap-0',
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root_6();
										var node_6 = $.first_child(fragment_6);

										$.component(node_6, () => Item.Root, ($$anchor, Item_Root) => {
											Item_Root($$anchor, {
												size: 'xs',
												class: 'px-0',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = root_2();
													var node_7 = $.first_child(fragment_7);

													$.component(node_7, () => Item.Media, ($$anchor, Item_Media) => {
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

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => Item.Content, ($$anchor, Item_Content) => {
														Item_Content($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_9 = $.comment();
																var node_9 = $.first_child(fragment_9);

																$.component(node_9, () => Item.Title, ($$anchor, Item_Title) => {
																	Item_Title($$anchor, {
																		class: 'inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = root_3();

																			$.next(3);
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

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_6, 2);

										$.component(node_10, () => Item.Root, ($$anchor, Item_Root_1) => {
											Item_Root_1($$anchor, {
												size: 'xs',
												class: 'px-0',
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = root_2();
													var node_11 = $.first_child(fragment_11);

													$.component(node_11, () => Item.Media, ($$anchor, Item_Media_1) => {
														Item_Media_1($$anchor, {
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

													var node_12 = $.sibling(node_11, 2);

													$.component(node_12, () => Item.Content, ($$anchor, Item_Content_1) => {
														Item_Content_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_13 = $.comment();
																var node_13 = $.first_child(fragment_13);

																$.component(node_13, () => Item.Title, ($$anchor, Item_Title_1) => {
																	Item_Title_1($$anchor, {
																		class: 'inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_14 = root_4();

																			$.next();
																			$.append($$anchor, fragment_14);
																		},
																		$$slots: { default: true }
																	});
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

										var node_14 = $.sibling(node_10, 2);

										$.component(node_14, () => Item.Root, ($$anchor, Item_Root_2) => {
											Item_Root_2($$anchor, {
												size: 'xs',
												class: 'px-0',
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = root_2();
													var node_15 = $.first_child(fragment_15);

													$.component(node_15, () => Item.Media, ($$anchor, Item_Media_2) => {
														Item_Media_2($$anchor, {
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

													var node_16 = $.sibling(node_15, 2);

													$.component(node_16, () => Item.Content, ($$anchor, Item_Content_2) => {
														Item_Content_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_17 = $.comment();
																var node_17 = $.first_child(fragment_17);

																$.component(node_17, () => Item.Title, ($$anchor, Item_Title_2) => {
																	Item_Title_2($$anchor, {
																		class: 'inline leading-relaxed font-normal text-muted-foreground *:[strong]:font-medium *:[strong]:text-foreground',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_18 = root_5();
																			var node_18 = $.sibling($.first_child(fragment_18), 2);

																			Badge(node_18, {
																				variant: 'secondary',
																				class: 'ml-1 bg-chart-1 text-chart-5',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text = $.text('Requires Observability Plus');

																					$.append($$anchor, text);
																				},
																				$$slots: { default: true }
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

													$.append($$anchor, fragment_15);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							var node_19 = $.sibling(node_5, 2);

							$.component(node_19, () => Alert.Root, ($$anchor, Alert_Root) => {
								Alert_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_19 = $.comment();
										var node_20 = $.first_child(fragment_19);

										$.component(node_20, () => Alert.Description, ($$anchor, Alert_Description) => {
											Alert_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('Pro teams get $100 in Vercel Agent trial credit for 2 weeks after activation.');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_19);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				var node_21 = $.sibling(node_4, 2);

				$.component(node_21, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'justify-end gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_20 = root_2();
							var node_22 = $.first_child(fragment_20);

							Button(node_22, {
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Cancel');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_23 = $.sibling(node_22, 2);

							Button(node_23, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Enable with $100 credits');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_20);
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
}
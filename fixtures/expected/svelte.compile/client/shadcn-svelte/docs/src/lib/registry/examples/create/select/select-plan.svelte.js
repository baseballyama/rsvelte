import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Select_plan($$anchor) {
	const plans = [
		{
			name: "Starter",
			description: "Perfect for individuals getting started."
		},

		{
			name: "Professional",
			description: "Ideal for growing teams and businesses."
		},

		{
			name: "Enterprise",
			description: "Advanced features for large organizations."
		}
	];

	let plan = $.state($.proxy(plans[0].name));
	const selectedPlan = $.derived(() => plans.find((p) => p.name === $.get(plan)));

	Example($$anchor, {
		title: 'Subscription Plan',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					get value() {
						return $.get(plan);
					},

					set value($$value) {
						$.set(plan, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
								class: 'h-auto! w-72',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Item.Root, ($$anchor, Item_Root) => {
										Item_Root($$anchor, {
											size: 'xs',
											class: 'w-full p-0',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => Item.Content, ($$anchor, Item_Content) => {
													Item_Content($$anchor, {
														class: 'gap-0',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_4 = $.first_child(fragment_5);

															$.component(node_4, () => Item.Title, ($$anchor, Item_Title) => {
																Item_Title($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text();

																		$.template_effect(() => $.set_text(text, $.get(selectedPlan)?.name));
																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var node_5 = $.sibling(node_4, 2);

															$.component(node_5, () => Item.Description, ($$anchor, Item_Description) => {
																Item_Description($$anchor, {
																	class: 'text-xs',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text();

																		$.template_effect(() => $.set_text(text_1, $.get(selectedPlan)?.description ?? ""));
																		$.append($$anchor, text_1);
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

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_1, 2);

						$.component(node_6, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = $.comment();
									var node_7 = $.first_child(fragment_8);

									$.component(node_7, () => Select.Group, ($$anchor, Select_Group) => {
										Select_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = $.comment();
												var node_8 = $.first_child(fragment_9);

												$.each(node_8, 17, () => plans, (p) => p.name, ($$anchor, p) => {
													var fragment_10 = $.comment();
													var node_9 = $.first_child(fragment_10);

													$.component(node_9, () => Select.Item, ($$anchor, Select_Item) => {
														Select_Item($$anchor, {
															get value() {
																return $.get(p).name;
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_11 = $.comment();
																var node_10 = $.first_child(fragment_11);

																$.component(node_10, () => Item.Root, ($$anchor, Item_Root_1) => {
																	Item_Root_1($$anchor, {
																		size: 'xs',
																		class: 'w-full p-0',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_12 = $.comment();
																			var node_11 = $.first_child(fragment_12);

																			$.component(node_11, () => Item.Content, ($$anchor, Item_Content_1) => {
																				Item_Content_1($$anchor, {
																					class: 'gap-0',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_13 = root();
																						var node_12 = $.first_child(fragment_13);

																						$.component(node_12, () => Item.Title, ($$anchor, Item_Title_1) => {
																							Item_Title_1($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_2 = $.text();

																									$.template_effect(() => $.set_text(text_2, $.get(p).name));
																									$.append($$anchor, text_2);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_13 = $.sibling(node_12, 2);

																						$.component(node_13, () => Item.Description, ($$anchor, Item_Description_1) => {
																							Item_Description_1($$anchor, {
																								class: 'text-xs',
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_3 = $.text();

																									$.template_effect(() => $.set_text(text_3, $.get(p).description));
																									$.append($$anchor, text_3);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_13);
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

													$.append($$anchor, fragment_10);
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
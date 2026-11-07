import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Select_plan($$renderer) {
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

	let plan = plans[0].name;
	const selectedPlan = $.derived(() => plans.find((p) => p.name === plan));
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Subscription Plan',
			children: ($$renderer) => {
				if (Select.Root) {
					$$renderer.push('<!--[-->');

					Select.Root($$renderer, {
						type: 'single',
						get value() {
							return plan;
						},

						set value($$value) {
							plan = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Select.Trigger) {
								$$renderer.push('<!--[-->');

								Select.Trigger($$renderer, {
									class: 'h-auto! w-72',
									children: ($$renderer) => {
										if (Item.Root) {
											$$renderer.push('<!--[-->');

											Item.Root($$renderer, {
												size: 'xs',
												class: 'w-full p-0',
												children: ($$renderer) => {
													if (Item.Content) {
														$$renderer.push('<!--[-->');

														Item.Content($$renderer, {
															class: 'gap-0',
															children: ($$renderer) => {
																if (Item.Title) {
																	$$renderer.push('<!--[-->');

																	Item.Title($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(selectedPlan()?.name)}`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Item.Description) {
																	$$renderer.push('<!--[-->');

																	Item.Description($$renderer, {
																		class: 'text-xs',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(selectedPlan()?.description ?? "")}`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Select.Content) {
								$$renderer.push('<!--[-->');

								Select.Content($$renderer, {
									children: ($$renderer) => {
										if (Select.Group) {
											$$renderer.push('<!--[-->');

											Select.Group($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);

													const each_array = $.ensure_array_like(plans);

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let p = each_array[$$index];

														if (Select.Item) {
															$$renderer.push('<!--[-->');

															Select.Item($$renderer, {
																value: p.name,
																children: ($$renderer) => {
																	if (Item.Root) {
																		$$renderer.push('<!--[-->');

																		Item.Root($$renderer, {
																			size: 'xs',
																			class: 'w-full p-0',
																			children: ($$renderer) => {
																				if (Item.Content) {
																					$$renderer.push('<!--[-->');

																					Item.Content($$renderer, {
																						class: 'gap-0',
																						children: ($$renderer) => {
																							if (Item.Title) {
																								$$renderer.push('<!--[-->');

																								Item.Title($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->${$.escape(p.name)}`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (Item.Description) {
																								$$renderer.push('<!--[-->');

																								Item.Description($$renderer, {
																									class: 'text-xs',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->${$.escape(p.description)}`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													$$renderer.push(`<!--]-->`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
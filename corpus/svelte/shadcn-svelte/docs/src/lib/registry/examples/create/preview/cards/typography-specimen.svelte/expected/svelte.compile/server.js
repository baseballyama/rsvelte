import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { useDesignSystem } from "$lib/features/design-system/index.js";
import { FONTS } from "$lib/fonts.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Typography_specimen($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const designSystem = useDesignSystem();
		const currentBody = $.derived(() => FONTS.find((f) => f.value === designSystem.font));

		const currentHeading = $.derived(() => designSystem.fontHeading === "inherit"
			? undefined
			: FONTS.find((f) => f.value === designSystem.fontHeading));

		const headingLabel = $.derived(() => currentHeading()?.name && currentHeading().name !== currentBody()?.name ? currentHeading().name : "Inherit");
		const bodyLabel = $.derived(() => currentBody()?.name ?? "Default");

		const categoryItems = [
			{ label: "General", value: "general" },
			{ label: "Bug Report", value: "bug" },
			{ label: "Feature Request", value: "feature" },
			{ label: "Improvement", value: "improvement" }
		];

		let categoryValue = "general";
		const categoryLabel = $.derived(() => categoryItems.find((item) => item.value === categoryValue)?.label ?? "General");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					children: ($$renderer) => {
						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								class: 'flex flex-col gap-2',
								children: ($$renderer) => {
									$$renderer.push(`<div class="text-xs font-medium tracking-wide text-muted-foreground uppercase">${$.escape(headingLabel())} - ${$.escape(bodyLabel())}</div> <p class="cn-font-heading text-2xl font-medium">Designing with rhythm and hierarchy.</p> <p class="text-sm leading-relaxed text-muted-foreground">A strong body style keeps long-form content readable and balances the visual weight of
			headings.</p> <p class="text-sm leading-relaxed text-muted-foreground">Thoughtful spacing and cadence help paragraphs scan quickly without feeling dense.</p>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								children: ($$renderer) => {
									if (Dialog.Root) {
										$$renderer.push('<!--[-->');

										Dialog.Root($$renderer, {
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															{ variant: 'outline', class: 'w-full' },
															props,
															{
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Share Feedback`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (Dialog.Trigger) {
														$$renderer.push('<!--[-->');
														Dialog.Trigger($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												if (Dialog.Content) {
													$$renderer.push('<!--[-->');

													Dialog.Content($$renderer, {
														children: ($$renderer) => {
															if (Dialog.Header) {
																$$renderer.push('<!--[-->');

																Dialog.Header($$renderer, {
																	children: ($$renderer) => {
																		if (Dialog.Title) {
																			$$renderer.push('<!--[-->');

																			Dialog.Title($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Share Feedback`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Dialog.Description) {
																			$$renderer.push('<!--[-->');

																			Dialog.Description($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Let us know how we can improve your experience.`);
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

															if (Field.Group) {
																$$renderer.push('<!--[-->');

																Field.Group($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<div class="grid grid-cols-2 gap-3">`);

																		if (Field.Field) {
																			$$renderer.push('<!--[-->');

																			Field.Field($$renderer, {
																				children: ($$renderer) => {
																					if (Field.Label) {
																						$$renderer.push('<!--[-->');

																						Field.Label($$renderer, {
																							for: 'feedback-name',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Name`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);
																					Input($$renderer, { id: 'feedback-name', placeholder: 'Your name' });
																					$$renderer.push(`<!---->`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Field.Field) {
																			$$renderer.push('<!--[-->');

																			Field.Field($$renderer, {
																				children: ($$renderer) => {
																					if (Field.Label) {
																						$$renderer.push('<!--[-->');

																						Field.Label($$renderer, {
																							for: 'feedback-email',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Email`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					Input($$renderer, {
																						id: 'feedback-email',
																						type: 'email',
																						placeholder: 'you@example.com'
																					});

																					$$renderer.push(`<!---->`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(`</div> `);

																		if (Field.Field) {
																			$$renderer.push('<!--[-->');

																			Field.Field($$renderer, {
																				children: ($$renderer) => {
																					if (Field.Label) {
																						$$renderer.push('<!--[-->');

																						Field.Label($$renderer, {
																							for: 'feedback-category',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Category`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					if (Select.Root) {
																						$$renderer.push('<!--[-->');

																						Select.Root($$renderer, {
																							type: 'single',
																							get value() {
																								return categoryValue;
																							},

																							set value($$value) {
																								categoryValue = $$value;
																								$$settled = false;
																							},

																							children: ($$renderer) => {
																								if (Select.Trigger) {
																									$$renderer.push('<!--[-->');

																									Select.Trigger($$renderer, {
																										id: 'feedback-category',
																										class: 'w-full',
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->${$.escape(categoryLabel())}`);
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

																														const each_array = $.ensure_array_like(categoryItems);

																														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																															let item = each_array[$$index];

																															if (Select.Item) {
																																$$renderer.push('<!--[-->');

																																Select.Item($$renderer, {
																																	value: item.value,
																																	children: ($$renderer) => {
																																		$$renderer.push(`<!---->${$.escape(item.label)}`);
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

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Field.Field) {
																			$$renderer.push('<!--[-->');

																			Field.Field($$renderer, {
																				children: ($$renderer) => {
																					if (Field.Label) {
																						$$renderer.push('<!--[-->');

																						Field.Label($$renderer, {
																							for: 'feedback-message',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Message`);
																							},
																							$$slots: { default: true }
																						});

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					Textarea($$renderer, {
																						id: 'feedback-message',
																						placeholder: 'Tell us what\'s on your mind...',
																						class: 'min-h-24 resize-none'
																					});

																					$$renderer.push(`<!---->`);
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

															if (Dialog.Footer) {
																$$renderer.push('<!--[-->');

																Dialog.Footer($$renderer, {
																	children: ($$renderer) => {
																		{
																			function child($$renderer, { props }) {
																				Button($$renderer, $.spread_props([
																					{ variant: 'outline' },
																					props,
																					{
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Cancel`);
																						},
																						$$slots: { default: true }
																					}
																				]));
																			}

																			if (Dialog.Close) {
																				$$renderer.push('<!--[-->');
																				Dialog.Close($$renderer, { child, $$slots: { child: true } });
																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}

																		$$renderer.push(` `);

																		Button($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Submit`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!---->`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
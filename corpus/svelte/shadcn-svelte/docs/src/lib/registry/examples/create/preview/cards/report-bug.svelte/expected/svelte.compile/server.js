import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";

export default function Report_bug($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const severities = [
			{ value: "critical", label: "Critical" },
			{ value: "high", label: "High" },
			{ value: "medium", label: "Medium" },
			{ value: "low", label: "Low" }
		];

		const components = [
			{ value: "dashboard", label: "Dashboard" },
			{ value: "auth", label: "Auth" },
			{ value: "api", label: "API" },
			{ value: "billing", label: "Billing" }
		];

		let severity = severities[2].value;
		let component = components[0].value;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Report Bug`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Card.Description) {
										$$renderer.push('<!--[-->');

										Card.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Help us fix issues faster.`);
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

						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								children: ($$renderer) => {
									if (Field.Group) {
										$$renderer.push('<!--[-->');

										Field.Group($$renderer, {
											children: ($$renderer) => {
												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'bug-title',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Title`);
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
																id: 'bug-title',
																placeholder: 'Brief description of the issue'
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

												$$renderer.push(` <div class="grid grid-cols-2 gap-3">`);

												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'bug-severity',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Severity`);
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
																		return severity;
																	},

																	set value($$value) {
																		severity = $$value;
																		$$settled = false;
																	},

																	children: ($$renderer) => {
																		if (Select.Trigger) {
																			$$renderer.push('<!--[-->');

																			Select.Trigger($$renderer, {
																				id: 'bug-severity',
																				class: 'w-full',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(severities.find((s) => s.value === severity)?.label ?? "Select Severity")}`);
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
																					$$renderer.push(`<!--[-->`);

																					const each_array = $.ensure_array_like(severities);

																					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																						let severity = each_array[$$index];

																						if (Select.Item) {
																							$$renderer.push('<!--[-->');

																							Select.Item($$renderer, {
																								value: severity.value,
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->${$.escape(severity.label)}`);
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

												$$renderer.push(` `);

												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'bug-component',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Component`);
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
																		return component;
																	},

																	set value($$value) {
																		component = $$value;
																		$$settled = false;
																	},

																	children: ($$renderer) => {
																		if (Select.Trigger) {
																			$$renderer.push('<!--[-->');

																			Select.Trigger($$renderer, {
																				id: 'bug-component',
																				class: 'w-full',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(components.find((c) => c.value === component)?.label ?? "Select Component")}`);
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
																					$$renderer.push(`<!--[-->`);

																					const each_array_1 = $.ensure_array_like(components);

																					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																						let component = each_array_1[$$index_1];

																						if (Select.Item) {
																							$$renderer.push('<!--[-->');

																							Select.Item($$renderer, {
																								value: component.value,
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->${$.escape(component.label)}`);
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

												$$renderer.push(`</div> `);

												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'bug-steps',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Steps to reproduce`);
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
																id: 'bug-steps',
																placeholder: '1. Go to\n2. Click on\n3. Observe...',
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
									if (Field.Field) {
										$$renderer.push('<!--[-->');

										Field.Field($$renderer, {
											orientation: 'horizontal',
											class: 'justify-end',
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Attach File`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Submit Bug`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
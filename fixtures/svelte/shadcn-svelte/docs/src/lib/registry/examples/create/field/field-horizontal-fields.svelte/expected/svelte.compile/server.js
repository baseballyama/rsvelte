import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as Input from "$lib/registry/ui/input/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import * as Textarea from "$lib/registry/ui/textarea/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Field_horizontal_fields($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const basicItems = [
			{ label: "Select a fruit", value: undefined },
			{ label: "Apple", value: "apple" },
			{ label: "Banana", value: "banana" },
			{ label: "Orange", value: "orange" }
		];

		let fruitValue = undefined;
		const fruitLabel = $.derived(() => basicItems.find((item) => item.value === fruitValue)?.label ?? "Select a fruit");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Example($$renderer, {
				title: 'Horizontal Fields',
				children: ($$renderer) => {
					if (Field.Group) {
						$$renderer.push('<!--[-->');

						Field.Group($$renderer, {
							class: '**:data-[slot=field-content]:min-w-48',
							children: ($$renderer) => {
								if (Field.Field) {
									$$renderer.push('<!--[-->');

									Field.Field($$renderer, {
										orientation: 'horizontal',
										children: ($$renderer) => {
											if (Field.Content) {
												$$renderer.push('<!--[-->');

												Field.Content($$renderer, {
													children: ($$renderer) => {
														if (Field.Label) {
															$$renderer.push('<!--[-->');

															Field.Label($$renderer, {
																for: 'horizontal-input',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Username`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Field.Description) {
															$$renderer.push('<!--[-->');

															Field.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Enter your preferred username.`);
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

											if (Input.Root) {
												$$renderer.push('<!--[-->');
												Input.Root($$renderer, { id: 'horizontal-input', placeholder: 'johndoe' });
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
										orientation: 'horizontal',
										children: ($$renderer) => {
											if (Field.Content) {
												$$renderer.push('<!--[-->');

												Field.Content($$renderer, {
													children: ($$renderer) => {
														if (Field.Label) {
															$$renderer.push('<!--[-->');

															Field.Label($$renderer, {
																for: 'horizontal-textarea',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Bio`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Field.Description) {
															$$renderer.push('<!--[-->');

															Field.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Write a short description about yourself.`);
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

											if (Textarea.Root) {
												$$renderer.push('<!--[-->');

												Textarea.Root($$renderer, {
													id: 'horizontal-textarea',
													placeholder: 'Tell us about yourself...'
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
										orientation: 'horizontal',
										children: ($$renderer) => {
											if (Field.Content) {
												$$renderer.push('<!--[-->');

												Field.Content($$renderer, {
													children: ($$renderer) => {
														if (Field.Label) {
															$$renderer.push('<!--[-->');

															Field.Label($$renderer, {
																for: 'horizontal-switch',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Email Notifications`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Field.Description) {
															$$renderer.push('<!--[-->');

															Field.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Receive email updates about your account.`);
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
											Switch($$renderer, { id: 'horizontal-switch' });
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
										orientation: 'horizontal',
										children: ($$renderer) => {
											if (Field.Content) {
												$$renderer.push('<!--[-->');

												Field.Content($$renderer, {
													children: ($$renderer) => {
														if (Field.Label) {
															$$renderer.push('<!--[-->');

															Field.Label($$renderer, {
																for: 'horizontal-select',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Favorite Fruit`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Field.Description) {
															$$renderer.push('<!--[-->');

															Field.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Choose your favorite fruit.`);
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

											if (Select.Root) {
												$$renderer.push('<!--[-->');

												Select.Root($$renderer, {
													type: 'single',
													get value() {
														return fruitValue;
													},

													set value($$value) {
														fruitValue = $$value;
														$$settled = false;
													},

													children: ($$renderer) => {
														if (Select.Trigger) {
															$$renderer.push('<!--[-->');

															Select.Trigger($$renderer, {
																id: 'horizontal-select',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(fruitLabel())}`);
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

																				const each_array = $.ensure_array_like(basicItems.filter((i) => i.value !== undefined));

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
										orientation: 'horizontal',
										children: ($$renderer) => {
											if (Field.Content) {
												$$renderer.push('<!--[-->');

												Field.Content($$renderer, {
													children: ($$renderer) => {
														if (Field.Label) {
															$$renderer.push('<!--[-->');

															Field.Label($$renderer, {
																for: 'horizontal-native-select',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Country`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Field.Description) {
															$$renderer.push('<!--[-->');

															Field.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Select your country.`);
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

											if (NativeSelect.Root) {
												$$renderer.push('<!--[-->');

												NativeSelect.Root($$renderer, {
													id: 'horizontal-native-select',
													children: ($$renderer) => {
														if (NativeSelect.Option) {
															$$renderer.push('<!--[-->');

															NativeSelect.Option($$renderer, {
																value: '',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Select a country`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (NativeSelect.Option) {
															$$renderer.push('<!--[-->');

															NativeSelect.Option($$renderer, {
																value: 'us',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->United States`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (NativeSelect.Option) {
															$$renderer.push('<!--[-->');

															NativeSelect.Option($$renderer, {
																value: 'uk',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->United Kingdom`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (NativeSelect.Option) {
															$$renderer.push('<!--[-->');

															NativeSelect.Option($$renderer, {
																value: 'ca',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Canada`);
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
										orientation: 'horizontal',
										children: ($$renderer) => {
											if (Field.Content) {
												$$renderer.push('<!--[-->');

												Field.Content($$renderer, {
													children: ($$renderer) => {
														if (Field.Label) {
															$$renderer.push('<!--[-->');

															Field.Label($$renderer, {
																for: 'horizontal-slider',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Volume`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Field.Description) {
															$$renderer.push('<!--[-->');

															Field.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Adjust the volume level.`);
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
											Slider($$renderer, { type: 'single', id: 'horizontal-slider', value: 50, max: 100 });
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
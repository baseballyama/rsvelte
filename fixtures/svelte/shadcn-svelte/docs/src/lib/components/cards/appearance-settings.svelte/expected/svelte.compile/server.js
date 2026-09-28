import * as $ from 'svelte/internal/server';
import MinusIcon from "@lucide/svelte/icons/minus";
import PlusIcon from "@lucide/svelte/icons/plus";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

export default function Appearance_settings($$renderer) {
	let gpuCount = 8;

	function handleGpuCountChange(event) {
		const target = event.target;
		let inputValue = target.value;
		const previousValue = gpuCount.toString();

		// Remove any non-numeric characters
		let cleanedValue = inputValue.replace(/[^0-9]/g, "");

		// Prevent deletion of a single digit
		if (cleanedValue === "" && previousValue.length === 1) {
			target.value = previousValue;

			return;
		}

		// Handle input cases
		if (cleanedValue !== "") {
			const numValue = parseInt(cleanedValue, 10);

			// If we already have 2 digits and user is trying to type more, keep the original value
			if (previousValue.length === 2 && cleanedValue !== previousValue && cleanedValue.length === 3) {
				target.value = previousValue;

				return;
			}

			// Ensure value is within valid range (1-99)
			if (numValue < 1) {
				cleanedValue = "1";
			} else if (numValue > 99) {
				cleanedValue = "99";
			}

			// Update both the input value and the state
			target.value = cleanedValue;

			gpuCount = parseInt(cleanedValue, 10);
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Field.Set) {
			$$renderer.push('<!--[-->');

			Field.Set($$renderer, {
				children: ($$renderer) => {
					if (Field.Group) {
						$$renderer.push('<!--[-->');

						Field.Group($$renderer, {
							children: ($$renderer) => {
								if (Field.Set) {
									$$renderer.push('<!--[-->');

									Field.Set($$renderer, {
										children: ($$renderer) => {
											if (Field.Legend) {
												$$renderer.push('<!--[-->');

												Field.Legend($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Compute Environment`);
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
														$$renderer.push(`<!---->Select the compute environment for your cluster.`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (RadioGroup.Root) {
												$$renderer.push('<!--[-->');

												RadioGroup.Root($$renderer, {
													value: 'kubernetes',
													children: ($$renderer) => {
														if (Field.Label) {
															$$renderer.push('<!--[-->');

															Field.Label($$renderer, {
																for: 'kubernetes-r2h',
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
																							if (Field.Title) {
																								$$renderer.push('<!--[-->');

																								Field.Title($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Kubernetes`);
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
																										$$renderer.push(`<!---->Run GPU workloads on a K8s configured cluster. This is the default.`);
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

																				if (RadioGroup.Item) {
																					$$renderer.push('<!--[-->');

																					RadioGroup.Item($$renderer, {
																						value: 'kubernetes',
																						id: 'kubernetes-r2h',
																						'aria-label': 'Kubernetes'
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

														if (Field.Label) {
															$$renderer.push('<!--[-->');

															Field.Label($$renderer, {
																for: 'vm-z4k',
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
																							if (Field.Title) {
																								$$renderer.push('<!--[-->');

																								Field.Title($$renderer, {
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Virtual Machine`);
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
																										$$renderer.push(`<!---->Access a VM configured cluster to run workloads. (Coming soon)`);
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

																				if (RadioGroup.Item) {
																					$$renderer.push('<!--[-->');
																					RadioGroup.Item($$renderer, { value: 'vm', id: 'vm-z4k', 'aria-label': 'Virtual Machine' });
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

								$$renderer.push(` `);

								if (Field.Separator) {
									$$renderer.push('<!--[-->');
									Field.Separator($$renderer, {});
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
																for: 'number-of-gpus-f6l',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Number of GPUs`);
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
																	$$renderer.push(`<!---->You can add more later.`);
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

											if (ButtonGroup.Root) {
												$$renderer.push('<!--[-->');

												ButtonGroup.Root($$renderer, {
													children: ($$renderer) => {
														Input($$renderer, {
															id: 'number-of-gpus-f6l',
															size: 3,
															class: 'font-mono style-vega:h-8 style-nova:h-7 style-lyra:h-7 style-maia:h-8 style-mira:h-6 style-luma:h-8 style-sera:h-9',
															maxlength: 3,
															oninput: handleGpuCountChange,
															type: 'text',
															inputmode: 'numeric',
															pattern: '[0-9]*',
															get value() {
																return gpuCount;
															},

															set value($$value) {
																gpuCount = $$value;
																$$settled = false;
															}
														});

														$$renderer.push(`<!----> `);

														Button($$renderer, {
															onclick: () => gpuCount--,
															variant: 'outline',
															size: 'icon-sm',
															type: 'button',
															'aria-label': 'Decrement',
															disabled: gpuCount <= 1,
															children: ($$renderer) => {
																MinusIcon($$renderer, {});
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Button($$renderer, {
															onclick: () => gpuCount++,
															variant: 'outline',
															size: 'icon-sm',
															type: 'button',
															'aria-label': 'Increment',
															disabled: gpuCount >= 99,
															children: ($$renderer) => {
																PlusIcon($$renderer, {});
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

								$$renderer.push(` `);

								if (Field.Separator) {
									$$renderer.push('<!--[-->');
									Field.Separator($$renderer, {});
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
																for: 'tinting',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Wallpaper Tinting`);
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
																	$$renderer.push(`<!---->Allow the wallpaper to be tinted.`);
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
											Switch($$renderer, { id: 'tinting', checked: true });
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
}
import * as $ from 'svelte/internal/server';
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Field_examples($$renderer) {
	let gpuCount = 8;
	let value = [200, 800];

	function handleGpuAdjustment(adjustment) {
		gpuCount = Math.max(1, Math.min(99, gpuCount + adjustment));
	}

	function handleGpuInputChange(e) {
		const target = e.target;
		const val = parseInt(target.value, 10);

		if (!isNaN(val) && val >= 1 && val <= 99) {
			gpuCount = val;
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Fields',
			children: ($$renderer) => {
				if (Field.Set) {
					$$renderer.push('<!--[-->');

					Field.Set($$renderer, {
						class: 'w-full max-w-md',
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
																	value: gpuCount,
																	oninput: handleGpuInputChange,
																	size: 3,
																	maxlength: 3
																});

																$$renderer.push(`<!----> `);

																Button($$renderer, {
																	variant: 'outline',
																	size: 'icon',
																	type: 'button',
																	'aria-label': 'Decrement',
																	onclick: () => handleGpuAdjustment(-1),
																	disabled: gpuCount <= 1,
																	children: ($$renderer) => {
																		IconPlaceholder($$renderer, {
																			lucide: 'MinusIcon',
																			tabler: 'IconMinus',
																			hugeicons: 'MinusSignIcon',
																			phosphor: 'MinusIcon',
																			remixicon: 'RiSubtractLine'
																		});
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> `);

																Button($$renderer, {
																	variant: 'outline',
																	size: 'icon',
																	type: 'button',
																	'aria-label': 'Increment',
																	onclick: () => handleGpuAdjustment(1),
																	disabled: gpuCount >= 99,
																	children: ($$renderer) => {
																		IconPlaceholder($$renderer, {
																			lucide: 'PlusIcon',
																			tabler: 'IconPlus',
																			hugeicons: 'PlusSignIcon',
																			phosphor: 'PlusIcon',
																			remixicon: 'RiAddLine'
																		});
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

										if (Field.Label) {
											$$renderer.push('<!--[-->');

											Field.Label($$renderer, {
												for: 'checkbox-demo',
												children: ($$renderer) => {
													if (Field.Field) {
														$$renderer.push('<!--[-->');

														Field.Field($$renderer, {
															orientation: 'horizontal',
															children: ($$renderer) => {
																Checkbox($$renderer, { id: 'checkbox-demo', checked: true });
																$$renderer.push(`<!----> `);

																if (Field.Label) {
																	$$renderer.push('<!--[-->');

																	Field.Label($$renderer, {
																		for: 'checkbox-demo',
																		class: 'line-clamp-1',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->I agree to the terms and conditions`);
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
													if (Field.Title) {
														$$renderer.push('<!--[-->');

														Field.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Price Range`);
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
																$$renderer.push(`<!---->Set your budget range ($ <span class="font-medium tabular-nums">${$.escape(value[0])}</span> - <span class="font-medium tabular-nums">${$.escape(value[1])}</span>).`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													Slider($$renderer, {
														type: 'multiple',
														max: 1000,
														min: 0,
														step: 10,
														class: 'mt-2 w-full',
														'aria-label': 'Price Range',
														get value() {
															return value;
														},

														set value($$value) {
															value = $$value;
															$$settled = false;
														}
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

										$$renderer.push(` `);

										if (Field.Field) {
											$$renderer.push('<!--[-->');

											Field.Field($$renderer, {
												orientation: 'horizontal',
												children: ($$renderer) => {
													Button($$renderer, {
														type: 'submit',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Submit`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Button($$renderer, {
														variant: 'outline',
														type: 'button',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
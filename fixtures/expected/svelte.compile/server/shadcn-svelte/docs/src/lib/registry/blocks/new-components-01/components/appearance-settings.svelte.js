import * as $ from 'svelte/internal/server';
import CheckIcon from "@lucide/svelte/icons/check";
import MinusIcon from "@tabler/icons-svelte/icons/minus";
import PlusIcon from "@tabler/icons-svelte/icons/plus";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

export default function Appearance_settings($$renderer) {
	const accents = [
		{ name: "Blue", value: "blue" },
		{ name: "Amber", value: "amber" },
		{ name: "Green", value: "green" },
		{ name: "Rose", value: "rose" }
	];

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
																				RadioGroup.Item($$renderer, { value: 'kubernetes', id: 'kubernetes-r2h' });
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
																				RadioGroup.Item($$renderer, { value: 'vm', id: 'vm-z4k' });
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
													if (Field.Title) {
														$$renderer.push('<!--[-->');

														Field.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Accent`);
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
																$$renderer.push(`<!---->Select the accent color to use.`);
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

										if (Field.Set) {
											$$renderer.push('<!--[-->');

											Field.Set($$renderer, {
												'aria-label': 'Accent',
												children: ($$renderer) => {
													if (RadioGroup.Root) {
														$$renderer.push('<!--[-->');

														RadioGroup.Root($$renderer, {
															class: 'flex flex-wrap gap-2',
															value: 'blue',
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(accents);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let accent = each_array[$$index];

																	Label($$renderer, {
																		for: accent.value,
																		'data-theme': accent.value,
																		class: 'flex size-6 items-center justify-center rounded-full data-[theme=amber]:bg-amber-600 data-[theme=blue]:bg-blue-700 data-[theme=green]:bg-green-600 data-[theme=rose]:bg-rose-600',
																		children: ($$renderer) => {
																			if (RadioGroup.Item) {
																				$$renderer.push('<!--[-->');

																				RadioGroup.Item($$renderer, {
																					id: accent.value,
																					value: accent.value,
																					'aria-label': accent.name,
																					class: 'peer sr-only'
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			CheckIcon($$renderer, {
																				class: 'hidden size-4 stroke-white peer-data-[state=checked]:block'
																			});

																			$$renderer.push(`<!---->`);
																		},
																		$$slots: { default: true }
																	});
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
														placeholder: '8',
														size: 3,
														class: 'w-14! font-mono',
														maxlength: 3
													});

													$$renderer.push(`<!----> `);

													Button($$renderer, {
														variant: 'outline',
														size: 'icon-sm',
														type: 'button',
														children: ($$renderer) => {
															MinusIcon($$renderer, {});
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Button($$renderer, {
														variant: 'outline',
														size: 'icon-sm',
														type: 'button',
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
import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";

export default function Field_choice_card($$renderer) {
	let computeEnvironment = "kubernetes";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="w-full max-w-md">`);

		if (Field.Group) {
			$$renderer.push('<!--[-->');

			Field.Group($$renderer, {
				children: ($$renderer) => {
					if (Field.Set) {
						$$renderer.push('<!--[-->');

						Field.Set($$renderer, {
							children: ($$renderer) => {
								if (Field.Label) {
									$$renderer.push('<!--[-->');

									Field.Label($$renderer, {
										for: 'compute-environment-p8w',
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
										get value() {
											return computeEnvironment;
										},

										set value($$value) {
											computeEnvironment = $$value;
											$$settled = false;
										},

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
																							$$renderer.push(`<!---->Run GPU workloads on a K8s configured cluster.`);
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
																							$$renderer.push(`<!---->Access a VM configured cluster to run GPU workloads.`);
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
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
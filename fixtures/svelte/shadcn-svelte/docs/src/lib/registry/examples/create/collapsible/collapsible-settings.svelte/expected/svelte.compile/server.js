import * as $ from 'svelte/internal/server';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Input from "$lib/registry/ui/input/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Collapsible_settings($$renderer) {
	let isOpen = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'Settings',
			class: 'items-center',
			children: ($$renderer) => {
				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						class: 'mx-auto w-full max-w-xs',
						size: 'sm',
						children: ($$renderer) => {
							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Radius`);
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
													$$renderer.push(`<!---->Set the corner radius of the element.`);
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
										if (Collapsible.Root) {
											$$renderer.push('<!--[-->');

											Collapsible.Root($$renderer, {
												class: 'flex items-start gap-2',
												get open() {
													return isOpen;
												},

												set open($$value) {
													isOpen = $$value;
													$$settled = false;
												},

												children: ($$renderer) => {
													if (Field.Group) {
														$$renderer.push('<!--[-->');

														Field.Group($$renderer, {
															class: 'grid w-full grid-cols-2 gap-2',
															children: ($$renderer) => {
																if (Field.Field) {
																	$$renderer.push('<!--[-->');

																	Field.Field($$renderer, {
																		children: ($$renderer) => {
																			if (Field.Label) {
																				$$renderer.push('<!--[-->');

																				Field.Label($$renderer, {
																					for: 'radius-x',
																					class: 'sr-only',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Radius X`);
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
																				Input.Root($$renderer, { id: 'radius', placeholder: '0' });
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
																					for: 'radius-y',
																					class: 'sr-only',
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Radius Y`);
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
																				Input.Root($$renderer, { id: 'radius', placeholder: '0' });
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

																if (Collapsible.Content) {
																	$$renderer.push('<!--[-->');

																	Collapsible.Content($$renderer, {
																		class: 'col-span-full grid grid-cols-subgrid gap-2',
																		children: ($$renderer) => {
																			if (Field.Field) {
																				$$renderer.push('<!--[-->');

																				Field.Field($$renderer, {
																					children: ($$renderer) => {
																						if (Field.Label) {
																							$$renderer.push('<!--[-->');

																							Field.Label($$renderer, {
																								for: 'radius-x',
																								class: 'sr-only',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Radius X`);
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
																							Input.Root($$renderer, { id: 'radius', placeholder: '0' });
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
																								for: 'radius-y',
																								class: 'sr-only',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Radius Y`);
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
																							Input.Root($$renderer, { id: 'radius', placeholder: '0' });
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

													{
														function child($$renderer, { props }) {
															if (Button.Root) {
																$$renderer.push('<!--[-->');

																Button.Root($$renderer, $.spread_props([
																	{ variant: 'outline', size: 'icon' },
																	props,
																	{
																		children: ($$renderer) => {
																			if (isOpen) {
																				$$renderer.push('<!--[0-->');

																				IconPlaceholder($$renderer, {
																					lucide: 'MinimizeIcon',
																					tabler: 'IconMinimize',
																					hugeicons: 'ArrowShrinkIcon',
																					phosphor: 'CornersInIcon',
																					remixicon: 'RiContractUpDownLine'
																				});
																			} else {
																				$$renderer.push('<!--[-1-->');

																				IconPlaceholder($$renderer, {
																					lucide: 'MaximizeIcon',
																					tabler: 'IconBorderCorners',
																					hugeicons: 'ArrowExpandIcon',
																					phosphor: 'CornersOutIcon',
																					remixicon: 'RiExpandUpDownLine'
																				});
																			}

																			$$renderer.push(`<!--]-->`);
																		},
																		$$slots: { default: true }
																	}
																]));

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														}

														if (Collapsible.Trigger) {
															$$renderer.push('<!--[-->');
															Collapsible.Trigger($$renderer, { class: 'rounded-md', child, $$slots: { child: true } });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
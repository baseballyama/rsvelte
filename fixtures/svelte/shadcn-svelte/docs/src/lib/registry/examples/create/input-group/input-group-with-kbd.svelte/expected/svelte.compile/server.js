import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Spinner } from "$lib/registry/ui/spinner/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_group_with_kbd($$renderer) {
	Example($$renderer, {
		title: 'With Kbd',
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
											for: 'input-kbd-22',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Input Group with Kbd`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { id: 'input-kbd-22' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														children: ($$renderer) => {
															if (Kbd.Root) {
																$$renderer.push('<!--[-->');

																Kbd.Root($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->⌘K`);
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

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { id: 'input-kbd-23' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														align: 'inline-end',
														children: ($$renderer) => {
															if (Kbd.Root) {
																$$renderer.push('<!--[-->');

																Kbd.Root($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->⌘K`);
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

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');

													InputGroup.Input($$renderer, {
														id: 'input-search-apps-24',
														placeholder: 'Search for Apps...'
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														align: 'inline-end',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Ask AI`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														align: 'inline-end',
														children: ($$renderer) => {
															if (Kbd.Root) {
																$$renderer.push('<!--[-->');

																Kbd.Root($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Tab`);
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

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { id: 'input-search-type-25', placeholder: 'Type to search...' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														align: 'inline-start',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'SparklesIcon',
																tabler: 'IconServerSpark',
																hugeicons: 'SparklesIcon',
																phosphor: 'SparkleIcon',
																remixicon: 'RiSparklingLine'
															});
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														align: 'inline-end',
														children: ($$renderer) => {
															if (Kbd.Group) {
																$$renderer.push('<!--[-->');

																Kbd.Group($$renderer, {
																	children: ($$renderer) => {
																		if (Kbd.Root) {
																			$$renderer.push('<!--[-->');

																			Kbd.Root($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Ctrl`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Kbd.Root) {
																			$$renderer.push('<!--[-->');

																			Kbd.Root($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->C`);
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

						$$renderer.push(` `);

						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'input-username-26',
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

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { id: 'input-username-26', value: 'shadcn' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														align: 'inline-end',
														children: ($$renderer) => {
															$$renderer.push(`<div class="flex size-4 items-center justify-center rounded-full bg-green-500 dark:bg-green-800">`);

															IconPlaceholder($$renderer, {
																lucide: 'CheckIcon',
																tabler: 'IconCheck',
																hugeicons: 'Tick02Icon',
																phosphor: 'CheckIcon',
																remixicon: 'RiCheckLine',
																class: 'size-3 text-white'
															});

															$$renderer.push(`<!----></div>`);
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

									if (Field.Description) {
										$$renderer.push('<!--[-->');

										Field.Description($$renderer, {
											class: 'text-green-700',
											children: ($$renderer) => {
												$$renderer.push(`<!---->This username is available.`);
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

						if (InputGroup.Root) {
							$$renderer.push('<!--[-->');

							InputGroup.Root($$renderer, {
								children: ($$renderer) => {
									if (InputGroup.Input) {
										$$renderer.push('<!--[-->');

										InputGroup.Input($$renderer, {
											id: 'input-search-docs-27',
											placeholder: 'Search documentation...'
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (InputGroup.Addon) {
										$$renderer.push('<!--[-->');

										InputGroup.Addon($$renderer, {
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'SearchIcon',
													tabler: 'IconSearch',
													hugeicons: 'SearchIcon',
													phosphor: 'MagnifyingGlassIcon',
													remixicon: 'RiSearchLine'
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (InputGroup.Addon) {
										$$renderer.push('<!--[-->');

										InputGroup.Addon($$renderer, {
											align: 'inline-end',
											children: ($$renderer) => {
												$$renderer.push(`<!---->12 results`);
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

						if (InputGroup.Root) {
							$$renderer.push('<!--[-->');

							InputGroup.Root($$renderer, {
								'data-disabled': 'true',
								children: ($$renderer) => {
									if (InputGroup.Input) {
										$$renderer.push('<!--[-->');

										InputGroup.Input($$renderer, {
											id: 'input-search-disabled-28',
											placeholder: 'Search documentation...',
											disabled: true
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (InputGroup.Addon) {
										$$renderer.push('<!--[-->');

										InputGroup.Addon($$renderer, {
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'SearchIcon',
													tabler: 'IconSearch',
													hugeicons: 'SearchIcon',
													phosphor: 'MagnifyingGlassIcon',
													remixicon: 'RiSearchLine'
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (InputGroup.Addon) {
										$$renderer.push('<!--[-->');

										InputGroup.Addon($$renderer, {
											align: 'inline-end',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Disabled`);
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
								class: 'grid grid-cols-2 gap-4',
								children: ($$renderer) => {
									if (Field.Field) {
										$$renderer.push('<!--[-->');

										Field.Field($$renderer, {
											children: ($$renderer) => {
												if (Field.Label) {
													$$renderer.push('<!--[-->');

													Field.Label($$renderer, {
														for: 'input-group-11',
														children: ($$renderer) => {
															$$renderer.push(`<!---->First Name`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Root) {
													$$renderer.push('<!--[-->');

													InputGroup.Root($$renderer, {
														children: ($$renderer) => {
															if (InputGroup.Input) {
																$$renderer.push('<!--[-->');
																InputGroup.Input($$renderer, { id: 'input-group-11', placeholder: 'First Name' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (InputGroup.Addon) {
																$$renderer.push('<!--[-->');

																InputGroup.Addon($$renderer, {
																	align: 'inline-end',
																	children: ($$renderer) => {
																		IconPlaceholder($$renderer, {
																			lucide: 'InfoIcon',
																			tabler: 'IconInfoCircle',
																			hugeicons: 'AlertCircleIcon',
																			phosphor: 'InfoIcon',
																			remixicon: 'RiInformationLine'
																		});
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
														for: 'input-group-12',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Last Name`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Root) {
													$$renderer.push('<!--[-->');

													InputGroup.Root($$renderer, {
														children: ($$renderer) => {
															if (InputGroup.Input) {
																$$renderer.push('<!--[-->');
																InputGroup.Input($$renderer, { id: 'input-group-12', placeholder: 'Last Name' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (InputGroup.Addon) {
																$$renderer.push('<!--[-->');

																InputGroup.Addon($$renderer, {
																	align: 'inline-end',
																	children: ($$renderer) => {
																		IconPlaceholder($$renderer, {
																			lucide: 'InfoIcon',
																			tabler: 'IconInfoCircle',
																			hugeicons: 'AlertCircleIcon',
																			phosphor: 'InfoIcon',
																			remixicon: 'RiInformationLine'
																		});
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
								'data-disabled': 'true',
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'input-group-29',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Loading ("data-disabled="true")`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (InputGroup.Root) {
										$$renderer.push('<!--[-->');

										InputGroup.Root($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Input) {
													$$renderer.push('<!--[-->');
													InputGroup.Input($$renderer, { id: 'input-group-29', disabled: true, value: 'shadcn' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputGroup.Addon) {
													$$renderer.push('<!--[-->');

													InputGroup.Addon($$renderer, {
														align: 'inline-end',
														children: ($$renderer) => {
															Spinner($$renderer, {});
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

									if (Field.Description) {
										$$renderer.push('<!--[-->');

										Field.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->This is a description of the input group.`);
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
import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Field_radio_fields($$renderer) {
	Example($$renderer, {
		title: 'Radio Fields',
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
											variant: 'label',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Subscription Plan`);
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
											value: 'free',
											children: ($$renderer) => {
												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														orientation: 'horizontal',
														children: ($$renderer) => {
															if (RadioGroup.Item) {
																$$renderer.push('<!--[-->');
																RadioGroup.Item($$renderer, { value: 'free', id: 'radio-free' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'radio-free',
																	class: 'font-normal',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Free Plan`);
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
															if (RadioGroup.Item) {
																$$renderer.push('<!--[-->');
																RadioGroup.Item($$renderer, { value: 'pro', id: 'radio-pro' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'radio-pro',
																	class: 'font-normal',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Pro Plan`);
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
															if (RadioGroup.Item) {
																$$renderer.push('<!--[-->');
																RadioGroup.Item($$renderer, { value: 'enterprise', id: 'radio-enterprise' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'radio-enterprise',
																	class: 'font-normal',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Enterprise`);
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

						if (Field.Set) {
							$$renderer.push('<!--[-->');

							Field.Set($$renderer, {
								children: ($$renderer) => {
									if (Field.Legend) {
										$$renderer.push('<!--[-->');

										Field.Legend($$renderer, {
											variant: 'label',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Battery Level`);
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
												$$renderer.push(`<!---->Choose your preferred battery level.`);
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
											children: ($$renderer) => {
												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														orientation: 'horizontal',
														children: ($$renderer) => {
															if (RadioGroup.Item) {
																$$renderer.push('<!--[-->');
																RadioGroup.Item($$renderer, { value: 'high', id: 'battery-high' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'battery-high',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->High`);
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
															if (RadioGroup.Item) {
																$$renderer.push('<!--[-->');
																RadioGroup.Item($$renderer, { value: 'medium', id: 'battery-medium' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'battery-medium',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Medium`);
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
															if (RadioGroup.Item) {
																$$renderer.push('<!--[-->');
																RadioGroup.Item($$renderer, { value: 'low', id: 'battery-low' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'battery-low',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Low`);
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

						if (RadioGroup.Root) {
							$$renderer.push('<!--[-->');

							RadioGroup.Root($$renderer, {
								class: 'gap-6',
								children: ($$renderer) => {
									if (Field.Field) {
										$$renderer.push('<!--[-->');

										Field.Field($$renderer, {
											orientation: 'horizontal',
											children: ($$renderer) => {
												if (RadioGroup.Item) {
													$$renderer.push('<!--[-->');
													RadioGroup.Item($$renderer, { value: 'option1', id: 'radio-content-1' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Field.Content) {
													$$renderer.push('<!--[-->');

													Field.Content($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'radio-content-1',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Enable Touch ID`);
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
																		$$renderer.push(`<!---->Enable Touch ID to quickly unlock your device.`);
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
												if (RadioGroup.Item) {
													$$renderer.push('<!--[-->');
													RadioGroup.Item($$renderer, { value: 'option2', id: 'radio-content-2' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Field.Content) {
													$$renderer.push('<!--[-->');

													Field.Content($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'radio-content-2',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Enable Touch ID and Face ID to make it even faster to unlock your device. This is a long
						label to test the layout.`);
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
																		$$renderer.push(`<!---->Enable Touch ID to quickly unlock your device.`);
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

						if (RadioGroup.Root) {
							$$renderer.push('<!--[-->');

							RadioGroup.Root($$renderer, {
								class: 'gap-3',
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'radio-title-1',
											children: ($$renderer) => {
												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														orientation: 'horizontal',
														children: ($$renderer) => {
															if (RadioGroup.Item) {
																$$renderer.push('<!--[-->');
																RadioGroup.Item($$renderer, { value: 'title1', id: 'radio-title-1' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Field.Content) {
																$$renderer.push('<!--[-->');

																Field.Content($$renderer, {
																	children: ($$renderer) => {
																		if (Field.Title) {
																			$$renderer.push('<!--[-->');

																			Field.Title($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Enable Touch ID`);
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
																					$$renderer.push(`<!---->Enable Touch ID to quickly unlock your device.`);
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

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'radio-title-2',
											children: ($$renderer) => {
												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														orientation: 'horizontal',
														children: ($$renderer) => {
															if (RadioGroup.Item) {
																$$renderer.push('<!--[-->');
																RadioGroup.Item($$renderer, { value: 'title2', id: 'radio-title-2' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Field.Content) {
																$$renderer.push('<!--[-->');

																Field.Content($$renderer, {
																	children: ($$renderer) => {
																		if (Field.Title) {
																			$$renderer.push('<!--[-->');

																			Field.Title($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Enable Touch ID and Face ID to make it even faster to unlock your device. This is a
							long label to test the layout.`);
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
																					$$renderer.push(`<!---->Enable Touch ID to quickly unlock your device.`);
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

						if (Field.Set) {
							$$renderer.push('<!--[-->');

							Field.Set($$renderer, {
								children: ($$renderer) => {
									if (Field.Legend) {
										$$renderer.push('<!--[-->');

										Field.Legend($$renderer, {
											variant: 'label',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Invalid Radio Group`);
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
											children: ($$renderer) => {
												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														'data-invalid': true,
														orientation: 'horizontal',
														children: ($$renderer) => {
															if (RadioGroup.Item) {
																$$renderer.push('<!--[-->');

																RadioGroup.Item($$renderer, {
																	value: 'invalid1',
																	id: 'radio-invalid-1',
																	'aria-invalid': true
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
																	for: 'radio-invalid-1',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Invalid Option 1`);
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
														'data-invalid': true,
														orientation: 'horizontal',
														children: ($$renderer) => {
															if (RadioGroup.Item) {
																$$renderer.push('<!--[-->');

																RadioGroup.Item($$renderer, {
																	value: 'invalid2',
																	id: 'radio-invalid-2',
																	'aria-invalid': true
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
																	for: 'radio-invalid-2',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Invalid Option 2`);
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

						if (Field.Set) {
							$$renderer.push('<!--[-->');

							Field.Set($$renderer, {
								children: ($$renderer) => {
									if (Field.Legend) {
										$$renderer.push('<!--[-->');

										Field.Legend($$renderer, {
											variant: 'label',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Disabled Radio Group`);
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
											disabled: true,
											children: ($$renderer) => {
												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														'data-disabled': true,
														orientation: 'horizontal',
														children: ($$renderer) => {
															if (RadioGroup.Item) {
																$$renderer.push('<!--[-->');
																RadioGroup.Item($$renderer, { value: 'disabled1', id: 'radio-disabled-1', disabled: true });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'radio-disabled-1',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Disabled Option 1`);
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
														'data-disabled': true,
														orientation: 'horizontal',
														children: ($$renderer) => {
															if (RadioGroup.Item) {
																$$renderer.push('<!--[-->');
																RadioGroup.Item($$renderer, { value: 'disabled2', id: 'radio-disabled-2', disabled: true });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'radio-disabled-2',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Disabled Option 2`);
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
		},
		$$slots: { default: true }
	});
}
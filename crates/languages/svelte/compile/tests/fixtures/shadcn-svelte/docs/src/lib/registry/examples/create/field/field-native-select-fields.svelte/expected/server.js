import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Field_native_select_fields($$renderer) {
	Example($$renderer, {
		title: 'Native Select Fields',
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
											for: 'native-select-basic',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Basic Native Select`);
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
											id: 'native-select-basic',
											children: ($$renderer) => {
												if (NativeSelect.Option) {
													$$renderer.push('<!--[-->');

													NativeSelect.Option($$renderer, {
														value: '',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Choose an option`);
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
														value: 'option1',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Option 1`);
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
														value: 'option2',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Option 2`);
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
														value: 'option3',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Option 3`);
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
											for: 'native-select-country',
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

									if (NativeSelect.Root) {
										$$renderer.push('<!--[-->');

										NativeSelect.Root($$renderer, {
											id: 'native-select-country',
											children: ($$renderer) => {
												if (NativeSelect.Option) {
													$$renderer.push('<!--[-->');

													NativeSelect.Option($$renderer, {
														value: '',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Select your country`);
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

									$$renderer.push(` `);

									if (Field.Description) {
										$$renderer.push('<!--[-->');

										Field.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Select the country where you currently reside.`);
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
											for: 'native-select-timezone',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Timezone`);
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
												$$renderer.push(`<!---->Choose your local timezone for accurate scheduling.`);
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
											id: 'native-select-timezone',
											children: ($$renderer) => {
												if (NativeSelect.Option) {
													$$renderer.push('<!--[-->');

													NativeSelect.Option($$renderer, {
														value: '',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Select timezone`);
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
														value: 'utc',
														children: ($$renderer) => {
															$$renderer.push(`<!---->UTC`);
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
														value: 'est',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Eastern Time`);
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
														value: 'pst',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Pacific Time`);
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
											for: 'native-select-grouped',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Grouped Options`);
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
											id: 'native-select-grouped',
											children: ($$renderer) => {
												if (NativeSelect.Option) {
													$$renderer.push('<!--[-->');

													NativeSelect.Option($$renderer, {
														value: '',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Select a region`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (NativeSelect.OptGroup) {
													$$renderer.push('<!--[-->');

													NativeSelect.OptGroup($$renderer, {
														label: 'North America',
														children: ($$renderer) => {
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

															$$renderer.push(` `);

															if (NativeSelect.Option) {
																$$renderer.push('<!--[-->');

																NativeSelect.Option($$renderer, {
																	value: 'mx',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Mexico`);
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

												if (NativeSelect.OptGroup) {
													$$renderer.push('<!--[-->');

													NativeSelect.OptGroup($$renderer, {
														label: 'Europe',
														children: ($$renderer) => {
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
																	value: 'fr',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->France`);
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
																	value: 'de',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Germany`);
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

									if (Field.Description) {
										$$renderer.push('<!--[-->');

										Field.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Native select with grouped options using optgroup.`);
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
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'native-select-invalid',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Invalid Native Select`);
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
											id: 'native-select-invalid',
											'aria-invalid': true,
											children: ($$renderer) => {
												if (NativeSelect.Option) {
													$$renderer.push('<!--[-->');

													NativeSelect.Option($$renderer, {
														value: '',
														children: ($$renderer) => {
															$$renderer.push(`<!---->This field has an error`);
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
														value: 'option1',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Option 1`);
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
														value: 'option2',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Option 2`);
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
														value: 'option3',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Option 3`);
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
												$$renderer.push(`<!---->This field contains validation errors.`);
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
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'native-select-disabled-field',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Disabled Field`);
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
											id: 'native-select-disabled-field',
											disabled: true,
											children: ($$renderer) => {
												if (NativeSelect.Option) {
													$$renderer.push('<!--[-->');

													NativeSelect.Option($$renderer, {
														value: '',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cannot select`);
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
														value: 'option1',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Option 1`);
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
														value: 'option2',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Option 2`);
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
														value: 'option3',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Option 3`);
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
												$$renderer.push(`<!---->This field is currently disabled.`);
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
import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Checkbox } from "$lib/registry/ui/checkbox/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Field_checkbox_fields($$renderer) {
	Example($$renderer, {
		title: 'Checkbox Fields',
		children: ($$renderer) => {
			if (Field.Group) {
				$$renderer.push('<!--[-->');

				Field.Group($$renderer, {
					children: ($$renderer) => {
						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								orientation: 'horizontal',
								children: ($$renderer) => {
									Checkbox($$renderer, { id: 'checkbox-basic', checked: true });
									$$renderer.push(`<!----> `);

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'checkbox-basic',
											class: 'font-normal',
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

						$$renderer.push(` `);

						if (Field.Field) {
							$$renderer.push('<!--[-->');

							Field.Field($$renderer, {
								orientation: 'horizontal',
								children: ($$renderer) => {
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'checkbox-right',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Accept terms and conditions`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);
									Checkbox($$renderer, { id: 'checkbox-right' });
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
									Checkbox($$renderer, { id: 'checkbox-with-desc' });
									$$renderer.push(`<!----> `);

									if (Field.Content) {
										$$renderer.push('<!--[-->');

										Field.Content($$renderer, {
											children: ($$renderer) => {
												if (Field.Label) {
													$$renderer.push('<!--[-->');

													Field.Label($$renderer, {
														for: 'checkbox-with-desc',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Subscribe to newsletter`);
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
															$$renderer.push(`<!---->Receive weekly updates about new features and promotions.`);
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
								for: 'checkbox-with-title',
								children: ($$renderer) => {
									if (Field.Field) {
										$$renderer.push('<!--[-->');

										Field.Field($$renderer, {
											orientation: 'horizontal',
											children: ($$renderer) => {
												Checkbox($$renderer, { id: 'checkbox-with-title' });
												$$renderer.push(`<!----> `);

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

						if (Field.Set) {
							$$renderer.push('<!--[-->');

							Field.Set($$renderer, {
								children: ($$renderer) => {
									if (Field.Legend) {
										$$renderer.push('<!--[-->');

										Field.Legend($$renderer, {
											variant: 'label',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Preferences`);
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
												$$renderer.push(`<!---->Select all that apply to customize your experience.`);
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
											class: 'gap-3',
											children: ($$renderer) => {
												if (Field.Field) {
													$$renderer.push('<!--[-->');

													Field.Field($$renderer, {
														orientation: 'horizontal',
														children: ($$renderer) => {
															Checkbox($$renderer, { id: 'pref-dark' });
															$$renderer.push(`<!----> `);

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'pref-dark',
																	class: 'font-normal',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Dark mode`);
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
															Checkbox($$renderer, { id: 'pref-compact' });
															$$renderer.push(`<!----> `);

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'pref-compact',
																	class: 'font-normal',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Compact view`);
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
															Checkbox($$renderer, { id: 'pref-notifications' });
															$$renderer.push(`<!----> `);

															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'pref-notifications',
																	class: 'font-normal',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Enable notifications`);
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
								'data-invalid': true,
								orientation: 'horizontal',
								children: ($$renderer) => {
									Checkbox($$renderer, { id: 'checkbox-invalid', 'aria-invalid': true });
									$$renderer.push(`<!----> `);

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'checkbox-invalid',
											class: 'font-normal',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Invalid checkbox`);
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
									Checkbox($$renderer, { id: 'checkbox-disabled-field', disabled: true });
									$$renderer.push(`<!----> `);

									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'checkbox-disabled-field',
											class: 'font-normal',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Disabled checkbox`);
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
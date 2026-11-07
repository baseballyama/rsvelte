import * as $ from 'svelte/internal/server';
import * as Field from "$lib/registry/ui/field/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Field_switch_fields($$renderer) {
	Example($$renderer, {
		title: 'Switch Fields',
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
									if (Field.Content) {
										$$renderer.push('<!--[-->');

										Field.Content($$renderer, {
											children: ($$renderer) => {
												if (Field.Label) {
													$$renderer.push('<!--[-->');

													Field.Label($$renderer, {
														for: 'switch-airplane',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Airplane Mode`);
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
															$$renderer.push(`<!---->Turn on airplane mode to disable all connections.`);
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
									Switch($$renderer, { id: 'switch-airplane' });
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
									if (Field.Label) {
										$$renderer.push('<!--[-->');

										Field.Label($$renderer, {
											for: 'switch-dark',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Dark Mode`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);
									Switch($$renderer, { id: 'switch-dark' });
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
									Switch($$renderer, { id: 'switch-marketing' });
									$$renderer.push(`<!----> `);

									if (Field.Content) {
										$$renderer.push('<!--[-->');

										Field.Content($$renderer, {
											children: ($$renderer) => {
												if (Field.Label) {
													$$renderer.push('<!--[-->');

													Field.Label($$renderer, {
														for: 'switch-marketing',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Marketing Emails`);
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
															$$renderer.push(`<!---->Receive emails about new products, features, and more.`);
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
											children: ($$renderer) => {
												$$renderer.push(`<!---->Privacy Settings`);
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
												$$renderer.push(`<!---->Manage your privacy preferences.`);
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
												Switch($$renderer, { id: 'switch-profile', checked: true });
												$$renderer.push(`<!----> `);

												if (Field.Content) {
													$$renderer.push('<!--[-->');

													Field.Content($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'switch-profile',
																	class: 'font-normal',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Make profile visible to others`);
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
												Switch($$renderer, { id: 'switch-email' });
												$$renderer.push(`<!----> `);

												if (Field.Content) {
													$$renderer.push('<!--[-->');

													Field.Content($$renderer, {
														children: ($$renderer) => {
															if (Field.Label) {
																$$renderer.push('<!--[-->');

																Field.Label($$renderer, {
																	for: 'switch-email',
																	class: 'font-normal',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Show email on profile`);
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
									if (Field.Content) {
										$$renderer.push('<!--[-->');

										Field.Content($$renderer, {
											children: ($$renderer) => {
												if (Field.Label) {
													$$renderer.push('<!--[-->');

													Field.Label($$renderer, {
														for: 'switch-invalid',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Invalid Switch`);
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
															$$renderer.push(`<!---->This switch has validation errors.`);
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
									Switch($$renderer, { id: 'switch-invalid', 'aria-invalid': true });
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
								'data-disabled': true,
								orientation: 'horizontal',
								children: ($$renderer) => {
									if (Field.Content) {
										$$renderer.push('<!--[-->');

										Field.Content($$renderer, {
											children: ($$renderer) => {
												if (Field.Label) {
													$$renderer.push('<!--[-->');

													Field.Label($$renderer, {
														for: 'switch-disabled-field',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Disabled Switch`);
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
															$$renderer.push(`<!---->This switch is currently disabled.`);
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
									Switch($$renderer, { id: 'switch-disabled-field', disabled: true });
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
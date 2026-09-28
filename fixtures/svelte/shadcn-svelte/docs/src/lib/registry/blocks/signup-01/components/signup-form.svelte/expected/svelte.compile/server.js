import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

export default function Signup_form($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, $.spread_props([
			restProps,
			{
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Create an account`);
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
											$$renderer.push(`<!---->Enter your information below to create your account`);
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
								$$renderer.push(`<form>`);

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
																for: 'name',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Full Name`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														Input($$renderer, {
															id: 'name',
															type: 'text',
															placeholder: 'John Doe',
															required: true
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
													children: ($$renderer) => {
														if (Field.Label) {
															$$renderer.push('<!--[-->');

															Field.Label($$renderer, {
																for: 'email',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Email`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														Input($$renderer, {
															id: 'email',
															type: 'email',
															placeholder: 'm@example.com',
															required: true
														});

														$$renderer.push(`<!----> `);

														if (Field.Description) {
															$$renderer.push('<!--[-->');

															Field.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->We'll use this to contact you. We will not share your email with anyone else.`);
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
																for: 'password',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Password`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);
														Input($$renderer, { id: 'password', type: 'password', required: true });
														$$renderer.push(`<!----> `);

														if (Field.Description) {
															$$renderer.push('<!--[-->');

															Field.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Must be at least 8 characters long.`);
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
																for: 'confirm-password',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Confirm Password`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);
														Input($$renderer, { id: 'confirm-password', type: 'password', required: true });
														$$renderer.push(`<!----> `);

														if (Field.Description) {
															$$renderer.push('<!--[-->');

															Field.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Please confirm your password.`);
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
													children: ($$renderer) => {
														if (Field.Field) {
															$$renderer.push('<!--[-->');

															Field.Field($$renderer, {
																children: ($$renderer) => {
																	Button($$renderer, {
																		type: 'submit',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Create Account`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----> `);

																	Button($$renderer, {
																		variant: 'outline',
																		type: 'button',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Sign up with Google`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----> `);

																	if (Field.Description) {
																		$$renderer.push('<!--[-->');

																		Field.Description($$renderer, {
																			class: 'px-6 text-center',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Already have an account? <a href="#/">Sign in</a>`);
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

								$$renderer.push(`</form>`);
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
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}
import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { Label } from '$lib/components/ui/label';
import * as Card from '$lib/components/ui/card';
import * as Password from '$lib/components/ui/password';
import { Input } from '$lib/components/ui/input';
import { sleep } from '$lib/utils/sleep';
import { enhance } from '$app/forms';
import * as Field from '$lib/components/ui/field';

export default function Signup_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let loading = false;

		async function submit() {
			loading = true;
			await sleep(500);
			loading = false;
		}

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
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
											$$renderer.push(`<!---->Enter your email below to create your account`);
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
							class: 'flex flex-col gap-4',
							children: ($$renderer) => {
								$$renderer.push(`<form method="POST" class="flex flex-col gap-4">`);

								if (Field.Group) {
									$$renderer.push('<!--[-->');

									Field.Group($$renderer, {
										children: ($$renderer) => {
											if (Field.Field) {
												$$renderer.push('<!--[-->');

												Field.Field($$renderer, {
													children: ($$renderer) => {
														Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Email`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Input($$renderer, {
															name: 'email',
															type: 'email',
															placeholder: 'm@example.com',
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
														Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Password`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														if (Password.Root) {
															$$renderer.push('<!--[-->');

															Password.Root($$renderer, {
																children: ($$renderer) => {
																	if (Password.Input) {
																		$$renderer.push('<!--[-->');

																		Password.Input($$renderer, {
																			name: 'password',
																			required: true,
																			placeholder: 'Password',
																			children: ($$renderer) => {
																				if (Password.ToggleVisibility) {
																					$$renderer.push('<!--[-->');
																					Password.ToggleVisibility($$renderer, {});
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

																	if (Password.Strength) {
																		$$renderer.push('<!--[-->');
																		Password.Strength($$renderer, {});
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

								Button($$renderer, {
									type: 'submit',
									class: 'w-full',
									loading,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Create account`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></form>`);
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
	});
}
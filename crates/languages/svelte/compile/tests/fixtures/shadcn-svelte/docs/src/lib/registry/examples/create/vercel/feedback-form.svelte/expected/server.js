import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Textarea } from "$lib/registry/ui/textarea/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Feedback_form($$renderer) {
	Example($$renderer, {
		title: 'Feedback Form',
		class: 'items-center justify-center',
		children: ($$renderer) => {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'w-full max-w-sm',
					size: 'sm',
					children: ($$renderer) => {
						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<form id="feedback-form">`);

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
																	for: 'topic',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Topic`);
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
																	id: 'topic',
																	children: ($$renderer) => {
																		if (NativeSelect.Option) {
																			$$renderer.push('<!--[-->');

																			NativeSelect.Option($$renderer, {
																				value: '',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Select a topic`);
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
																				value: 'ai',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->AI`);
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
																				value: 'accounts-and-access-controls',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Accounts and Access Controls`);
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
																				value: 'billing',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Billing`);
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
																				value: 'cdn',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->CDN (Firewall, Caching)`);
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
																				value: 'ci-cd',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->CI/CD (Builds, Deployments, Environment Variables)`);
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
																				value: 'dashboard-interface',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Dashboard Interface (Navigation, UI Issues)`);
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
																				value: 'domains',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Domains`);
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
																				value: 'frameworks',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Frameworks`);
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
																				value: 'marketplace-and-integrations',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Marketplace and Integrations`);
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
																				value: 'observability',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Observability (Observability, Logs, Monitoring)`);
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
																				value: 'storage',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Storage`);
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
																	for: 'feedback',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Feedback`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															Textarea($$renderer, {
																id: 'feedback',
																placeholder: 'Your feedback helps us improve...'
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

									$$renderer.push(`</form>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								children: ($$renderer) => {
									Button($$renderer, {
										type: 'submit',
										form: 'feedback-form',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Submit`);
										},
										$$slots: { default: true }
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
}
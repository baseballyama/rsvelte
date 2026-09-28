import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Field from "$lib/components/ui/field/index.js";
import * as InputGroup from "$lib/components/ui/input-group/index.js";
import MailIcon from "@lucide/svelte/icons/mail";
import LockIcon from "@lucide/svelte/icons/lock";
import UserIcon from "@lucide/svelte/icons/user";
import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
import EyeClosedIcon from "@lucide/svelte/icons/eye-closed";
import EyeOpenIcon from "@lucide/svelte/icons/eye";
import * as Alert from "$lib/components/ui/alert/index.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, form } = $$props;
		const isAdminAccountCreated = $.derived(() => data.isAdminAccountCreated);
		const isSetupComplete = $.derived(() => data.isSetupComplete);
		const authActionPath = $.derived(() => !isAdminAccountCreated() ? "?/signup" : "?/login");
		const emailValue = $.derived(() => form?.values?.email ?? "");
		const nameValue = $.derived(() => form?.values && "name" in form.values ? form.values.name : "");
		let loading = false;
		let showPassword = false;
		let password = "";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1kbfwq6', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>${$.escape(!isAdminAccountCreated() ? "Create Admin Account" : "Sign In")}</title>`);
				});
			});

			$$renderer.push(`<div class="flex min-h-screen items-center justify-center p-4">`);

			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'kener-card w-full max-w-md',
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(!isAdminAccountCreated() ? "Create Admin Account" : "Sign In")}`);
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
												$$renderer.push(`<!---->${$.escape(!isAdminAccountCreated()
													? "Set up your admin account to get started"
													: "Enter your credentials to access the dashboard")}`);
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
									if (!isSetupComplete()) {
										$$renderer.push('<!--[0-->');

										if (Alert.Root) {
											$$renderer.push('<!--[-->');

											Alert.Root($$renderer, {
												variant: 'destructive',
												children: ($$renderer) => {
													AlertCircleIcon($$renderer, {});
													$$renderer.push(`<!----> `);

													if (Alert.Title) {
														$$renderer.push('<!--[-->');

														Alert.Title($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Set up not completed.`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Alert.Description) {
														$$renderer.push('<!--[-->');

														Alert.Description($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<p>Please make sure to set the below environment variables:</p> <ul class="list-inside list-disc text-sm"><li>KENER_SECRET_KEY</li> <li>ORIGIN</li> <li>REDIS_URL</li></ul> `);

																Button($$renderer, {
																	variant: 'link',
																	size: 'sm',
																	class: 'text-destructive w-full justify-start underline',
																	href: 'https://kener.ing/docs/v4/setup/environment-variables',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Go to docs`);
																	},
																	$$slots: { default: true }
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
									} else {
										$$renderer.push(`<!--[-1--><form method="POST"${$.attr('action', authActionPath())}>`);

										if (form?.error) {
											$$renderer.push('<!--[0-->');

											if (Alert.Root) {
												$$renderer.push('<!--[-->');

												Alert.Root($$renderer, {
													variant: 'destructive',
													class: 'mb-4',
													children: ($$renderer) => {
														AlertCircleIcon($$renderer, {});
														$$renderer.push(`<!----> `);

														if (Alert.Title) {
															$$renderer.push('<!--[-->');

															Alert.Title($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(!isAdminAccountCreated() ? "Signup failed" : "Login failed")}`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Alert.Description) {
															$$renderer.push('<!--[-->');

															Alert.Description($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(form.error)}`);
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
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (Field.Group) {
											$$renderer.push('<!--[-->');

											Field.Group($$renderer, {
												children: ($$renderer) => {
													if (!isAdminAccountCreated()) {
														$$renderer.push('<!--[0-->');

														if (Field.Field) {
															$$renderer.push('<!--[-->');

															Field.Field($$renderer, {
																children: ($$renderer) => {
																	if (Field.Label) {
																		$$renderer.push('<!--[-->');

																		Field.Label($$renderer, {
																			for: 'name',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Name`);
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
																				if (InputGroup.Addon) {
																					$$renderer.push('<!--[-->');

																					InputGroup.Addon($$renderer, {
																						children: ($$renderer) => {
																							UserIcon($$renderer, {});
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (InputGroup.Input) {
																					$$renderer.push('<!--[-->');

																					InputGroup.Input($$renderer, {
																						id: 'name',
																						name: 'name',
																						type: 'text',
																						placeholder: 'Your name',
																						value: nameValue(),
																						required: true
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
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> `);

													if (Field.Field) {
														$$renderer.push('<!--[-->');

														Field.Field($$renderer, {
															class: 'relative flex flex-col gap-1',
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

																if (InputGroup.Root) {
																	$$renderer.push('<!--[-->');

																	InputGroup.Root($$renderer, {
																		children: ($$renderer) => {
																			if (InputGroup.Addon) {
																				$$renderer.push('<!--[-->');

																				InputGroup.Addon($$renderer, {
																					children: ($$renderer) => {
																						MailIcon($$renderer, {});
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (InputGroup.Input) {
																				$$renderer.push('<!--[-->');

																				InputGroup.Input($$renderer, {
																					id: 'email',
																					name: 'email',
																					type: 'email',
																					placeholder: 'you@example.com',
																					value: emailValue(),
																					required: true
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
															class: 'relative flex flex-col gap-1',
															children: ($$renderer) => {
																if (Field.Label) {
																	$$renderer.push('<!--[-->');

																	Field.Label($$renderer, {
																		for: 'password',
																		class: 'relative',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Password `);

																			Button($$renderer, {
																				variant: 'link',
																				size: 'sm',
																				class: 'text-muted-foreground absolute top-0 right-0 h-auto p-0 text-xs',
																				href: '/account/forgot',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Forgot?`);
																				},
																				$$slots: { default: true }
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

																if (InputGroup.Root) {
																	$$renderer.push('<!--[-->');

																	InputGroup.Root($$renderer, {
																		children: ($$renderer) => {
																			if (InputGroup.Addon) {
																				$$renderer.push('<!--[-->');

																				InputGroup.Addon($$renderer, {
																					children: ($$renderer) => {
																						LockIcon($$renderer, {});
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (InputGroup.Input) {
																				$$renderer.push('<!--[-->');

																				InputGroup.Input($$renderer, {
																					id: 'password',
																					name: 'password',
																					type: showPassword ? "text" : "password",
																					placeholder: '••••••••',
																					required: true,
																					get value() {
																						return password;
																					},

																					set value($$value) {
																						password = $$value;
																						$$settled = false;
																					}
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
																						if (InputGroup.Button) {
																							$$renderer.push('<!--[-->');

																							InputGroup.Button($$renderer, {
																								type: 'button',
																								'aria-label': showPassword ? "Hide password" : "Show password",
																								title: showPassword ? "Hide password" : "Show password",
																								size: 'icon-xs',
																								onclick: () => showPassword = !showPassword,
																								children: ($$renderer) => {
																									if (showPassword) {
																										$$renderer.push('<!--[0-->');
																										EyeClosedIcon($$renderer, { class: 'size-4' });
																									} else {
																										$$renderer.push('<!--[-1-->');
																										EyeOpenIcon($$renderer, { class: 'size-4' });
																									}

																									$$renderer.push(`<!--]-->`);
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

																if (!isAdminAccountCreated()) {
																	$$renderer.push('<!--[0-->');

																	if (Field.Description) {
																		$$renderer.push('<!--[-->');

																		Field.Description($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Password must contain at least 8 characters, one uppercase, one lowercase, and one number.`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]-->`);
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

										$$renderer.push(` <div class="mt-6">`);

										Button($$renderer, {
											type: 'submit',
											class: 'w-full',
											disabled: loading,
											children: ($$renderer) => {
												if (loading) {
													$$renderer.push(`<!--[0-->${$.escape(!isAdminAccountCreated() ? "Creating Account..." : "Signing In...")}`);
												} else {
													$$renderer.push(`<!--[-1-->${$.escape(!isAdminAccountCreated() ? "Create Account" : "Sign In")}`);
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div></form>`);
									}

									$$renderer.push(`<!--]-->`);
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
	});
}
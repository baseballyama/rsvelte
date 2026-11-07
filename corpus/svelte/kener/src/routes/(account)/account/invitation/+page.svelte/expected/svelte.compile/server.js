import * as $ from 'svelte/internal/server';
import { toast } from "svelte-sonner";
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Field from "$lib/components/ui/field/index.js";
import * as InputGroup from "$lib/components/ui/input-group/index.js";
import LockIcon from "@lucide/svelte/icons/lock";
import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
import EyeClosedIcon from "@lucide/svelte/icons/eye-closed";
import EyeOpenIcon from "@lucide/svelte/icons/eye";
import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;
		const valid = $.derived(() => data.valid);
		const error = $.derived(() => data.error);
		const token = $.derived(() => data.token);
		const email = $.derived(() => data.email || "");
		const name = $.derived(() => data.name || "");
		let loading = false;
		let showPassword = false;
		let showConfirmPassword = false;
		let accountActivated = false;
		let newPassword = "";
		let confirmPassword = "";

		async function handleAcceptInvitation() {
			if (!newPassword || !confirmPassword) {
				toast.error("Please fill in all fields");

				return;
			}

			if (newPassword !== confirmPassword) {
				toast.error("Passwords do not match");

				return;
			}

			if (newPassword.length < 8) {
				toast.error("Password must be at least 8 characters");

				return;
			}

			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/account/invitation/api/accept-invitation"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ receivedToken: token(), newPassword })
				});

				const data = await response.json();

				if (!response.ok) {
					toast.error(data.error || "Failed to set password");

					return;
				}

				accountActivated = true;
				toast.success("Account activated successfully!");
			} catch(e) {
				toast.error("An error occurred. Please try again.");
			} finally {
				loading = false;
			}
		}

		function handleSubmit(e) {
			e.preventDefault();
			handleAcceptInvitation();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('cqvmtp', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Accept Invitation</title>`);
				});
			});

			$$renderer.push(`<div class="flex min-h-screen items-center justify-center p-4">`);

			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'kener-card w-full max-w-md',
					children: ($$renderer) => {
						if (!valid()) {
							$$renderer.push('<!--[0-->');

							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									class: 'text-center',
									children: ($$renderer) => {
										$$renderer.push(`<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">`);
										AlertCircleIcon($$renderer, { class: 'h-8 w-8 text-red-600' });
										$$renderer.push(`<!----></div> `);

										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Invalid Invitation`);
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
													$$renderer.push(`<!---->${$.escape(error())}`);
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
										Button($$renderer, {
											href: clientResolver(resolve, "/account/signin"),
											class: 'w-full',
											children: ($$renderer) => {
												ArrowLeftIcon($$renderer, { class: 'mr-2 h-4 w-4' });
												$$renderer.push(`<!----> Go to Sign In`);
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
						} else if (accountActivated) {
							$$renderer.push('<!--[1-->');

							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									class: 'text-center',
									children: ($$renderer) => {
										$$renderer.push(`<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">`);
										CheckCircleIcon($$renderer, { class: 'h-8 w-8 text-green-600' });
										$$renderer.push(`<!----></div> `);

										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Account Activated`);
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
													$$renderer.push(`<!---->Your account has been set up successfully. You can now sign in with your new password.`);
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
										Button($$renderer, {
											href: clientResolver(resolve, "/account/signin"),
											class: 'w-full',
											children: ($$renderer) => {
												ArrowLeftIcon($$renderer, { class: 'mr-2 h-4 w-4' });
												$$renderer.push(`<!----> Go to Sign In`);
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
						} else {
							$$renderer.push('<!--[-1-->');

							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Welcome, ${$.escape(name())}!`);
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
													$$renderer.push(`<!---->You've been invited to join as <strong>${$.escape(email())}</strong>. Create a password to activate your account and get
          started.`);
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
															class: 'relative flex flex-col gap-1',
															children: ($$renderer) => {
																if (Field.Label) {
																	$$renderer.push('<!--[-->');

																	Field.Label($$renderer, {
																		for: 'newPassword',
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
																					id: 'newPassword',
																					type: showPassword ? "text" : "password",
																					placeholder: '••••••••',
																					required: true,
																					get value() {
																						return newPassword;
																					},

																					set value($$value) {
																						newPassword = $$value;
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
																		for: 'confirmPassword',
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
																					id: 'confirmPassword',
																					type: showConfirmPassword ? "text" : "password",
																					placeholder: '••••••••',
																					required: true,
																					get value() {
																						return confirmPassword;
																					},

																					set value($$value) {
																						confirmPassword = $$value;
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
																								'aria-label': showConfirmPassword ? "Hide password" : "Show password",
																								title: showConfirmPassword ? "Hide password" : "Show password",
																								size: 'icon-xs',
																								onclick: () => showConfirmPassword = !showConfirmPassword,
																								children: ($$renderer) => {
																									if (showConfirmPassword) {
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
													$$renderer.push(`<!--[0-->Activating Account...`);
												} else {
													$$renderer.push(`<!--[-1-->Activate Account`);
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div> <div class="mt-4 text-center">`);

										Button($$renderer, {
											variant: 'link',
											href: clientResolver(resolve, "/account/signin"),
											class: 'text-sm',
											children: ($$renderer) => {
												ArrowLeftIcon($$renderer, { class: 'mr-1 h-3 w-3' });
												$$renderer.push(`<!----> Back to Sign In`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div></form>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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
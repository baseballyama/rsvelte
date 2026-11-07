import * as $ from 'svelte/internal/server';
import { toast } from "svelte-sonner";
import { Button } from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Field from "$lib/components/ui/field/index.js";
import * as InputGroup from "$lib/components/ui/input-group/index.js";
import { goto } from "$app/navigation";
import MailIcon from "@lucide/svelte/icons/mail";
import LockIcon from "@lucide/svelte/icons/lock";
import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
import EyeClosedIcon from "@lucide/svelte/icons/eye-closed";
import EyeOpenIcon from "@lucide/svelte/icons/eye";
import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;
		const view = $.derived(() => data.view);
		const token = $.derived(() => data.token);
		let loading = false;
		let showPassword = false;
		let showConfirmPassword = false;
		let emailSent = false;
		let passwordReset = false;
		let email = "";
		let newPassword = "";
		let confirmPassword = "";

		async function handleRequestReset() {
			if (!email) {
				toast.error("Please enter your email address");

				return;
			}

			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/account/forgot/api/fogot-password"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email })
				});

				const data = await response.json();

				if (!response.ok) {
					toast.error(data.error || "Failed to send reset email");

					return;
				}

				emailSent = true;
				toast.success("Password reset email sent!");
			} catch(e) {
				toast.error("An error occurred. Please try again.");
			} finally {
				loading = false;
			}
		}

		async function handlePasswordReset() {
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
				const response = await fetch(clientResolver(resolve, "/account/forgot/api/password-reset"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ receivedToken: token(), newPassword })
				});

				const data = await response.json();

				if (!response.ok) {
					toast.error(data.error || "Failed to reset password");

					return;
				}

				passwordReset = true;
				toast.success("Password reset successfully!");
			} catch(e) {
				toast.error("An error occurred. Please try again.");
			} finally {
				loading = false;
			}
		}

		function handleSubmit(e) {
			e.preventDefault();

			if (view() === "confirm_token") {
				handlePasswordReset();
			} else {
				handleRequestReset();
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1qbixu1', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>${$.escape(view() === "confirm_token" ? "Reset Password" : "Forgot Password")}</title>`);
				});
			});

			$$renderer.push(`<div class="flex min-h-screen items-center justify-center p-4">`);

			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'kener-card w-full max-w-md',
					children: ($$renderer) => {
						if (view() === "confirm_token") {
							$$renderer.push('<!--[0-->');

							if (passwordReset) {
								$$renderer.push('<!--[0-->');

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
														$$renderer.push(`<!---->Password Reset Complete`);
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
														$$renderer.push(`<!---->Your password has been reset successfully. You can now sign in with your new password.`);
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
													$$renderer.push(`<!----> Back to Sign In`);
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
														$$renderer.push(`<!---->Set New Password`);
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
														$$renderer.push(`<!---->Enter your new password below to complete the reset process.`);
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
																				$$renderer.push(`<!---->New Password`);
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
																				$$renderer.push(`<!---->Password must be at least 8 characters.`);
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
														$$renderer.push(`<!--[0-->Resetting Password...`);
													} else {
														$$renderer.push(`<!--[-1-->Reset Password`);
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
						} else {
							$$renderer.push('<!--[-1-->');

							if (emailSent) {
								$$renderer.push('<!--[0-->');

								if (Card.Header) {
									$$renderer.push('<!--[-->');

									Card.Header($$renderer, {
										class: 'text-center',
										children: ($$renderer) => {
											$$renderer.push(`<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">`);
											MailIcon($$renderer, { class: 'h-8 w-8 text-blue-600' });
											$$renderer.push(`<!----></div> `);

											if (Card.Title) {
												$$renderer.push('<!--[-->');

												Card.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Check Your Email`);
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
														$$renderer.push(`<!---->We've sent a password reset link to <strong>${$.escape(email)}</strong>. Please check your inbox and click the link to
            reset your password.`);
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
											$$renderer.push(`<p class="text-muted-foreground mb-4 text-center text-sm">Didn't receive the email? Check your spam folder or try again.</p> `);

											Button($$renderer, {
												variant: 'outline',
												class: 'w-full',
												onclick: () => emailSent = false,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Try Again`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <div class="mt-4 text-center">`);

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

											$$renderer.push(`<!----></div>`);
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
														$$renderer.push(`<!---->Forgot Password`);
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
														$$renderer.push(`<!---->Enter your email address and we'll send you a link to reset your password.`);
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
																						type: 'email',
																						placeholder: 'you@example.com',
																						required: true,
																						get value() {
																							return email;
																						},

																						set value($$value) {
																							email = $$value;
																							$$settled = false;
																						}
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
														$$renderer.push(`<!--[0-->Sending Reset Link...`);
													} else {
														$$renderer.push(`<!--[-1-->Send Reset Link`);
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
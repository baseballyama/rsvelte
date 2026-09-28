import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><!></div> <!> <!>`, 1);
var root_1 = $.from_html(`<!> Back to Sign In`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<form><!> <div class="mt-6"><!></div> <div class="mt-4 text-center"><!></div></form>`);

var root_5 = $.from_html(
	`We've sent a password reset link to <strong> </strong>. Please check your inbox and click the link to
            reset your password.`,
	1
);

var root_6 = $.from_html(`<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"><!></div> <!> <!>`, 1);
var root_7 = $.from_html(`<p class="text-muted-foreground mb-4 text-center text-sm">Didn't receive the email? Check your spam folder or try again.</p> <!> <div class="mt-4 text-center"><!></div>`, 1);
var root_8 = $.from_html(`<div class="flex min-h-screen items-center justify-center p-4"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const view = $.derived(() => $$props.data.view);
	const token = $.derived(() => $$props.data.token);
	let loading = $.state(false);
	let showPassword = $.state(false);
	let showConfirmPassword = $.state(false);
	let emailSent = $.state(false);
	let passwordReset = $.state(false);
	let email = $.state("");
	let newPassword = $.state("");
	let confirmPassword = $.state("");

	async function handleRequestReset() {
		if (!$.get(email)) {
			toast.error("Please enter your email address");

			return;
		}

		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/account/forgot/api/fogot-password"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: $.get(email) })
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.error || "Failed to send reset email");

				return;
			}

			$.set(emailSent, true);
			toast.success("Password reset email sent!");
		} catch(e) {
			toast.error("An error occurred. Please try again.");
		} finally {
			$.set(loading, false);
		}
	}

	async function handlePasswordReset() {
		if (!$.get(newPassword) || !$.get(confirmPassword)) {
			toast.error("Please fill in all fields");

			return;
		}

		if ($.get(newPassword) !== $.get(confirmPassword)) {
			toast.error("Passwords do not match");

			return;
		}

		if ($.get(newPassword).length < 8) {
			toast.error("Password must be at least 8 characters");

			return;
		}

		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/account/forgot/api/password-reset"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ receivedToken: $.get(token), newPassword: $.get(newPassword) })
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.error || "Failed to reset password");

				return;
			}

			$.set(passwordReset, true);
			toast.success("Password reset successfully!");
		} catch(e) {
			toast.error("An error occurred. Please try again.");
		} finally {
			$.set(loading, false);
		}
	}

	function handleSubmit(e) {
		e.preventDefault();

		if ($.get(view) === "confirm_token") {
			handlePasswordReset();
		} else {
			handleRequestReset();
		}
	}

	var div = root_8();

	$.head('1qbixu1', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = $.get(view) === "confirm_token" ? "Reset Password" : "Forgot Password";
		});
	});

	var node = $.child(div);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'kener-card w-full max-w-md',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				{
					var consequent_4 = ($$anchor) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								var fragment_2 = root_2();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Card.Header, ($$anchor, Card_Header) => {
									Card_Header($$anchor, {
										class: 'text-center',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var div_1 = $.first_child(fragment_3);
											var node_4 = $.child(div_1);

											CheckCircleIcon(node_4, { class: 'h-8 w-8 text-green-600' });
											$.reset(div_1);

											var node_5 = $.sibling(div_1, 2);

											$.component(node_5, () => Card.Title, ($$anchor, Card_Title) => {
												Card_Title($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Password Reset Complete');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											var node_6 = $.sibling(node_5, 2);

											$.component(node_6, () => Card.Description, ($$anchor, Card_Description) => {
												Card_Description($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Your password has been reset successfully. You can now sign in with your new password.');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								var node_7 = $.sibling(node_3, 2);

								$.component(node_7, () => Card.Content, ($$anchor, Card_Content) => {
									Card_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											{
												let $0 = $.derived(() => clientResolver(resolve, "/account/signin"));

												Button($$anchor, {
													get href() {
														return $.get($0);
													},
													class: 'w-full',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_1();
														var node_8 = $.first_child(fragment_5);

														ArrowLeftIcon(node_8, { class: 'mr-2 h-4 w-4' });
														$.next();
														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											}
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							};

							var alternate_3 = ($$anchor) => {
								var fragment_6 = root_2();
								var node_9 = $.first_child(fragment_6);

								$.component(node_9, () => Card.Header, ($$anchor, Card_Header_1) => {
									Card_Header_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root_2();
											var node_10 = $.first_child(fragment_7);

											$.component(node_10, () => Card.Title, ($$anchor, Card_Title_1) => {
												Card_Title_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Set New Password');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											var node_11 = $.sibling(node_10, 2);

											$.component(node_11, () => Card.Description, ($$anchor, Card_Description_1) => {
												Card_Description_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Enter your new password below to complete the reset process.');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								});

								var node_12 = $.sibling(node_9, 2);

								$.component(node_12, () => Card.Content, ($$anchor, Card_Content_1) => {
									Card_Content_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var form = root_4();
											var node_13 = $.child(form);

											$.component(node_13, () => Field.Group, ($$anchor, Field_Group) => {
												Field_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root_2();
														var node_14 = $.first_child(fragment_8);

														$.component(node_14, () => Field.Field, ($$anchor, Field_Field) => {
															Field_Field($$anchor, {
																class: 'relative flex flex-col gap-1',
																children: ($$anchor, $$slotProps) => {
																	var fragment_9 = root_3();
																	var node_15 = $.first_child(fragment_9);

																	$.component(node_15, () => Field.Label, ($$anchor, Field_Label) => {
																		Field_Label($$anchor, {
																			for: 'newPassword',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_4 = $.text('New Password');

																				$.append($$anchor, text_4);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_16 = $.sibling(node_15, 2);

																	$.component(node_16, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
																		InputGroup_Root($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_10 = root_3();
																				var node_17 = $.first_child(fragment_10);

																				$.component(node_17, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																					InputGroup_Addon($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							LockIcon($$anchor, {});
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_18 = $.sibling(node_17, 2);

																				{
																					let $0 = $.derived(() => $.get(showPassword) ? "text" : "password");

																					$.component(node_18, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																						InputGroup_Input($$anchor, {
																							id: 'newPassword',
																							get type() {
																								return $.get($0);
																							},
																							placeholder: '••••••••',
																							required: true,
																							get value() {
																								return $.get(newPassword);
																							},

																							set value($$value) {
																								$.set(newPassword, $$value, true);
																							}
																						});
																					});
																				}

																				var node_19 = $.sibling(node_18, 2);

																				$.component(node_19, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
																					InputGroup_Addon_1($$anchor, {
																						align: 'inline-end',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_12 = $.comment();
																							var node_20 = $.first_child(fragment_12);

																							{
																								let $0 = $.derived(() => $.get(showPassword) ? "Hide password" : "Show password");
																								let $1 = $.derived(() => $.get(showPassword) ? "Hide password" : "Show password");

																								$.component(node_20, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
																									InputGroup_Button($$anchor, {
																										type: 'button',
																										get 'aria-label'() {
																											return $.get($0);
																										},

																										get title() {
																											return $.get($1);
																										},
																										size: 'icon-xs',
																										onclick: () => $.set(showPassword, !$.get(showPassword)),
																										children: ($$anchor, $$slotProps) => {
																											var fragment_13 = $.comment();
																											var node_21 = $.first_child(fragment_13);

																											{
																												var consequent_1 = ($$anchor) => {
																													EyeClosedIcon($$anchor, { class: 'size-4' });
																												};

																												var alternate = ($$anchor) => {
																													EyeOpenIcon($$anchor, { class: 'size-4' });
																												};

																												$.if(node_21, ($$render) => {
																													if ($.get(showPassword)) $$render(consequent_1); else $$render(alternate, -1);
																												});
																											}

																											$.append($$anchor, fragment_13);
																										},
																										$$slots: { default: true }
																									});
																								});
																							}

																							$.append($$anchor, fragment_12);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_10);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_22 = $.sibling(node_16, 2);

																	$.component(node_22, () => Field.Description, ($$anchor, Field_Description) => {
																		Field_Description($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_5 = $.text('Password must be at least 8 characters.');

																				$.append($$anchor, text_5);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_9);
																},
																$$slots: { default: true }
															});
														});

														var node_23 = $.sibling(node_14, 2);

														$.component(node_23, () => Field.Field, ($$anchor, Field_Field_1) => {
															Field_Field_1($$anchor, {
																class: 'relative flex flex-col gap-1',
																children: ($$anchor, $$slotProps) => {
																	var fragment_16 = root_2();
																	var node_24 = $.first_child(fragment_16);

																	$.component(node_24, () => Field.Label, ($$anchor, Field_Label_1) => {
																		Field_Label_1($$anchor, {
																			for: 'confirmPassword',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_6 = $.text('Confirm Password');

																				$.append($$anchor, text_6);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_25 = $.sibling(node_24, 2);

																	$.component(node_25, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
																		InputGroup_Root_1($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_17 = root_3();
																				var node_26 = $.first_child(fragment_17);

																				$.component(node_26, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
																					InputGroup_Addon_2($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							LockIcon($$anchor, {});
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_27 = $.sibling(node_26, 2);

																				{
																					let $0 = $.derived(() => $.get(showConfirmPassword) ? "text" : "password");

																					$.component(node_27, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
																						InputGroup_Input_1($$anchor, {
																							id: 'confirmPassword',
																							get type() {
																								return $.get($0);
																							},
																							placeholder: '••••••••',
																							required: true,
																							get value() {
																								return $.get(confirmPassword);
																							},

																							set value($$value) {
																								$.set(confirmPassword, $$value, true);
																							}
																						});
																					});
																				}

																				var node_28 = $.sibling(node_27, 2);

																				$.component(node_28, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
																					InputGroup_Addon_3($$anchor, {
																						align: 'inline-end',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_19 = $.comment();
																							var node_29 = $.first_child(fragment_19);

																							{
																								let $0 = $.derived(() => $.get(showConfirmPassword) ? "Hide password" : "Show password");
																								let $1 = $.derived(() => $.get(showConfirmPassword) ? "Hide password" : "Show password");

																								$.component(node_29, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
																									InputGroup_Button_1($$anchor, {
																										type: 'button',
																										get 'aria-label'() {
																											return $.get($0);
																										},

																										get title() {
																											return $.get($1);
																										},
																										size: 'icon-xs',
																										onclick: () => $.set(showConfirmPassword, !$.get(showConfirmPassword)),
																										children: ($$anchor, $$slotProps) => {
																											var fragment_20 = $.comment();
																											var node_30 = $.first_child(fragment_20);

																											{
																												var consequent_2 = ($$anchor) => {
																													EyeClosedIcon($$anchor, { class: 'size-4' });
																												};

																												var alternate_1 = ($$anchor) => {
																													EyeOpenIcon($$anchor, { class: 'size-4' });
																												};

																												$.if(node_30, ($$render) => {
																													if ($.get(showConfirmPassword)) $$render(consequent_2); else $$render(alternate_1, -1);
																												});
																											}

																											$.append($$anchor, fragment_20);
																										},
																										$$slots: { default: true }
																									});
																								});
																							}

																							$.append($$anchor, fragment_19);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_17);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_16);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												});
											});

											var div_2 = $.sibling(node_13, 2);
											var node_31 = $.child(div_2);

											Button(node_31, {
												type: 'submit',
												class: 'w-full',
												get disabled() {
													return $.get(loading);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_23 = $.comment();
													var node_32 = $.first_child(fragment_23);

													{
														var consequent_3 = ($$anchor) => {
															var text_7 = $.text('Resetting Password...');

															$.append($$anchor, text_7);
														};

														var alternate_2 = ($$anchor) => {
															var text_8 = $.text('Reset Password');

															$.append($$anchor, text_8);
														};

														$.if(node_32, ($$render) => {
															if ($.get(loading)) $$render(consequent_3); else $$render(alternate_2, -1);
														});
													}

													$.append($$anchor, fragment_23);
												},
												$$slots: { default: true }
											});

											$.reset(div_2);

											var div_3 = $.sibling(div_2, 2);
											var node_33 = $.child(div_3);

											{
												let $0 = $.derived(() => clientResolver(resolve, "/account/signin"));

												Button(node_33, {
													variant: 'link',
													get href() {
														return $.get($0);
													},
													class: 'text-sm',
													children: ($$anchor, $$slotProps) => {
														var fragment_24 = root_1();
														var node_34 = $.first_child(fragment_24);

														ArrowLeftIcon(node_34, { class: 'mr-1 h-3 w-3' });
														$.next();
														$.append($$anchor, fragment_24);
													},
													$$slots: { default: true }
												});
											}

											$.reset(div_3);
											$.reset(form);
											$.event('submit', form, handleSubmit);
											$.append($$anchor, form);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							};

							$.if(node_2, ($$render) => {
								if ($.get(passwordReset)) $$render(consequent); else $$render(alternate_3, -1);
							});
						}

						$.append($$anchor, fragment_1);
					};

					var alternate_6 = ($$anchor) => {
						var fragment_25 = $.comment();
						var node_35 = $.first_child(fragment_25);

						{
							var consequent_5 = ($$anchor) => {
								var fragment_26 = root_2();
								var node_36 = $.first_child(fragment_26);

								$.component(node_36, () => Card.Header, ($$anchor, Card_Header_2) => {
									Card_Header_2($$anchor, {
										class: 'text-center',
										children: ($$anchor, $$slotProps) => {
											var fragment_27 = root_6();
											var div_4 = $.first_child(fragment_27);
											var node_37 = $.child(div_4);

											MailIcon(node_37, { class: 'h-8 w-8 text-blue-600' });
											$.reset(div_4);

											var node_38 = $.sibling(div_4, 2);

											$.component(node_38, () => Card.Title, ($$anchor, Card_Title_2) => {
												Card_Title_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_9 = $.text('Check Your Email');

														$.append($$anchor, text_9);
													},
													$$slots: { default: true }
												});
											});

											var node_39 = $.sibling(node_38, 2);

											$.component(node_39, () => Card.Description, ($$anchor, Card_Description_2) => {
												Card_Description_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var fragment_28 = root_5();
														var strong = $.sibling($.first_child(fragment_28));
														var text_10 = $.only_child(strong, true);

														$.next();
														$.template_effect(() => $.set_text(text_10, $.get(email)));
														$.append($$anchor, fragment_28);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_27);
										},
										$$slots: { default: true }
									});
								});

								var node_40 = $.sibling(node_36, 2);

								$.component(node_40, () => Card.Content, ($$anchor, Card_Content_2) => {
									Card_Content_2($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_29 = root_7();
											var node_41 = $.sibling($.first_child(fragment_29), 2);

											Button(node_41, {
												variant: 'outline',
												class: 'w-full',
												onclick: () => $.set(emailSent, false),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_11 = $.text('Try Again');

													$.append($$anchor, text_11);
												},
												$$slots: { default: true }
											});

											var div_5 = $.sibling(node_41, 2);
											var node_42 = $.child(div_5);

											{
												let $0 = $.derived(() => clientResolver(resolve, "/account/signin"));

												Button(node_42, {
													variant: 'link',
													get href() {
														return $.get($0);
													},
													class: 'text-sm',
													children: ($$anchor, $$slotProps) => {
														var fragment_30 = root_1();
														var node_43 = $.first_child(fragment_30);

														ArrowLeftIcon(node_43, { class: 'mr-1 h-3 w-3' });
														$.next();
														$.append($$anchor, fragment_30);
													},
													$$slots: { default: true }
												});
											}

											$.reset(div_5);
											$.append($$anchor, fragment_29);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_26);
							};

							var alternate_5 = ($$anchor) => {
								var fragment_31 = root_2();
								var node_44 = $.first_child(fragment_31);

								$.component(node_44, () => Card.Header, ($$anchor, Card_Header_3) => {
									Card_Header_3($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_32 = root_2();
											var node_45 = $.first_child(fragment_32);

											$.component(node_45, () => Card.Title, ($$anchor, Card_Title_3) => {
												Card_Title_3($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_12 = $.text('Forgot Password');

														$.append($$anchor, text_12);
													},
													$$slots: { default: true }
												});
											});

											var node_46 = $.sibling(node_45, 2);

											$.component(node_46, () => Card.Description, ($$anchor, Card_Description_3) => {
												Card_Description_3($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_13 = $.text('Enter your email address and we\'ll send you a link to reset your password.');

														$.append($$anchor, text_13);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_32);
										},
										$$slots: { default: true }
									});
								});

								var node_47 = $.sibling(node_44, 2);

								$.component(node_47, () => Card.Content, ($$anchor, Card_Content_3) => {
									Card_Content_3($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var form_1 = root_4();
											var node_48 = $.child(form_1);

											$.component(node_48, () => Field.Group, ($$anchor, Field_Group_1) => {
												Field_Group_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_33 = $.comment();
														var node_49 = $.first_child(fragment_33);

														$.component(node_49, () => Field.Field, ($$anchor, Field_Field_2) => {
															Field_Field_2($$anchor, {
																class: 'relative flex flex-col gap-1',
																children: ($$anchor, $$slotProps) => {
																	var fragment_34 = root_2();
																	var node_50 = $.first_child(fragment_34);

																	$.component(node_50, () => Field.Label, ($$anchor, Field_Label_2) => {
																		Field_Label_2($$anchor, {
																			for: 'email',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_14 = $.text('Email');

																				$.append($$anchor, text_14);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_51 = $.sibling(node_50, 2);

																	$.component(node_51, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
																		InputGroup_Root_2($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_35 = root_2();
																				var node_52 = $.first_child(fragment_35);

																				$.component(node_52, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_4) => {
																					InputGroup_Addon_4($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							MailIcon($$anchor, {});
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_53 = $.sibling(node_52, 2);

																				$.component(node_53, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
																					InputGroup_Input_2($$anchor, {
																						id: 'email',
																						type: 'email',
																						placeholder: 'you@example.com',
																						required: true,
																						get value() {
																							return $.get(email);
																						},

																						set value($$value) {
																							$.set(email, $$value, true);
																						}
																					});
																				});

																				$.append($$anchor, fragment_35);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_34);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_33);
													},
													$$slots: { default: true }
												});
											});

											var div_6 = $.sibling(node_48, 2);
											var node_54 = $.child(div_6);

											Button(node_54, {
												type: 'submit',
												class: 'w-full',
												get disabled() {
													return $.get(loading);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_37 = $.comment();
													var node_55 = $.first_child(fragment_37);

													{
														var consequent_6 = ($$anchor) => {
															var text_15 = $.text('Sending Reset Link...');

															$.append($$anchor, text_15);
														};

														var alternate_4 = ($$anchor) => {
															var text_16 = $.text('Send Reset Link');

															$.append($$anchor, text_16);
														};

														$.if(node_55, ($$render) => {
															if ($.get(loading)) $$render(consequent_6); else $$render(alternate_4, -1);
														});
													}

													$.append($$anchor, fragment_37);
												},
												$$slots: { default: true }
											});

											$.reset(div_6);

											var div_7 = $.sibling(div_6, 2);
											var node_56 = $.child(div_7);

											{
												let $0 = $.derived(() => clientResolver(resolve, "/account/signin"));

												Button(node_56, {
													variant: 'link',
													get href() {
														return $.get($0);
													},
													class: 'text-sm',
													children: ($$anchor, $$slotProps) => {
														var fragment_38 = root_1();
														var node_57 = $.first_child(fragment_38);

														ArrowLeftIcon(node_57, { class: 'mr-1 h-3 w-3' });
														$.next();
														$.append($$anchor, fragment_38);
													},
													$$slots: { default: true }
												});
											}

											$.reset(div_7);
											$.reset(form_1);
											$.event('submit', form_1, handleSubmit);
											$.append($$anchor, form_1);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_31);
							};

							$.if(node_35, ($$render) => {
								if ($.get(emailSent)) $$render(consequent_5); else $$render(alternate_5, -1);
							});
						}

						$.append($$anchor, fragment_25);
					};

					$.if(node_1, ($$render) => {
						if ($.get(view) === "confirm_token") $$render(consequent_4); else $$render(alternate_6, -1);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
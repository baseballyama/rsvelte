import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100"><!></div> <!> <!>`, 1);
var root_1 = $.from_html(`<!> Go to Sign In`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"><!></div> <!> <!>`, 1);

var root_4 = $.from_html(
	`You've been invited to join as <strong> </strong>. Create a password to activate your account and get
          started.`,
	1
);

var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> Back to Sign In`, 1);
var root_7 = $.from_html(`<form><!> <div class="mt-6"><!></div> <div class="mt-4 text-center"><!></div></form>`);
var root_8 = $.from_html(`<div class="flex min-h-screen items-center justify-center p-4"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const valid = $.derived(() => $$props.data.valid);
	const error = $.derived(() => $$props.data.error);
	const token = $.derived(() => $$props.data.token);
	const email = $.derived(() => $$props.data.email || "");
	const name = $.derived(() => $$props.data.name || "");
	let loading = $.state(false);
	let showPassword = $.state(false);
	let showConfirmPassword = $.state(false);
	let accountActivated = $.state(false);
	let newPassword = $.state("");
	let confirmPassword = $.state("");

	async function handleAcceptInvitation() {
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
			const response = await fetch(clientResolver(resolve, "/account/invitation/api/accept-invitation"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ receivedToken: $.get(token), newPassword: $.get(newPassword) })
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.error || "Failed to set password");

				return;
			}

			$.set(accountActivated, true);
			toast.success("Account activated successfully!");
		} catch(e) {
			toast.error("An error occurred. Please try again.");
		} finally {
			$.set(loading, false);
		}
	}

	function handleSubmit(e) {
		e.preventDefault();
		handleAcceptInvitation();
	}

	var div = root_8();

	$.head('cqvmtp', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Accept Invitation';
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
					var consequent = ($$anchor) => {
						var fragment_1 = root_2();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								class: 'text-center',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root();
									var div_1 = $.first_child(fragment_2);
									var node_3 = $.child(div_1);

									AlertCircleIcon(node_3, { class: 'h-8 w-8 text-red-600' });
									$.reset(div_1);

									var node_4 = $.sibling(div_1, 2);

									$.component(node_4, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Invalid Invitation');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, $.get(error)));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_2, 2);

						$.component(node_6, () => Card.Content, ($$anchor, Card_Content) => {
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
												var node_7 = $.first_child(fragment_5);

												ArrowLeftIcon(node_7, { class: 'mr-2 h-4 w-4' });
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

						$.append($$anchor, fragment_1);
					};

					var consequent_1 = ($$anchor) => {
						var fragment_6 = root_2();
						var node_8 = $.first_child(fragment_6);

						$.component(node_8, () => Card.Header, ($$anchor, Card_Header_1) => {
							Card_Header_1($$anchor, {
								class: 'text-center',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_3();
									var div_2 = $.first_child(fragment_7);
									var node_9 = $.child(div_2);

									CheckCircleIcon(node_9, { class: 'h-8 w-8 text-green-600' });
									$.reset(div_2);

									var node_10 = $.sibling(div_2, 2);

									$.component(node_10, () => Card.Title, ($$anchor, Card_Title_1) => {
										Card_Title_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Account Activated');

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

												var text_3 = $.text('Your account has been set up successfully. You can now sign in with your new password.');

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

						var node_12 = $.sibling(node_8, 2);

						$.component(node_12, () => Card.Content, ($$anchor, Card_Content_1) => {
							Card_Content_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => clientResolver(resolve, "/account/signin"));

										Button($$anchor, {
											get href() {
												return $.get($0);
											},
											class: 'w-full',
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_1();
												var node_13 = $.first_child(fragment_9);

												ArrowLeftIcon(node_13, { class: 'mr-2 h-4 w-4' });
												$.next();
												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									}
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_6);
					};

					var alternate_3 = ($$anchor) => {
						var fragment_10 = root_2();
						var node_14 = $.first_child(fragment_10);

						$.component(node_14, () => Card.Header, ($$anchor, Card_Header_2) => {
							Card_Header_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_2();
									var node_15 = $.first_child(fragment_11);

									$.component(node_15, () => Card.Title, ($$anchor, Card_Title_2) => {
										Card_Title_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text();

												$.template_effect(() => $.set_text(text_4, `Welcome, ${$.get(name) ?? ''}!`));
												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_15, 2);

									$.component(node_16, () => Card.Description, ($$anchor, Card_Description_2) => {
										Card_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_13 = root_4();
												var strong = $.sibling($.first_child(fragment_13));
												var text_5 = $.only_child(strong, true);

												$.next();
												$.template_effect(() => $.set_text(text_5, $.get(email)));
												$.append($$anchor, fragment_13);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});
						});

						var node_17 = $.sibling(node_14, 2);

						$.component(node_17, () => Card.Content, ($$anchor, Card_Content_2) => {
							Card_Content_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var form = root_7();
									var node_18 = $.child(form);

									$.component(node_18, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_14 = root_2();
												var node_19 = $.first_child(fragment_14);

												$.component(node_19, () => Field.Field, ($$anchor, Field_Field) => {
													Field_Field($$anchor, {
														class: 'relative flex flex-col gap-1',
														children: ($$anchor, $$slotProps) => {
															var fragment_15 = root_5();
															var node_20 = $.first_child(fragment_15);

															$.component(node_20, () => Field.Label, ($$anchor, Field_Label) => {
																Field_Label($$anchor, {
																	for: 'newPassword',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('Password');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															});

															var node_21 = $.sibling(node_20, 2);

															$.component(node_21, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
																InputGroup_Root($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_16 = root_5();
																		var node_22 = $.first_child(fragment_16);

																		$.component(node_22, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																			InputGroup_Addon($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					LockIcon($$anchor, {});
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_23 = $.sibling(node_22, 2);

																		{
																			let $0 = $.derived(() => $.get(showPassword) ? "text" : "password");

																			$.component(node_23, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
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

																		var node_24 = $.sibling(node_23, 2);

																		$.component(node_24, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
																			InputGroup_Addon_1($$anchor, {
																				align: 'inline-end',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_18 = $.comment();
																					var node_25 = $.first_child(fragment_18);

																					{
																						let $0 = $.derived(() => $.get(showPassword) ? "Hide password" : "Show password");
																						let $1 = $.derived(() => $.get(showPassword) ? "Hide password" : "Show password");

																						$.component(node_25, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
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
																									var fragment_19 = $.comment();
																									var node_26 = $.first_child(fragment_19);

																									{
																										var consequent_2 = ($$anchor) => {
																											EyeClosedIcon($$anchor, { class: 'size-4' });
																										};

																										var alternate = ($$anchor) => {
																											EyeOpenIcon($$anchor, { class: 'size-4' });
																										};

																										$.if(node_26, ($$render) => {
																											if ($.get(showPassword)) $$render(consequent_2); else $$render(alternate, -1);
																										});
																									}

																									$.append($$anchor, fragment_19);
																								},
																								$$slots: { default: true }
																							});
																						});
																					}

																					$.append($$anchor, fragment_18);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_16);
																	},
																	$$slots: { default: true }
																});
															});

															var node_27 = $.sibling(node_21, 2);

															$.component(node_27, () => Field.Description, ($$anchor, Field_Description) => {
																Field_Description($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('Password must contain at least 8 characters, one uppercase, one lowercase, and one number.');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_15);
														},
														$$slots: { default: true }
													});
												});

												var node_28 = $.sibling(node_19, 2);

												$.component(node_28, () => Field.Field, ($$anchor, Field_Field_1) => {
													Field_Field_1($$anchor, {
														class: 'relative flex flex-col gap-1',
														children: ($$anchor, $$slotProps) => {
															var fragment_22 = root_2();
															var node_29 = $.first_child(fragment_22);

															$.component(node_29, () => Field.Label, ($$anchor, Field_Label_1) => {
																Field_Label_1($$anchor, {
																	for: 'confirmPassword',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text('Confirm Password');

																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															var node_30 = $.sibling(node_29, 2);

															$.component(node_30, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
																InputGroup_Root_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_23 = root_5();
																		var node_31 = $.first_child(fragment_23);

																		$.component(node_31, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
																			InputGroup_Addon_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					LockIcon($$anchor, {});
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_32 = $.sibling(node_31, 2);

																		{
																			let $0 = $.derived(() => $.get(showConfirmPassword) ? "text" : "password");

																			$.component(node_32, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
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

																		var node_33 = $.sibling(node_32, 2);

																		$.component(node_33, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
																			InputGroup_Addon_3($$anchor, {
																				align: 'inline-end',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_25 = $.comment();
																					var node_34 = $.first_child(fragment_25);

																					{
																						let $0 = $.derived(() => $.get(showConfirmPassword) ? "Hide password" : "Show password");
																						let $1 = $.derived(() => $.get(showConfirmPassword) ? "Hide password" : "Show password");

																						$.component(node_34, () => InputGroup.Button, ($$anchor, InputGroup_Button_1) => {
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
																									var fragment_26 = $.comment();
																									var node_35 = $.first_child(fragment_26);

																									{
																										var consequent_3 = ($$anchor) => {
																											EyeClosedIcon($$anchor, { class: 'size-4' });
																										};

																										var alternate_1 = ($$anchor) => {
																											EyeOpenIcon($$anchor, { class: 'size-4' });
																										};

																										$.if(node_35, ($$render) => {
																											if ($.get(showConfirmPassword)) $$render(consequent_3); else $$render(alternate_1, -1);
																										});
																									}

																									$.append($$anchor, fragment_26);
																								},
																								$$slots: { default: true }
																							});
																						});
																					}

																					$.append($$anchor, fragment_25);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_23);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_22);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_14);
											},
											$$slots: { default: true }
										});
									});

									var div_3 = $.sibling(node_18, 2);
									var node_36 = $.child(div_3);

									Button(node_36, {
										type: 'submit',
										class: 'w-full',
										get disabled() {
											return $.get(loading);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_29 = $.comment();
											var node_37 = $.first_child(fragment_29);

											{
												var consequent_4 = ($$anchor) => {
													var text_9 = $.text('Activating Account...');

													$.append($$anchor, text_9);
												};

												var alternate_2 = ($$anchor) => {
													var text_10 = $.text('Activate Account');

													$.append($$anchor, text_10);
												};

												$.if(node_37, ($$render) => {
													if ($.get(loading)) $$render(consequent_4); else $$render(alternate_2, -1);
												});
											}

											$.append($$anchor, fragment_29);
										},
										$$slots: { default: true }
									});

									$.reset(div_3);

									var div_4 = $.sibling(div_3, 2);
									var node_38 = $.child(div_4);

									{
										let $0 = $.derived(() => clientResolver(resolve, "/account/signin"));

										Button(node_38, {
											variant: 'link',
											get href() {
												return $.get($0);
											},
											class: 'text-sm',
											children: ($$anchor, $$slotProps) => {
												var fragment_30 = root_6();
												var node_39 = $.first_child(fragment_30);

												ArrowLeftIcon(node_39, { class: 'mr-1 h-3 w-3' });
												$.next();
												$.append($$anchor, fragment_30);
											},
											$$slots: { default: true }
										});
									}

									$.reset(div_4);
									$.reset(form);
									$.event('submit', form, handleSubmit);
									$.append($$anchor, form);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_10);
					};

					$.if(node_1, ($$render) => {
						if (!$.get(valid)) $$render(consequent); else if ($.get(accountActivated)) $$render(consequent_1, 1); else $$render(alternate_3, -1);
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
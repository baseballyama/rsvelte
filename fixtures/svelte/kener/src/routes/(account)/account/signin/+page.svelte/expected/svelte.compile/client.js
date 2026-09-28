import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p>Please make sure to set the below environment variables:</p> <ul class="list-inside list-disc text-sm"><li>KENER_SECRET_KEY</li> <li>ORIGIN</li> <li>REDIS_URL</li></ul> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`Password <!>`, 1);
var root_4 = $.from_html(`<form method="POST"><!> <!> <div class="mt-6"><!></div></form>`);
var root_5 = $.from_html(`<div class="flex min-h-screen items-center justify-center p-4"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const isAdminAccountCreated = $.derived(() => $$props.data.isAdminAccountCreated);
	const isSetupComplete = $.derived(() => $$props.data.isSetupComplete);
	const authActionPath = $.derived(() => !$.get(isAdminAccountCreated) ? "?/signup" : "?/login");
	const emailValue = $.derived(() => $$props.form?.values?.email ?? "");
	const nameValue = $.derived(() => $$props.form?.values && "name" in $$props.form.values ? $$props.form.values.name : "");
	let loading = $.state(false);
	let showPassword = $.state(false);
	let password = $.state("");
	var div = root_5();

	$.head('1kbfwq6', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = !$.get(isAdminAccountCreated) ? "Create Admin Account" : "Sign In";
		});
	});

	var node = $.child(div);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'kener-card w-full max-w-md',
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, !$.get(isAdminAccountCreated) ? "Create Admin Account" : "Sign In"));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, !$.get(isAdminAccountCreated)
											? "Set up your admin account to get started"
											: "Enter your credentials to access the dashboard"));

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							{
								var consequent = ($$anchor) => {
									var fragment_5 = $.comment();
									var node_6 = $.first_child(fragment_5);

									$.component(node_6, () => Alert.Root, ($$anchor, Alert_Root) => {
										Alert_Root($$anchor, {
											variant: 'destructive',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_2();
												var node_7 = $.first_child(fragment_6);

												AlertCircleIcon(node_7, {});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => Alert.Title, ($$anchor, Alert_Title) => {
													Alert_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Set up not completed.');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Alert.Description, ($$anchor, Alert_Description) => {
													Alert_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_1();
															var node_10 = $.sibling($.first_child(fragment_7), 4);

															Button(node_10, {
																variant: 'link',
																size: 'sm',
																class: 'text-destructive w-full justify-start underline',
																href: 'https://kener.ing/docs/v4/setup/environment-variables',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text('Go to docs');

																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								};

								var alternate_2 = ($$anchor) => {
									var form_1 = root_4();
									var node_11 = $.child(form_1);

									{
										var consequent_1 = ($$anchor) => {
											var fragment_8 = $.comment();
											var node_12 = $.first_child(fragment_8);

											$.component(node_12, () => Alert.Root, ($$anchor, Alert_Root_1) => {
												Alert_Root_1($$anchor, {
													variant: 'destructive',
													class: 'mb-4',
													children: ($$anchor, $$slotProps) => {
														var fragment_9 = root_2();
														var node_13 = $.first_child(fragment_9);

														AlertCircleIcon(node_13, {});

														var node_14 = $.sibling(node_13, 2);

														$.component(node_14, () => Alert.Title, ($$anchor, Alert_Title_1) => {
															Alert_Title_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text();

																	$.template_effect(() => $.set_text(text_4, !$.get(isAdminAccountCreated) ? "Signup failed" : "Login failed"));
																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});
														});

														var node_15 = $.sibling(node_14, 2);

														$.component(node_15, () => Alert.Description, ($$anchor, Alert_Description_1) => {
															Alert_Description_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_5 = $.text();

																	$.template_effect(() => $.set_text(text_5, $$props.form.error));
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

											$.append($$anchor, fragment_8);
										};

										$.if(node_11, ($$render) => {
											if ($$props.form?.error) $$render(consequent_1);
										});
									}

									var node_16 = $.sibling(node_11, 2);

									$.component(node_16, () => Field.Group, ($$anchor, Field_Group) => {
										Field_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_12 = root_2();
												var node_17 = $.first_child(fragment_12);

												{
													var consequent_2 = ($$anchor) => {
														var fragment_13 = $.comment();
														var node_18 = $.first_child(fragment_13);

														$.component(node_18, () => Field.Field, ($$anchor, Field_Field) => {
															Field_Field($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_14 = root();
																	var node_19 = $.first_child(fragment_14);

																	$.component(node_19, () => Field.Label, ($$anchor, Field_Label) => {
																		Field_Label($$anchor, {
																			for: 'name',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_6 = $.text('Name');

																				$.append($$anchor, text_6);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_20 = $.sibling(node_19, 2);

																	$.component(node_20, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
																		InputGroup_Root($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_15 = root();
																				var node_21 = $.first_child(fragment_15);

																				$.component(node_21, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
																					InputGroup_Addon($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							UserIcon($$anchor, {});
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_22 = $.sibling(node_21, 2);

																				$.component(node_22, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
																					InputGroup_Input($$anchor, {
																						id: 'name',
																						name: 'name',
																						type: 'text',
																						placeholder: 'Your name',
																						get value() {
																							return $.get(nameValue);
																						},
																						required: true
																					});
																				});

																				$.append($$anchor, fragment_15);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_14);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_13);
													};

													$.if(node_17, ($$render) => {
														if (!$.get(isAdminAccountCreated)) $$render(consequent_2);
													});
												}

												var node_23 = $.sibling(node_17, 2);

												$.component(node_23, () => Field.Field, ($$anchor, Field_Field_1) => {
													Field_Field_1($$anchor, {
														class: 'relative flex flex-col gap-1',
														children: ($$anchor, $$slotProps) => {
															var fragment_17 = root();
															var node_24 = $.first_child(fragment_17);

															$.component(node_24, () => Field.Label, ($$anchor, Field_Label_1) => {
																Field_Label_1($$anchor, {
																	for: 'email',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('Email');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_25 = $.sibling(node_24, 2);

															$.component(node_25, () => InputGroup.Root, ($$anchor, InputGroup_Root_1) => {
																InputGroup_Root_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_18 = root();
																		var node_26 = $.first_child(fragment_18);

																		$.component(node_26, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
																			InputGroup_Addon_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					MailIcon($$anchor, {});
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_27 = $.sibling(node_26, 2);

																		$.component(node_27, () => InputGroup.Input, ($$anchor, InputGroup_Input_1) => {
																			InputGroup_Input_1($$anchor, {
																				id: 'email',
																				name: 'email',
																				type: 'email',
																				placeholder: 'you@example.com',
																				get value() {
																					return $.get(emailValue);
																				},
																				required: true
																			});
																		});

																		$.append($$anchor, fragment_18);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_17);
														},
														$$slots: { default: true }
													});
												});

												var node_28 = $.sibling(node_23, 2);

												$.component(node_28, () => Field.Field, ($$anchor, Field_Field_2) => {
													Field_Field_2($$anchor, {
														class: 'relative flex flex-col gap-1',
														children: ($$anchor, $$slotProps) => {
															var fragment_20 = root_2();
															var node_29 = $.first_child(fragment_20);

															$.component(node_29, () => Field.Label, ($$anchor, Field_Label_2) => {
																Field_Label_2($$anchor, {
																	for: 'password',
																	class: 'relative',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var fragment_21 = root_3();
																		var node_30 = $.sibling($.first_child(fragment_21));

																		Button(node_30, {
																			variant: 'link',
																			size: 'sm',
																			class: 'text-muted-foreground absolute top-0 right-0 h-auto p-0 text-xs',
																			href: '/account/forgot',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_8 = $.text('Forgot?');

																				$.append($$anchor, text_8);
																			},
																			$$slots: { default: true }
																		});

																		$.append($$anchor, fragment_21);
																	},
																	$$slots: { default: true }
																});
															});

															var node_31 = $.sibling(node_29, 2);

															$.component(node_31, () => InputGroup.Root, ($$anchor, InputGroup_Root_2) => {
																InputGroup_Root_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_22 = root_2();
																		var node_32 = $.first_child(fragment_22);

																		$.component(node_32, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_2) => {
																			InputGroup_Addon_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					LockIcon($$anchor, {});
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_33 = $.sibling(node_32, 2);

																		{
																			let $0 = $.derived(() => $.get(showPassword) ? "text" : "password");

																			$.component(node_33, () => InputGroup.Input, ($$anchor, InputGroup_Input_2) => {
																				InputGroup_Input_2($$anchor, {
																					id: 'password',
																					name: 'password',
																					get type() {
																						return $.get($0);
																					},
																					placeholder: '••••••••',
																					required: true,
																					get value() {
																						return $.get(password);
																					},

																					set value($$value) {
																						$.set(password, $$value, true);
																					}
																				});
																			});
																		}

																		var node_34 = $.sibling(node_33, 2);

																		$.component(node_34, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_3) => {
																			InputGroup_Addon_3($$anchor, {
																				align: 'inline-end',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_24 = $.comment();
																					var node_35 = $.first_child(fragment_24);

																					{
																						let $0 = $.derived(() => $.get(showPassword) ? "Hide password" : "Show password");
																						let $1 = $.derived(() => $.get(showPassword) ? "Hide password" : "Show password");

																						$.component(node_35, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
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
																									var fragment_25 = $.comment();
																									var node_36 = $.first_child(fragment_25);

																									{
																										var consequent_3 = ($$anchor) => {
																											EyeClosedIcon($$anchor, { class: 'size-4' });
																										};

																										var alternate = ($$anchor) => {
																											EyeOpenIcon($$anchor, { class: 'size-4' });
																										};

																										$.if(node_36, ($$render) => {
																											if ($.get(showPassword)) $$render(consequent_3); else $$render(alternate, -1);
																										});
																									}

																									$.append($$anchor, fragment_25);
																								},
																								$$slots: { default: true }
																							});
																						});
																					}

																					$.append($$anchor, fragment_24);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_22);
																	},
																	$$slots: { default: true }
																});
															});

															var node_37 = $.sibling(node_31, 2);

															{
																var consequent_4 = ($$anchor) => {
																	var fragment_28 = $.comment();
																	var node_38 = $.first_child(fragment_28);

																	$.component(node_38, () => Field.Description, ($$anchor, Field_Description) => {
																		Field_Description($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_9 = $.text('Password must contain at least 8 characters, one uppercase, one lowercase, and one number.');

																				$.append($$anchor, text_9);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_28);
																};

																$.if(node_37, ($$render) => {
																	if (!$.get(isAdminAccountCreated)) $$render(consequent_4);
																});
															}

															$.append($$anchor, fragment_20);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_12);
											},
											$$slots: { default: true }
										});
									});

									var div_1 = $.sibling(node_16, 2);
									var node_39 = $.child(div_1);

									Button(node_39, {
										type: 'submit',
										class: 'w-full',
										get disabled() {
											return $.get(loading);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_29 = $.comment();
											var node_40 = $.first_child(fragment_29);

											{
												var consequent_5 = ($$anchor) => {
													var text_10 = $.text();

													$.template_effect(() => $.set_text(text_10, !$.get(isAdminAccountCreated) ? "Creating Account..." : "Signing In..."));
													$.append($$anchor, text_10);
												};

												var alternate_1 = ($$anchor) => {
													var text_11 = $.text();

													$.template_effect(() => $.set_text(text_11, !$.get(isAdminAccountCreated) ? "Create Account" : "Sign In"));
													$.append($$anchor, text_11);
												};

												$.if(node_40, ($$render) => {
													if ($.get(loading)) $$render(consequent_5); else $$render(alternate_1, -1);
												});
											}

											$.append($$anchor, fragment_29);
										},
										$$slots: { default: true }
									});

									$.reset(div_1);
									$.reset(form_1);
									$.template_effect(() => $.set_attribute(form_1, 'action', $.get(authActionPath)));

									$.event('submit', form_1, () => {
										$.set(loading, true);
									});

									$.append($$anchor, form_1);
								};

								$.if(node_5, ($$render) => {
									if (!$.get(isSetupComplete)) $$render(consequent); else $$render(alternate_2, -1);
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CreditCardIcon from "@lucide/svelte/icons/credit-card";
import DotsVerticalIcon from "@lucide/svelte/icons/ellipsis-vertical";
import LogoutIcon from "@lucide/svelte/icons/log-out";
import NotificationIcon from "@lucide/svelte/icons/bell";
import UserCircleIcon from "@lucide/svelte/icons/user-circle";
import CheckIcon from "@lucide/svelte/icons/check";
import LoaderIcon from "@lucide/svelte/icons/loader";
import * as Avatar from "$lib/components/ui/avatar/index.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { page } from "$app/state";
import { resolve } from "$app/paths";
import { toggleMode, mode } from "mode-watcher";
import Sun from "@lucide/svelte/icons/sun";
import Moon from "@lucide/svelte/icons/moon";
import clientResolver from "$lib/client/resolver.js";

var root = $.from_html(`<!> <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium"> </span> <span class="text-muted-foreground truncate text-xs"> </span></div> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm"><!> <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium"> </span> <span class="text-muted-foreground truncate text-xs"> </span></div></div>`);
var root_2 = $.from_html(`<!> Account`, 1);
var root_3 = $.from_html(`<!> <!> <span class="pl-6"> </span>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<!> Log out`, 1);
var root_6 = $.from_html(`<form method="POST" class="w-full"><!></form>`);
var root_7 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<span>Account Settings</span>`);
var root_9 = $.from_html(`<span>Manage your profile information.</span> <div class="flex items-center justify-between"><span class="text-foreground rounded-sm font-medium"> </span> <span class="text-foreground rounded-sm font-medium uppercase"> </span></div>`, 1);
var root_10 = $.from_html(`<p class="text-destructive text-sm"> </p>`);
var root_11 = $.from_html(`<!> Updating...`, 1);
var root_12 = $.from_html(`<!> Updated!`, 1);
var root_13 = $.from_html(`<!> <div class="flex flex-col gap-6 py-4"><form class="flex flex-col gap-3"><!> <div class="flex gap-2"><!> <!></div> <!></form> <hr/> <form class="flex flex-col gap-3"><!> <!> <!> <div class="text-muted-foreground text-xs"><p class="mb-1 font-medium">Password requirements:</p> <ul class="grid grid-cols-2 gap-1"><li><!> One digit</li> <li><!> One lowercase</li> <li><!> One uppercase</li> <li><!> 8+ characters</li> <li><!> Passwords match</li></ul></div> <!> <!></form></div>`, 1);

export default function Nav_user($$anchor, $$props) {
	$.push($$props, true);

	let user = $.proxy(page.data.userDb);
	let nameAbbr = $.derived(() => user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase());
	const sidebar = Sidebar.useSidebar();

	// Account dialog state
	let accountDialogOpen = $.state(false);

	let myName = $.state($.proxy(user.name));
	let myPassword = $.state("");
	let plainPassword = $.state("");
	let savingName = $.state(false);
	let resettingPass = $.state(false);
	let nameError = $.state("");
	let passwordError = $.state("");
	let nameSuccess = $.state(false);
	let passwordSuccess = $.state(false);

	// Password validation
	let hasDigit = $.derived(() => (/\d/).test($.get(myPassword)));

	let hasLowercase = $.derived(() => (/[a-z]/).test($.get(myPassword)));
	let hasUppercase = $.derived(() => (/[A-Z]/).test($.get(myPassword)));
	let hasLetter = $.derived(() => (/[a-zA-Z]/).test($.get(myPassword)));
	let hasMinLength = $.derived(() => $.get(myPassword).length >= 8);
	let passwordsMatch = $.derived(() => $.get(myPassword) === $.get(plainPassword) && $.get(myPassword) !== "");
	let isPasswordValid = $.derived(() => $.get(hasDigit) && $.get(hasLowercase) && $.get(hasUppercase) && $.get(hasLetter) && $.get(hasMinLength) && $.get(passwordsMatch));

	// Role badge styling
	let roleBadgeClass = $.derived(() => {
		if (user.role_ids.includes("admin")) {
			return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300";
		} else if (user.role_ids.includes("editor")) {
			return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
		} else if (user.role_ids.includes("member")) {
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
		} else {
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
		}
	});

	async function saveName() {
		$.set(savingName, true);
		$.set(nameError, "");
		$.set(nameSuccess, false);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "updateUser",
					data: { updateValue: $.get(myName), updateKey: "name" }
				})
			});

			const resp = await response.json();

			if (resp.error) {
				$.set(nameError, resp.error, true);
			} else {
				user.name = $.get(myName);
				$.set(nameSuccess, true);
				setTimeout(() => $.set(nameSuccess, false), 2000);
			}
		} catch {
			$.set(nameError, "Error while saving name");
		} finally {
			$.set(savingName, false);
		}
	}

	async function updatePassword() {
		$.set(resettingPass, true);
		$.set(passwordError, "");
		$.set(passwordSuccess, false);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "updatePassword",
					data: {
						newPassword: $.get(myPassword),
						newPlainPassword: $.get(plainPassword)
					}
				})
			});

			const resp = await response.json();

			if (resp.error) {
				$.set(passwordError, resp.error, true);
			} else {
				$.set(myPassword, "");
				$.set(plainPassword, "");
				$.set(passwordSuccess, true);
				setTimeout(() => $.set(passwordSuccess, false), 2000);
			}
		} catch {
			$.set(passwordError, "Error while updating password");
		} finally {
			$.set(resettingPass, false);
		}
	}

	function openAccountDialog() {
		$.set(myName, user.name, true);
		$.set(myPassword, "");
		$.set(plainPassword, "");
		$.set(nameError, "");
		$.set(passwordError, "");
		$.set(nameSuccess, false);
		$.set(passwordSuccess, false);
		$.set(accountDialogOpen, true);
	}

	var fragment = root_4();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
		Sidebar_Menu($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
					Sidebar_MenuItem($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
								DropdownMenu_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_4();
										var node_3 = $.first_child(fragment_3);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												$.component(node_4, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
													Sidebar_MenuButton($$anchor, $.spread_props(props, {
														size: 'lg',
														class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_5 = $.first_child(fragment_5);

															$.component(node_5, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																Avatar_Root($$anchor, {
																	class: 'size-8 rounded-lg grayscale',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = $.comment();
																		var node_6 = $.first_child(fragment_6);

																		$.component(node_6, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
																			Avatar_Fallback($$anchor, {
																				class: 'rounded-lg',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text = $.text();

																					$.template_effect(() => $.set_text(text, $.get(nameAbbr)));
																					$.append($$anchor, text);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_6);
																	},
																	$$slots: { default: true }
																});
															});

															var div = $.sibling(node_5, 2);
															var span = $.child(div);
															var text_1 = $.only_child(span, true);
															var span_1 = $.sibling(span, 2);
															var text_2 = $.only_child(span_1, true);

															$.reset(div);

															var node_7 = $.sibling(div, 2);

															DotsVerticalIcon(node_7, { class: 'ms-auto size-4' });

															$.template_effect(() => {
																$.set_text(text_1, $.get(nameAbbr));
																$.set_text(text_2, user.email);
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													}));
												});

												$.append($$anchor, fragment_4);
											};

											$.component(node_3, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
												DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_8 = $.sibling(node_3, 2);

										{
											let $0 = $.derived(() => sidebar.isMobile ? "bottom" : "right");

											$.component(node_8, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
												DropdownMenu_Content($$anchor, {
													class: 'w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg',
													get side() {
														return $.get($0);
													},
													align: 'end',
													sideOffset: 4,
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root_7();
														var node_9 = $.first_child(fragment_8);

														$.component(node_9, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
															DropdownMenu_Label($$anchor, {
																class: 'p-0 font-normal',
																children: ($$anchor, $$slotProps) => {
																	var div_1 = root_1();
																	var node_10 = $.child(div_1);

																	$.component(node_10, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
																		Avatar_Root_1($$anchor, {
																			class: 'size-8 rounded-lg',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_9 = $.comment();
																				var node_11 = $.first_child(fragment_9);

																				$.component(node_11, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
																					Avatar_Fallback_1($$anchor, {
																						class: 'rounded-lg',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_3 = $.text();

																							$.template_effect(() => $.set_text(text_3, $.get(nameAbbr)));
																							$.append($$anchor, text_3);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_9);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var div_2 = $.sibling(node_10, 2);
																	var span_2 = $.child(div_2);
																	var text_4 = $.only_child(span_2, true);
																	var span_3 = $.sibling(span_2, 2);
																	var text_5 = $.only_child(span_3, true);

																	$.reset(div_2);
																	$.reset(div_1);

																	$.template_effect(() => {
																		$.set_text(text_4, user.name);
																		$.set_text(text_5, user.email);
																	});

																	$.append($$anchor, div_1);
																},
																$$slots: { default: true }
															});
														});

														var node_12 = $.sibling(node_9, 2);

														$.component(node_12, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
															DropdownMenu_Separator($$anchor, {});
														});

														var node_13 = $.sibling(node_12, 2);

														$.component(node_13, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
															DropdownMenu_Group($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_11 = root_4();
																	var node_14 = $.first_child(fragment_11);

																	$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																		DropdownMenu_Item($$anchor, {
																			onclick: openAccountDialog,
																			children: ($$anchor, $$slotProps) => {
																				var fragment_12 = root_2();
																				var node_15 = $.first_child(fragment_12);

																				UserCircleIcon(node_15, {});
																				$.next();
																				$.append($$anchor, fragment_12);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_16 = $.sibling(node_14, 2);

																	$.component(node_16, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																		DropdownMenu_Item_1($$anchor, {
																			class: 'relative',
																			get onclick() {
																				return toggleMode;
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_13 = root_3();
																				var node_17 = $.first_child(fragment_13);

																				Sun(node_17, {
																					class: 'absolute left-2  scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90'
																				});

																				var node_18 = $.sibling(node_17, 2);

																				Moon(node_18, {
																					class: 'absolute left-2  scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0'
																				});

																				var span_4 = $.sibling(node_18, 2);
																				var text_6 = $.only_child(span_4, true);

																				$.template_effect(() => $.set_text(text_6, mode.current === "light" ? "Light" : "Dark"));
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

														var node_19 = $.sibling(node_13, 2);

														$.component(node_19, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
															DropdownMenu_Separator_1($$anchor, {});
														});

														var node_20 = $.sibling(node_19, 2);

														{
															const child = ($$anchor, $$arg0) => {
																let props = () => ($$arg0?.()).props;
																var form = root_6();
																var node_21 = $.child(form);

																Button(node_21, $.spread_props(props, {
																	type: 'submit',
																	variant: 'ghost',
																	class: 'w-full justify-start',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_14 = root_5();
																		var node_22 = $.first_child(fragment_14);

																		LogoutIcon(node_22, {});
																		$.next();
																		$.append($$anchor, fragment_14);
																	},
																	$$slots: { default: true }
																}));

																$.reset(form);
																$.template_effect(($0) => $.set_attribute(form, 'action', $0), [() => clientResolver(resolve, "/account/logout")]);
																$.append($$anchor, form);
															};

															$.component(node_20, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																DropdownMenu_Item_2($$anchor, { child, $$slots: { child: true } });
															});
														}

														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_23 = $.sibling(node, 2);

	$.component(node_23, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(accountDialogOpen);
			},

			set open($$value) {
				$.set(accountDialogOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_15 = $.comment();
				var node_24 = $.first_child(fragment_15);

				$.component(node_24, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'max-w-md',
						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root_13();
							var node_25 = $.first_child(fragment_16);

							$.component(node_25, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_17 = root_4();
										var node_26 = $.first_child(fragment_17);

										$.component(node_26, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'flex flex-col  justify-between',
												children: ($$anchor, $$slotProps) => {
													var span_5 = root_8();

													$.append($$anchor, span_5);
												},
												$$slots: { default: true }
											});
										});

										var node_27 = $.sibling(node_26, 2);

										$.component(node_27, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												class: 'flex flex-col gap-2',
												children: ($$anchor, $$slotProps) => {
													var fragment_18 = root_9();
													var div_3 = $.sibling($.first_child(fragment_18), 2);
													var span_6 = $.child(div_3);
													var text_7 = $.only_child(span_6, true);
													var span_7 = $.sibling(span_6, 2);
													var text_8 = $.only_child(span_7, true);

													$.reset(div_3);

													$.template_effect(
														($0) => {
															$.set_text(text_7, user.email);
															$.set_text(text_8, $0);
														},
														[() => user.role_ids.join(", ")]
													);

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

							var div_4 = $.sibling(node_25, 2);
							var form_1 = $.child(div_4);
							var node_28 = $.child(form_1);

							Label(node_28, {
								for: 'account-name',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Name');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							var div_5 = $.sibling(node_28, 2);
							var node_29 = $.child(div_5);

							Input(node_29, {
								id: 'account-name',
								placeholder: 'Your name',
								get disabled() {
									return $.get(savingName);
								},
								class: 'flex-1',
								get value() {
									return $.get(myName);
								},

								set value($$value) {
									$.set(myName, $$value, true);
								}
							});

							var node_30 = $.sibling(node_29, 2);

							{
								let $0 = $.derived(() => $.get(savingName) || !$.get(myName).trim());

								Button(node_30, {
									type: 'submit',
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_19 = $.comment();
										var node_31 = $.first_child(fragment_19);

										{
											var consequent = ($$anchor) => {
												LoaderIcon($$anchor, { class: 'size-4 animate-spin' });
											};

											var consequent_1 = ($$anchor) => {
												CheckIcon($$anchor, { class: 'size-4' });
											};

											var alternate = ($$anchor) => {
												var text_10 = $.text('Save');

												$.append($$anchor, text_10);
											};

											$.if(node_31, ($$render) => {
												if ($.get(savingName)) $$render(consequent); else if ($.get(nameSuccess)) $$render(consequent_1, 1); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_19);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_5);

							var node_32 = $.sibling(div_5, 2);

							{
								var consequent_2 = ($$anchor) => {
									var p = root_10();
									var text_11 = $.only_child(p, true);

									$.template_effect(() => $.set_text(text_11, $.get(nameError)));
									$.append($$anchor, p);
								};

								$.if(node_32, ($$render) => {
									if ($.get(nameError)) $$render(consequent_2);
								});
							}

							$.reset(form_1);

							var form_2 = $.sibling(form_1, 4);
							var node_33 = $.child(form_2);

							Label(node_33, {
								for: 'new-password',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_12 = $.text('Change Password');

									$.append($$anchor, text_12);
								},
								$$slots: { default: true }
							});

							var node_34 = $.sibling(node_33, 2);

							Input(node_34, {
								id: 'new-password',
								type: 'password',
								placeholder: 'New Password',
								get disabled() {
									return $.get(resettingPass);
								},

								get value() {
									return $.get(myPassword);
								},

								set value($$value) {
									$.set(myPassword, $$value, true);
								}
							});

							var node_35 = $.sibling(node_34, 2);

							Input(node_35, {
								id: 'confirm-password',
								type: 'password',
								placeholder: 'Confirm Password',
								get disabled() {
									return $.get(resettingPass);
								},

								get value() {
									return $.get(plainPassword);
								},

								set value($$value) {
									$.set(plainPassword, $$value, true);
								}
							});

							var div_6 = $.sibling(node_35, 2);
							var ul = $.sibling($.child(div_6), 2);
							var li = $.child(ul);
							let classes;
							var node_36 = $.child(li);

							{
								var consequent_3 = ($$anchor) => {
									CheckIcon($$anchor, { class: 'inline size-3' });
								};

								$.if(node_36, ($$render) => {
									if ($.get(hasDigit)) $$render(consequent_3);
								});
							}

							$.next();
							$.reset(li);

							var li_1 = $.sibling(li, 2);
							let classes_1;
							var node_37 = $.child(li_1);

							{
								var consequent_4 = ($$anchor) => {
									CheckIcon($$anchor, { class: 'inline size-3' });
								};

								$.if(node_37, ($$render) => {
									if ($.get(hasLowercase)) $$render(consequent_4);
								});
							}

							$.next();
							$.reset(li_1);

							var li_2 = $.sibling(li_1, 2);
							let classes_2;
							var node_38 = $.child(li_2);

							{
								var consequent_5 = ($$anchor) => {
									CheckIcon($$anchor, { class: 'inline size-3' });
								};

								$.if(node_38, ($$render) => {
									if ($.get(hasUppercase)) $$render(consequent_5);
								});
							}

							$.next();
							$.reset(li_2);

							var li_3 = $.sibling(li_2, 2);
							let classes_3;
							var node_39 = $.child(li_3);

							{
								var consequent_6 = ($$anchor) => {
									CheckIcon($$anchor, { class: 'inline size-3' });
								};

								$.if(node_39, ($$render) => {
									if ($.get(hasMinLength)) $$render(consequent_6);
								});
							}

							$.next();
							$.reset(li_3);

							var li_4 = $.sibling(li_3, 2);
							let classes_4;
							var node_40 = $.child(li_4);

							{
								var consequent_7 = ($$anchor) => {
									CheckIcon($$anchor, { class: 'inline size-3' });
								};

								$.if(node_40, ($$render) => {
									if ($.get(passwordsMatch)) $$render(consequent_7);
								});
							}

							$.next();
							$.reset(li_4);
							$.reset(ul);
							$.reset(div_6);

							var node_41 = $.sibling(div_6, 2);

							{
								let $0 = $.derived(() => $.get(resettingPass) || !$.get(isPasswordValid));

								Button(node_41, {
									type: 'submit',
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_27 = $.comment();
										var node_42 = $.first_child(fragment_27);

										{
											var consequent_8 = ($$anchor) => {
												var fragment_28 = root_11();
												var node_43 = $.first_child(fragment_28);

												LoaderIcon(node_43, { class: 'size-4 animate-spin' });
												$.next();
												$.append($$anchor, fragment_28);
											};

											var consequent_9 = ($$anchor) => {
												var fragment_29 = root_12();
												var node_44 = $.first_child(fragment_29);

												CheckIcon(node_44, { class: 'size-4' });
												$.next();
												$.append($$anchor, fragment_29);
											};

											var alternate_1 = ($$anchor) => {
												var text_13 = $.text('Update Password');

												$.append($$anchor, text_13);
											};

											$.if(node_42, ($$render) => {
												if ($.get(resettingPass)) $$render(consequent_8); else if ($.get(passwordSuccess)) $$render(consequent_9, 1); else $$render(alternate_1, -1);
											});
										}

										$.append($$anchor, fragment_27);
									},
									$$slots: { default: true }
								});
							}

							var node_45 = $.sibling(node_41, 2);

							{
								var consequent_10 = ($$anchor) => {
									var p_1 = root_10();
									var text_14 = $.only_child(p_1, true);

									$.template_effect(() => $.set_text(text_14, $.get(passwordError)));
									$.append($$anchor, p_1);
								};

								$.if(node_45, ($$render) => {
									if ($.get(passwordError)) $$render(consequent_10);
								});
							}

							$.reset(form_2);
							$.reset(div_4);

							$.template_effect(() => {
								classes = $.set_class(li, 1, '', null, classes, { 'text-green-500': $.get(hasDigit) });
								classes_1 = $.set_class(li_1, 1, '', null, classes_1, { 'text-green-500': $.get(hasLowercase) });
								classes_2 = $.set_class(li_2, 1, '', null, classes_2, { 'text-green-500': $.get(hasUppercase) });
								classes_3 = $.set_class(li_3, 1, '', null, classes_3, { 'text-green-500': $.get(hasMinLength) });
								classes_4 = $.set_class(li_4, 1, '', null, classes_4, { 'text-green-500': $.get(passwordsMatch) });
							});

							$.event('submit', form_1, (e) => {
								e.preventDefault();
								saveName();
							});

							$.event('submit', form_2, (e) => {
								e.preventDefault();
								updatePassword();
							});

							$.append($$anchor, fragment_16);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_15);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}
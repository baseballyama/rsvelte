import * as $ from 'svelte/internal/server';
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

export default function Nav_user($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let user = page.data.userDb;
		let nameAbbr = $.derived(() => user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase());
		const sidebar = Sidebar.useSidebar();

		// Account dialog state
		let accountDialogOpen = false;

		let myName = user.name;
		let myPassword = "";
		let plainPassword = "";
		let savingName = false;
		let resettingPass = false;
		let nameError = "";
		let passwordError = "";
		let nameSuccess = false;
		let passwordSuccess = false;

		// Password validation
		let hasDigit = $.derived(() => (/\d/).test(myPassword));

		let hasLowercase = $.derived(() => (/[a-z]/).test(myPassword));
		let hasUppercase = $.derived(() => (/[A-Z]/).test(myPassword));
		let hasLetter = $.derived(() => (/[a-zA-Z]/).test(myPassword));
		let hasMinLength = $.derived(() => myPassword.length >= 8);
		let passwordsMatch = $.derived(() => myPassword === plainPassword && myPassword !== "");
		let isPasswordValid = $.derived(() => hasDigit() && hasLowercase() && hasUppercase() && hasLetter() && hasMinLength() && passwordsMatch());

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
			savingName = true;
			nameError = "";
			nameSuccess = false;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "updateUser",
						data: { updateValue: myName, updateKey: "name" }
					})
				});

				const resp = await response.json();

				if (resp.error) {
					nameError = resp.error;
				} else {
					user.name = myName;
					nameSuccess = true;
					setTimeout(() => nameSuccess = false, 2000);
				}
			} catch {
				nameError = "Error while saving name";
			} finally {
				savingName = false;
			}
		}

		async function updatePassword() {
			resettingPass = true;
			passwordError = "";
			passwordSuccess = false;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "updatePassword",
						data: { newPassword: myPassword, newPlainPassword: plainPassword }
					})
				});

				const resp = await response.json();

				if (resp.error) {
					passwordError = resp.error;
				} else {
					myPassword = "";
					plainPassword = "";
					passwordSuccess = true;
					setTimeout(() => passwordSuccess = false, 2000);
				}
			} catch {
				passwordError = "Error while updating password";
			} finally {
				resettingPass = false;
			}
		}

		function openAccountDialog() {
			myName = user.name;
			myPassword = "";
			plainPassword = "";
			nameError = "";
			passwordError = "";
			nameSuccess = false;
			passwordSuccess = false;
			accountDialogOpen = true;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Sidebar.Menu) {
				$$renderer.push('<!--[-->');

				Sidebar.Menu($$renderer, {
					children: ($$renderer) => {
						if (Sidebar.MenuItem) {
							$$renderer.push('<!--[-->');

							Sidebar.MenuItem($$renderer, {
								children: ($$renderer) => {
									if (DropdownMenu.Root) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Root($$renderer, {
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														if (Sidebar.MenuButton) {
															$$renderer.push('<!--[-->');

															Sidebar.MenuButton($$renderer, $.spread_props([
																props,
																{
																	size: 'lg',
																	class: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
																	children: ($$renderer) => {
																		if (Avatar.Root) {
																			$$renderer.push('<!--[-->');

																			Avatar.Root($$renderer, {
																				class: 'size-8 rounded-lg grayscale',
																				children: ($$renderer) => {
																					if (Avatar.Fallback) {
																						$$renderer.push('<!--[-->');

																						Avatar.Fallback($$renderer, {
																							class: 'rounded-lg',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(nameAbbr())}`);
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

																		$$renderer.push(` <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium">${$.escape(nameAbbr())}</span> <span class="text-muted-foreground truncate text-xs">${$.escape(user.email)}</span></div> `);
																		DotsVerticalIcon($$renderer, { class: 'ms-auto size-4' });
																		$$renderer.push(`<!---->`);
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

													if (DropdownMenu.Trigger) {
														$$renderer.push('<!--[-->');
														DropdownMenu.Trigger($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												if (DropdownMenu.Content) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Content($$renderer, {
														class: 'w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg',
														side: sidebar.isMobile ? "bottom" : "right",
														align: 'end',
														sideOffset: 4,
														children: ($$renderer) => {
															if (DropdownMenu.Label) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Label($$renderer, {
																	class: 'p-0 font-normal',
																	children: ($$renderer) => {
																		$$renderer.push(`<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">`);

																		if (Avatar.Root) {
																			$$renderer.push('<!--[-->');

																			Avatar.Root($$renderer, {
																				class: 'size-8 rounded-lg',
																				children: ($$renderer) => {
																					if (Avatar.Fallback) {
																						$$renderer.push('<!--[-->');

																						Avatar.Fallback($$renderer, {
																							class: 'rounded-lg',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(nameAbbr())}`);
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

																		$$renderer.push(` <div class="grid flex-1 text-start text-sm leading-tight"><span class="truncate font-medium">${$.escape(user.name)}</span> <span class="text-muted-foreground truncate text-xs">${$.escape(user.email)}</span></div></div>`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (DropdownMenu.Separator) {
																$$renderer.push('<!--[-->');
																DropdownMenu.Separator($$renderer, {});
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (DropdownMenu.Group) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Group($$renderer, {
																	children: ($$renderer) => {
																		if (DropdownMenu.Item) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.Item($$renderer, {
																				onclick: openAccountDialog,
																				children: ($$renderer) => {
																					UserCircleIcon($$renderer, {});
																					$$renderer.push(`<!----> Account`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (DropdownMenu.Item) {
																			$$renderer.push('<!--[-->');

																			DropdownMenu.Item($$renderer, {
																				class: 'relative',
																				onclick: toggleMode,
																				children: ($$renderer) => {
																					Sun($$renderer, {
																						class: 'absolute left-2  scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90'
																					});

																					$$renderer.push(`<!----> `);

																					Moon($$renderer, {
																						class: 'absolute left-2  scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0'
																					});

																					$$renderer.push(`<!----> <span class="pl-6">${$.escape(mode.current === "light" ? "Light" : "Dark")}</span>`);
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

															if (DropdownMenu.Separator) {
																$$renderer.push('<!--[-->');
																DropdownMenu.Separator($$renderer, {});
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															{
																function child($$renderer, { props }) {
																	$$renderer.push(`<form method="POST"${$.attr('action', clientResolver(resolve, "/account/logout"))} class="w-full">`);

																	Button($$renderer, $.spread_props([
																		props,
																		{
																			type: 'submit',
																			variant: 'ghost',
																			class: 'w-full justify-start',
																			children: ($$renderer) => {
																				LogoutIcon($$renderer, {});
																				$$renderer.push(`<!----> Log out`);
																			},
																			$$slots: { default: true }
																		}
																	]));

																	$$renderer.push(`<!----></form>`);
																}

																if (DropdownMenu.Item) {
																	$$renderer.push('<!--[-->');
																	DropdownMenu.Item($$renderer, { child, $$slots: { child: true } });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
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

			$$renderer.push(` `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return accountDialogOpen;
					},

					set open($$value) {
						accountDialogOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'max-w-md',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														class: 'flex flex-col  justify-between',
														children: ($$renderer) => {
															$$renderer.push(`<span>Account Settings</span>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														class: 'flex flex-col gap-2',
														children: ($$renderer) => {
															$$renderer.push(`<span>Manage your profile information.</span> <div class="flex items-center justify-between"><span class="text-foreground rounded-sm font-medium">${$.escape(user.email)}</span> <span class="text-foreground rounded-sm font-medium uppercase">${$.escape(user.role_ids.join(", "))}</span></div>`);
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

									$$renderer.push(` <div class="flex flex-col gap-6 py-4"><form class="flex flex-col gap-3">`);

									Label($$renderer, {
										for: 'account-name',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Name`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="flex gap-2">`);

									Input($$renderer, {
										id: 'account-name',
										placeholder: 'Your name',
										disabled: savingName,
										class: 'flex-1',
										get value() {
											return myName;
										},

										set value($$value) {
											myName = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									Button($$renderer, {
										type: 'submit',
										disabled: savingName || !myName.trim(),
										children: ($$renderer) => {
											if (savingName) {
												$$renderer.push('<!--[0-->');
												LoaderIcon($$renderer, { class: 'size-4 animate-spin' });
											} else if (nameSuccess) {
												$$renderer.push('<!--[1-->');
												CheckIcon($$renderer, { class: 'size-4' });
											} else {
												$$renderer.push(`<!--[-1-->Save`);
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div> `);

									if (nameError) {
										$$renderer.push(`<!--[0--><p class="text-destructive text-sm">${$.escape(nameError)}</p>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></form> <hr/> <form class="flex flex-col gap-3">`);

									Label($$renderer, {
										for: 'new-password',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Change Password`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'new-password',
										type: 'password',
										placeholder: 'New Password',
										disabled: resettingPass,
										get value() {
											return myPassword;
										},

										set value($$value) {
											myPassword = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'confirm-password',
										type: 'password',
										placeholder: 'Confirm Password',
										disabled: resettingPass,
										get value() {
											return plainPassword;
										},

										set value($$value) {
											plainPassword = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> <div class="text-muted-foreground text-xs"><p class="mb-1 font-medium">Password requirements:</p> <ul class="grid grid-cols-2 gap-1"><li${$.attr_class('', void 0, { 'text-green-500': hasDigit() })}>`);

									if (hasDigit()) {
										$$renderer.push('<!--[0-->');
										CheckIcon($$renderer, { class: 'inline size-3' });
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> One digit</li> <li${$.attr_class('', void 0, { 'text-green-500': hasLowercase() })}>`);

									if (hasLowercase()) {
										$$renderer.push('<!--[0-->');
										CheckIcon($$renderer, { class: 'inline size-3' });
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> One lowercase</li> <li${$.attr_class('', void 0, { 'text-green-500': hasUppercase() })}>`);

									if (hasUppercase()) {
										$$renderer.push('<!--[0-->');
										CheckIcon($$renderer, { class: 'inline size-3' });
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> One uppercase</li> <li${$.attr_class('', void 0, { 'text-green-500': hasMinLength() })}>`);

									if (hasMinLength()) {
										$$renderer.push('<!--[0-->');
										CheckIcon($$renderer, { class: 'inline size-3' });
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> 8+ characters</li> <li${$.attr_class('', void 0, { 'text-green-500': passwordsMatch() })}>`);

									if (passwordsMatch()) {
										$$renderer.push('<!--[0-->');
										CheckIcon($$renderer, { class: 'inline size-3' });
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> Passwords match</li></ul></div> `);

									Button($$renderer, {
										type: 'submit',
										disabled: resettingPass || !isPasswordValid(),
										children: ($$renderer) => {
											if (resettingPass) {
												$$renderer.push('<!--[0-->');
												LoaderIcon($$renderer, { class: 'size-4 animate-spin' });
												$$renderer.push(`<!----> Updating...`);
											} else if (passwordSuccess) {
												$$renderer.push('<!--[1-->');
												CheckIcon($$renderer, { class: 'size-4' });
												$$renderer.push(`<!----> Updated!`);
											} else {
												$$renderer.push(`<!--[-1-->Update Password`);
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									if (passwordError) {
										$$renderer.push(`<!--[0--><p class="text-destructive text-sm">${$.escape(passwordError)}</p>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></form></div>`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
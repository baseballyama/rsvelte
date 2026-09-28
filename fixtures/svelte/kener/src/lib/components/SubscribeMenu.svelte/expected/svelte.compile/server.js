import * as $ from 'svelte/internal/server';
import * as Dialog from "$lib/components/ui/dialog/index.js";
import * as InputOTP from "$lib/components/ui/input-otp/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { onMount } from "svelte";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import Mail from "@lucide/svelte/icons/mail";
import ArrowLeft from "@lucide/svelte/icons/arrow-left";
import LogOut from "@lucide/svelte/icons/log-out";
import Loader2 from "@lucide/svelte/icons/loader-2";
import Bell from "@lucide/svelte/icons/bell";
import AlertTriangle from "@lucide/svelte/icons/alert-triangle";
import Wrench from "@lucide/svelte/icons/wrench";
import { t } from "$lib/stores/i18n";
import trackEvent from "$lib/beacon";
import ICONS from "$lib/icons";

export default function SubscribeMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { compact = false } = $$props;
		let open = false;
		const STORAGE_KEY = "subscriber_token";

		// UI States
		let currentView = "loading";

		let isSubmitting = false;
		let errorMessage = "";

		// Form data
		let email = "";

		let otpValue = "";

		// Preferences data
		let subscriberEmail = "";

		let incidentsEnabled = false;
		let maintenancesEnabled = false;
		let availableSubscriptions = { incidents: false, maintenances: false };

		// Check token on mount
		onMount(() => {
			checkExistingToken();
		});

		// Also check when dialog opens
		async function checkExistingToken() {
			const token = localStorage.getItem(STORAGE_KEY);

			if (!token) {
				currentView = "login";

				return;
			}

			currentView = "loading";

			try {
				const response = await fetch(clientResolver(resolve, "/dashboard-apis/subscription"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getPreferences", token })
				});

				if (!response.ok) {
					// Token invalid or expired
					localStorage.removeItem(STORAGE_KEY);

					currentView = "login";

					return;
				}

				const data = await response.json();

				subscriberEmail = data.email || "";
				incidentsEnabled = data.subscriptions?.incidents || false;
				maintenancesEnabled = data.subscriptions?.maintenances || false;
				availableSubscriptions = data.availableSubscriptions || { incidents: false, maintenances: false };
				currentView = "preferences";
			} catch(err) {
				localStorage.removeItem(STORAGE_KEY);
				currentView = "login";
			}
		}

		async function handleLogin() {
			if (!email.trim()) {
				errorMessage = $.store_get($$store_subs ??= {}, '$t', t)("Please enter a valid email address");

				return;
			}

			isSubmitting = true;
			errorMessage = "";

			try {
				const response = await fetch(clientResolver(resolve, "/dashboard-apis/subscription"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "login", email: email.trim() })
				});

				if (!response.ok) {
					const data = await response.json();

					errorMessage = $.store_get($$store_subs ??= {}, '$t', t)("Failed to send verification code");

					return;
				}

				trackEvent("subscribe_login_sent", { source: "subscribe_menu" });
				currentView = "otp";
				otpValue = "";
			} catch(err) {
				errorMessage = $.store_get($$store_subs ??= {}, '$t', t)("Network error. Please try again.");
			} finally {
				isSubmitting = false;
			}
		}

		async function handleVerifyOTP() {
			if (otpValue.length !== 6) {
				errorMessage = $.store_get($$store_subs ??= {}, '$t', t)("Please enter the 6-digit verification code");

				return;
			}

			isSubmitting = true;
			errorMessage = "";

			try {
				const response = await fetch(clientResolver(resolve, "/dashboard-apis/subscription"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "verify", email: email.trim(), code: otpValue })
				});

				if (!response.ok) {
					const data = await response.json();

					errorMessage = $.store_get($$store_subs ??= {}, '$t', t)("Verification failed");

					return;
				}

				const data = await response.json();

				localStorage.setItem(STORAGE_KEY, data.token);
				trackEvent("subscribe_otp_verified", { source: "subscribe_menu" });
				await checkExistingToken();
			} catch(err) {
				errorMessage = $.store_get($$store_subs ??= {}, '$t', t)("Network error. Please try again.");
			} finally {
				isSubmitting = false;
			}
		}

		async function handlePreferenceChange(type, value) {
			const token = localStorage.getItem(STORAGE_KEY);

			if (!token) {
				currentView = "login";

				return;
			}

			try {
				const response = await fetch(clientResolver(resolve, "/dashboard-apis/subscription"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "updatePreferences", token, [type]: value })
				});

				if (!response.ok) {
					const data = await response.json();

					errorMessage = $.store_get($$store_subs ??= {}, '$t', t)("Failed to update preference");

					// Revert the toggle
					if (type === "incidents") {
						incidentsEnabled = !value;
					} else {
						maintenancesEnabled = !value;
					}

					return;
				}

				// Update local state
				if (type === "incidents") {
					incidentsEnabled = value;
				} else {
					maintenancesEnabled = value;
				}

				trackEvent("subscribe_pref_toggled", { source: "subscribe_menu", type, value });
			} catch(err) {
				errorMessage = $.store_get($$store_subs ??= {}, '$t', t)("Network error. Please try again.");

				// Revert the toggle
				if (type === "incidents") {
					incidentsEnabled = !value;
				} else {
					maintenancesEnabled = !value;
				}
			}
		}

		function handleLogout() {
			localStorage.removeItem(STORAGE_KEY);
			email = "";
			otpValue = "";
			subscriberEmail = "";
			incidentsEnabled = false;
			maintenancesEnabled = false;
			errorMessage = "";
			currentView = "login";
			trackEvent("subscribe_logout", { source: "subscribe_menu" });
		}

		function handleBackToEmail() {
			currentView = "login";
			otpValue = "";
			errorMessage = "";
		}

		function handleClose() {
			open = false;
			errorMessage = "";
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (compact) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					variant: 'outline',
					size: 'icon-sm',
					class: 'bg-background/80 dark:bg-background/70 border-foreground/10 rounded-full border shadow-none backdrop-blur-md',
					'aria-label': $.store_get($$store_subs ??= {}, '$t', t)("Subscribe"),
					onclick: () => {
						open = true;
						trackEvent("subscribe_opened", { source: "theme_plus" });
					},

					children: ($$renderer) => {
						if (ICONS.Bell) {
							$$renderer.push('<!--[-->');
							ICONS.Bell($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');

				Button($$renderer, {
					variant: 'outline',
					size: 'sm',
					class: 'rounded-btn bg-background/80 dark:bg-background/70 border-foreground/10 border text-xs backdrop-blur-md',
					'aria-label': 'Subscribe',
					onclick: () => {
						open = true;
						trackEvent("subscribe_opened", { source: "theme_plus" });
					},

					children: ($$renderer) => {
						if (ICONS.Bell) {
							$$renderer.push('<!--[-->');
							ICONS.Bell($$renderer, { class: '' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Subscribe"))}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--> `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Overlay) {
							$$renderer.push('<!--[-->');
							Dialog.Overlay($$renderer, { class: 'backdrop-blur-[2px]' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'max-w-sm rounded-3xl',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														class: 'flex items-center gap-2',
														children: ($$renderer) => {
															Bell($$renderer, { class: 'h-5 w-5' });
															$$renderer.push(`<!----> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Subscribe to Updates"))}`);
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
														children: ($$renderer) => {
															if (currentView === "login") {
																$$renderer.push(`<!--[0-->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Get notified about incidents and scheduled maintenance."))}`);
															} else if (currentView === "otp") {
																$$renderer.push(`<!--[1-->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Enter the verification code sent to your email."))}`);
															} else if (currentView === "preferences") {
																$$renderer.push(`<!--[2-->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Manage your notification preferences."))}`);
															} else if (currentView === "loading") {
																$$renderer.push(`<!--[3-->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Loading your preferences..."))}`);
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

									$$renderer.push(` <div class="py-4">`);

									if (currentView === "loading") {
										$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-8">`);
										Loader2($$renderer, { class: 'text-muted-foreground h-8 w-8 animate-spin' });
										$$renderer.push(`<!----></div>`);
									} else if (currentView === "login") {
										$$renderer.push(`<!--[1--><div class="flex flex-col gap-4"><div class="flex flex-col gap-2">`);

										Label($$renderer, {
											for: 'email',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Email address"))}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <div class="relative">`);

										Mail($$renderer, {
											class: 'text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2'
										});

										$$renderer.push(`<!----> `);

										Input($$renderer, {
											id: 'email',
											type: 'email',
											placeholder: 'you@example.com',
											class: 'pl-10',
											disabled: isSubmitting,
											onkeydown: (e) => e.key === "Enter" && handleLogin(),
											get value() {
												return email;
											},

											set value($$value) {
												email = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div></div> `);

										if (errorMessage) {
											$$renderer.push(`<!--[0--><p class="text-destructive text-sm">${$.escape(errorMessage)}</p>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										Button($$renderer, {
											onclick: handleLogin,
											disabled: isSubmitting,
											class: 'w-full',
											children: ($$renderer) => {
												if (isSubmitting) {
													$$renderer.push('<!--[0-->');
													Loader2($$renderer, { class: 'mr-2 h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Sending..."))}`);
												} else {
													$$renderer.push(`<!--[-1-->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Continue"))}`);
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									} else if (currentView === "otp") {
										$$renderer.push(`<!--[2--><div class="flex flex-col gap-4"><div class="flex flex-col items-center gap-4"><p class="text-muted-foreground text-center text-sm">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("We sent a 6-digit code to"))} <strong class="text-foreground">${$.escape(email)}</strong></p> `);

										{
											function children($$renderer, { cells }) {
												if (InputOTP.Group) {
													$$renderer.push('<!--[-->');

													InputOTP.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(cells);

															for (let i = 0, $$length = each_array.length; i < $$length; i++) {
																let cell = each_array[i];

																if (InputOTP.Slot) {
																	$$renderer.push('<!--[-->');
																	InputOTP.Slot($$renderer, { cell });
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
											}

											if (InputOTP.Root) {
												$$renderer.push('<!--[-->');

												InputOTP.Root($$renderer, {
													maxlength: 6,
													get value() {
														return otpValue;
													},

													set value($$value) {
														otpValue = $$value;
														$$settled = false;
													},
													children,
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`</div> `);

										if (errorMessage) {
											$$renderer.push(`<!--[0--><p class="text-destructive text-center text-sm">${$.escape(errorMessage)}</p>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> <div class="flex gap-2">`);

										Button($$renderer, {
											variant: 'outline',
											onclick: handleBackToEmail,
											disabled: isSubmitting,
											class: 'flex-1',
											children: ($$renderer) => {
												ArrowLeft($$renderer, { class: 'mr-2 h-4 w-4' });
												$$renderer.push(`<!----> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Back"))}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											onclick: handleVerifyOTP,
											disabled: isSubmitting || otpValue.length !== 6,
											class: 'flex-1',
											children: ($$renderer) => {
												if (isSubmitting) {
													$$renderer.push('<!--[0-->');
													Loader2($$renderer, { class: 'mr-2 h-4 w-4 animate-spin' });
													$$renderer.push(`<!----> ${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Verifying"))}...`);
												} else {
													$$renderer.push(`<!--[-1-->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Verify"))}`);
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div> `);

										Button($$renderer, {
											variant: 'link',
											onclick: handleLogin,
											disabled: isSubmitting,
											class: 'text-xs',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Didn't receive the code? Resend"))}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									} else if (currentView === "preferences") {
										$$renderer.push(`<!--[3--><div class="flex flex-col gap-6"><div class="rounded-lg border p-4"><div class="flex items-center justify-between gap-2"><div class="flex gap-2">`);
										Mail($$renderer, { class: 'text-muted-foreground h-4 w-4' });
										$$renderer.push(`<!----> <span class="text-sm font-medium">${$.escape(subscriberEmail)}</span></div> `);

										Button($$renderer, {
											variant: 'ghost',
											size: 'icon-sm',
											onclick: handleLogout,
											class: 'rounded-btn',
											children: ($$renderer) => {
												LogOut($$renderer, { class: 'h-4 w-4' });
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div></div> <div class="flex flex-col gap-4">`);

										if (availableSubscriptions.incidents) {
											$$renderer.push(`<!--[0--><div class="flex items-center justify-between"><div class="flex items-center gap-3">`);
											AlertTriangle($$renderer, { class: 'h-5 w-5 text-orange-500' });
											$$renderer.push(`<!----> <div>`);

											Label($$renderer, {
												class: 'font-medium',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Incident Updates"))}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Get notified about incidents updates"))}</p></div></div> `);

											Switch($$renderer, {
												checked: incidentsEnabled,
												onCheckedChange: (value) => handlePreferenceChange("incidents", value)
											});

											$$renderer.push(`<!----></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (availableSubscriptions.maintenances) {
											$$renderer.push(`<!--[0--><div class="flex items-center justify-between"><div class="flex items-center gap-3">`);
											Wrench($$renderer, { class: 'h-5 w-5 text-blue-500' });
											$$renderer.push(`<!----> <div>`);

											Label($$renderer, {
												class: 'font-medium',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Maintenance Updates"))}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <p class="text-muted-foreground text-xs">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Get notified about scheduled maintenance"))}</p></div></div> `);

											Switch($$renderer, {
												checked: maintenancesEnabled,
												onCheckedChange: (value) => handlePreferenceChange("maintenances", value)
											});

											$$renderer.push(`<!----></div>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div> `);

										if (errorMessage) {
											$$renderer.push(`<!--[0--><p class="text-destructive text-sm">${$.escape(errorMessage)}</p>`);
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div>`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
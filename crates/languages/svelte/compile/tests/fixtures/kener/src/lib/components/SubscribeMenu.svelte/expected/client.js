import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-center py-8"><!></div>`);
var root_3 = $.from_html(`<p class="text-destructive text-sm"> </p>`);
var root_4 = $.from_html(`<div class="flex flex-col gap-4"><div class="flex flex-col gap-2"><!> <div class="relative"><!> <!></div></div> <!> <!></div>`);
var root_5 = $.from_html(`<p class="text-destructive text-center text-sm"> </p>`);
var root_6 = $.from_html(`<div class="flex flex-col gap-4"><div class="flex flex-col items-center gap-4"><p class="text-muted-foreground text-center text-sm"> <strong class="text-foreground"> </strong></p> <!></div> <!> <div class="flex gap-2"><!> <!></div> <!></div>`);
var root_7 = $.from_html(`<div class="flex items-center justify-between"><div class="flex items-center gap-3"><!> <div><!> <p class="text-muted-foreground text-xs"> </p></div></div> <!></div>`);
var root_8 = $.from_html(`<div class="flex flex-col gap-6"><div class="rounded-lg border p-4"><div class="flex items-center justify-between gap-2"><div class="flex gap-2"><!> <span class="text-sm font-medium"> </span></div> <!></div></div> <div class="flex flex-col gap-4"><!> <!></div> <!></div>`);
var root_9 = $.from_html(`<!> <div class="py-4"><!></div>`, 1);

export default function SubscribeMenu($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let compact = $.prop($$props, 'compact', 3, false);
	let open = $.state(false);
	const STORAGE_KEY = "subscriber_token";

	// UI States
	let currentView = $.state("loading");

	let isSubmitting = $.state(false);
	let errorMessage = $.state("");

	// Form data
	let email = $.state("");

	let otpValue = $.state("");

	// Preferences data
	let subscriberEmail = $.state("");

	let incidentsEnabled = $.state(false);
	let maintenancesEnabled = $.state(false);
	let availableSubscriptions = $.state($.proxy({ incidents: false, maintenances: false }));

	// Check token on mount
	onMount(() => {
		checkExistingToken();
	});

	// Also check when dialog opens
	$.user_effect(() => {
		if ($.get(open)) {
			checkExistingToken();
		}
	});

	async function checkExistingToken() {
		const token = localStorage.getItem(STORAGE_KEY);

		if (!token) {
			$.set(currentView, "login");

			return;
		}

		$.set(currentView, "loading");

		try {
			const response = await fetch(clientResolver(resolve, "/dashboard-apis/subscription"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getPreferences", token })
			});

			if (!response.ok) {
				// Token invalid or expired
				localStorage.removeItem(STORAGE_KEY);

				$.set(currentView, "login");

				return;
			}

			const data = await response.json();

			$.set(subscriberEmail, data.email || "", true);
			$.set(incidentsEnabled, data.subscriptions?.incidents || false, true);
			$.set(maintenancesEnabled, data.subscriptions?.maintenances || false, true);
			$.set(availableSubscriptions, data.availableSubscriptions || { incidents: false, maintenances: false }, true);
			$.set(currentView, "preferences");
		} catch(err) {
			localStorage.removeItem(STORAGE_KEY);
			$.set(currentView, "login");
		}
	}

	async function handleLogin() {
		if (!$.get(email).trim()) {
			$.set(errorMessage, $t()("Please enter a valid email address"), true);

			return;
		}

		$.set(isSubmitting, true);
		$.set(errorMessage, "");

		try {
			const response = await fetch(clientResolver(resolve, "/dashboard-apis/subscription"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "login", email: $.get(email).trim() })
			});

			if (!response.ok) {
				const data = await response.json();

				$.set(errorMessage, $t()("Failed to send verification code"), true);

				return;
			}

			trackEvent("subscribe_login_sent", { source: "subscribe_menu" });
			$.set(currentView, "otp");
			$.set(otpValue, "");
		} catch(err) {
			$.set(errorMessage, $t()("Network error. Please try again."), true);
		} finally {
			$.set(isSubmitting, false);
		}
	}

	async function handleVerifyOTP() {
		if ($.get(otpValue).length !== 6) {
			$.set(errorMessage, $t()("Please enter the 6-digit verification code"), true);

			return;
		}

		$.set(isSubmitting, true);
		$.set(errorMessage, "");

		try {
			const response = await fetch(clientResolver(resolve, "/dashboard-apis/subscription"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "verify",
					email: $.get(email).trim(),
					code: $.get(otpValue)
				})
			});

			if (!response.ok) {
				const data = await response.json();

				$.set(errorMessage, $t()("Verification failed"), true);

				return;
			}

			const data = await response.json();

			localStorage.setItem(STORAGE_KEY, data.token);
			trackEvent("subscribe_otp_verified", { source: "subscribe_menu" });
			await checkExistingToken();
		} catch(err) {
			$.set(errorMessage, $t()("Network error. Please try again."), true);
		} finally {
			$.set(isSubmitting, false);
		}
	}

	async function handlePreferenceChange(type, value) {
		const token = localStorage.getItem(STORAGE_KEY);

		if (!token) {
			$.set(currentView, "login");

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

				$.set(errorMessage, $t()("Failed to update preference"), true);

				// Revert the toggle
				if (type === "incidents") {
					$.set(incidentsEnabled, !value);
				} else {
					$.set(maintenancesEnabled, !value);
				}

				return;
			}

			// Update local state
			if (type === "incidents") {
				$.set(incidentsEnabled, value, true);
			} else {
				$.set(maintenancesEnabled, value, true);
			}

			trackEvent("subscribe_pref_toggled", { source: "subscribe_menu", type, value });
		} catch(err) {
			$.set(errorMessage, $t()("Network error. Please try again."), true);

			// Revert the toggle
			if (type === "incidents") {
				$.set(incidentsEnabled, !value);
			} else {
				$.set(maintenancesEnabled, !value);
			}
		}
	}

	function handleLogout() {
		localStorage.removeItem(STORAGE_KEY);
		$.set(email, "");
		$.set(otpValue, "");
		$.set(subscriberEmail, "");
		$.set(incidentsEnabled, false);
		$.set(maintenancesEnabled, false);
		$.set(errorMessage, "");
		$.set(currentView, "login");
		trackEvent("subscribe_logout", { source: "subscribe_menu" });
	}

	function handleBackToEmail() {
		$.set(currentView, "login");
		$.set(otpValue, "");
		$.set(errorMessage, "");
	}

	function handleClose() {
		$.set(open, false);
		$.set(errorMessage, "");
	}

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => $t()("Subscribe"));

				Button($$anchor, {
					variant: 'outline',
					size: 'icon-sm',
					class: 'bg-background/80 dark:bg-background/70 border-foreground/10 rounded-full border shadow-none backdrop-blur-md',
					get 'aria-label'() {
						return $.get($0);
					},

					onclick: () => {
						$.set(open, true);
						trackEvent("subscribe_opened", { source: "theme_plus" });
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => ICONS.Bell, ($$anchor, ICONS_Bell) => {
							ICONS_Bell($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			}
		};

		var alternate = ($$anchor) => {
			Button($$anchor, {
				variant: 'outline',
				size: 'sm',
				class: 'rounded-btn bg-background/80 dark:bg-background/70 border-foreground/10 border text-xs backdrop-blur-md',
				'aria-label': 'Subscribe',
				onclick: () => {
					$.set(open, true);
					trackEvent("subscribe_opened", { source: "theme_plus" });
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_2 = $.first_child(fragment_4);

					$.component(node_2, () => ICONS.Bell, ($$anchor, ICONS_Bell_1) => {
						ICONS_Bell_1($$anchor, { class: '' });
					});

					var text = $.sibling(node_2);

					$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [() => $t()("Subscribe")]);
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (compact()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_1();
				var node_4 = $.first_child(fragment_5);

				$.component(node_4, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
					Dialog_Overlay($$anchor, { class: 'backdrop-blur-[2px]' });
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'max-w-sm rounded-3xl',
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_9();
							var node_6 = $.first_child(fragment_6);

							$.component(node_6, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_1();
										var node_7 = $.first_child(fragment_7);

										$.component(node_7, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'flex items-center gap-2',
												children: ($$anchor, $$slotProps) => {
													var fragment_8 = root();
													var node_8 = $.first_child(fragment_8);

													Bell(node_8, { class: 'h-5 w-5' });

													var text_1 = $.sibling(node_8);

													$.template_effect(($0) => $.set_text(text_1, ` ${$0 ?? ''}`), [() => $t()("Subscribe to Updates")]);
													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_7, 2);

										$.component(node_9, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = $.comment();
													var node_10 = $.first_child(fragment_9);

													{
														var consequent_1 = ($$anchor) => {
															var text_2 = $.text();

															$.template_effect(($0) => $.set_text(text_2, $0), [
																() => $t()("Get notified about incidents and scheduled maintenance.")
															]);

															$.append($$anchor, text_2);
														};

														var consequent_2 = ($$anchor) => {
															var text_3 = $.text();

															$.template_effect(($0) => $.set_text(text_3, $0), [
																() => $t()("Enter the verification code sent to your email.")
															]);

															$.append($$anchor, text_3);
														};

														var consequent_3 = ($$anchor) => {
															var text_4 = $.text();

															$.template_effect(($0) => $.set_text(text_4, $0), [() => $t()("Manage your notification preferences.")]);
															$.append($$anchor, text_4);
														};

														var consequent_4 = ($$anchor) => {
															var text_5 = $.text();

															$.template_effect(($0) => $.set_text(text_5, $0), [() => $t()("Loading your preferences...")]);
															$.append($$anchor, text_5);
														};

														$.if(node_10, ($$render) => {
															if ($.get(currentView) === "login") $$render(consequent_1); else if ($.get(currentView) === "otp") $$render(consequent_2, 1); else if ($.get(currentView) === "preferences") $$render(consequent_3, 2); else if ($.get(currentView) === "loading") $$render(consequent_4, 3);
														});
													}

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							var div = $.sibling(node_6, 2);
							var node_11 = $.child(div);

							{
								var consequent_5 = ($$anchor) => {
									var div_1 = root_2();
									var node_12 = $.child(div_1);

									Loader2(node_12, { class: 'text-muted-foreground h-8 w-8 animate-spin' });
									$.reset(div_1);
									$.append($$anchor, div_1);
								};

								var consequent_8 = ($$anchor) => {
									var div_2 = root_4();
									var div_3 = $.child(div_2);
									var node_13 = $.child(div_3);

									Label(node_13, {
										for: 'email',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text();

											$.template_effect(($0) => $.set_text(text_6, $0), [() => $t()("Email address")]);
											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});

									var div_4 = $.sibling(node_13, 2);
									var node_14 = $.child(div_4);

									Mail(node_14, {
										class: 'text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2'
									});

									var node_15 = $.sibling(node_14, 2);

									Input(node_15, {
										id: 'email',
										type: 'email',
										placeholder: 'you@example.com',
										class: 'pl-10',
										get disabled() {
											return $.get(isSubmitting);
										},
										onkeydown: (e) => e.key === "Enter" && handleLogin(),
										get value() {
											return $.get(email);
										},

										set value($$value) {
											$.set(email, $$value, true);
										}
									});

									$.reset(div_4);
									$.reset(div_3);

									var node_16 = $.sibling(div_3, 2);

									{
										var consequent_6 = ($$anchor) => {
											var p = root_3();
											var text_7 = $.only_child(p, true);

											$.template_effect(() => $.set_text(text_7, $.get(errorMessage)));
											$.append($$anchor, p);
										};

										$.if(node_16, ($$render) => {
											if ($.get(errorMessage)) $$render(consequent_6);
										});
									}

									var node_17 = $.sibling(node_16, 2);

									Button(node_17, {
										onclick: handleLogin,
										get disabled() {
											return $.get(isSubmitting);
										},
										class: 'w-full',
										children: ($$anchor, $$slotProps) => {
											var fragment_15 = $.comment();
											var node_18 = $.first_child(fragment_15);

											{
												var consequent_7 = ($$anchor) => {
													var fragment_16 = root();
													var node_19 = $.first_child(fragment_16);

													Loader2(node_19, { class: 'mr-2 h-4 w-4 animate-spin' });

													var text_8 = $.sibling(node_19);

													$.template_effect(($0) => $.set_text(text_8, ` ${$0 ?? ''}`), [() => $t()("Sending...")]);
													$.append($$anchor, fragment_16);
												};

												var alternate_1 = ($$anchor) => {
													var text_9 = $.text();

													$.template_effect(($0) => $.set_text(text_9, $0), [() => $t()("Continue")]);
													$.append($$anchor, text_9);
												};

												$.if(node_18, ($$render) => {
													if ($.get(isSubmitting)) $$render(consequent_7); else $$render(alternate_1, -1);
												});
											}

											$.append($$anchor, fragment_15);
										},
										$$slots: { default: true }
									});

									$.reset(div_2);
									$.append($$anchor, div_2);
								};

								var consequent_11 = ($$anchor) => {
									var div_5 = root_6();
									var div_6 = $.child(div_5);
									var p_1 = $.child(div_6);
									var text_10 = $.child(p_1);
									var strong = $.sibling(text_10);
									var text_11 = $.only_child(strong, true);

									$.reset(p_1);

									var node_20 = $.sibling(p_1, 2);

									{
										const children = ($$anchor, $$arg0) => {
											let cells = () => ($$arg0?.()).cells;
											var fragment_18 = $.comment();
											var node_21 = $.first_child(fragment_18);

											$.component(node_21, () => InputOTP.Group, ($$anchor, InputOTP_Group) => {
												InputOTP_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_19 = $.comment();
														var node_22 = $.first_child(fragment_19);

														$.each(node_22, 17, cells, $.index, ($$anchor, cell) => {
															var fragment_20 = $.comment();
															var node_23 = $.first_child(fragment_20);

															$.component(node_23, () => InputOTP.Slot, ($$anchor, InputOTP_Slot) => {
																InputOTP_Slot($$anchor, {
																	get cell() {
																		return $.get(cell);
																	}
																});
															});

															$.append($$anchor, fragment_20);
														});

														$.append($$anchor, fragment_19);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_18);
										};

										$.component(node_20, () => InputOTP.Root, ($$anchor, InputOTP_Root) => {
											InputOTP_Root($$anchor, {
												maxlength: 6,
												get value() {
													return $.get(otpValue);
												},

												set value($$value) {
													$.set(otpValue, $$value, true);
												},
												children,
												$$slots: { default: true }
											});
										});
									}

									$.reset(div_6);

									var node_24 = $.sibling(div_6, 2);

									{
										var consequent_9 = ($$anchor) => {
											var p_2 = root_5();
											var text_12 = $.only_child(p_2, true);

											$.template_effect(() => $.set_text(text_12, $.get(errorMessage)));
											$.append($$anchor, p_2);
										};

										$.if(node_24, ($$render) => {
											if ($.get(errorMessage)) $$render(consequent_9);
										});
									}

									var div_7 = $.sibling(node_24, 2);
									var node_25 = $.child(div_7);

									Button(node_25, {
										variant: 'outline',
										onclick: handleBackToEmail,
										get disabled() {
											return $.get(isSubmitting);
										},
										class: 'flex-1',
										children: ($$anchor, $$slotProps) => {
											var fragment_21 = root();
											var node_26 = $.first_child(fragment_21);

											ArrowLeft(node_26, { class: 'mr-2 h-4 w-4' });

											var text_13 = $.sibling(node_26);

											$.template_effect(($0) => $.set_text(text_13, ` ${$0 ?? ''}`), [() => $t()("Back")]);
											$.append($$anchor, fragment_21);
										},
										$$slots: { default: true }
									});

									var node_27 = $.sibling(node_25, 2);

									{
										let $0 = $.derived(() => $.get(isSubmitting) || $.get(otpValue).length !== 6);

										Button(node_27, {
											onclick: handleVerifyOTP,
											get disabled() {
												return $.get($0);
											},
											class: 'flex-1',
											children: ($$anchor, $$slotProps) => {
												var fragment_22 = $.comment();
												var node_28 = $.first_child(fragment_22);

												{
													var consequent_10 = ($$anchor) => {
														var fragment_23 = root();
														var node_29 = $.first_child(fragment_23);

														Loader2(node_29, { class: 'mr-2 h-4 w-4 animate-spin' });

														var text_14 = $.sibling(node_29);

														$.template_effect(($0) => $.set_text(text_14, ` ${$0 ?? ''}...`), [() => $t()("Verifying")]);
														$.append($$anchor, fragment_23);
													};

													var alternate_2 = ($$anchor) => {
														var text_15 = $.text();

														$.template_effect(($0) => $.set_text(text_15, $0), [() => $t()("Verify")]);
														$.append($$anchor, text_15);
													};

													$.if(node_28, ($$render) => {
														if ($.get(isSubmitting)) $$render(consequent_10); else $$render(alternate_2, -1);
													});
												}

												$.append($$anchor, fragment_22);
											},
											$$slots: { default: true }
										});
									}

									$.reset(div_7);

									var node_30 = $.sibling(div_7, 2);

									Button(node_30, {
										variant: 'link',
										onclick: handleLogin,
										get disabled() {
											return $.get(isSubmitting);
										},
										class: 'text-xs',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_16 = $.text();

											$.template_effect(($0) => $.set_text(text_16, $0), [() => $t()("Didn't receive the code? Resend")]);
											$.append($$anchor, text_16);
										},
										$$slots: { default: true }
									});

									$.reset(div_5);

									$.template_effect(
										($0) => {
											$.set_text(text_10, `${$0 ?? ''} `);
											$.set_text(text_11, $.get(email));
										},
										[() => $t()("We sent a 6-digit code to")]
									);

									$.append($$anchor, div_5);
								};

								var consequent_15 = ($$anchor) => {
									var div_8 = root_8();
									var div_9 = $.child(div_8);
									var div_10 = $.child(div_9);
									var div_11 = $.child(div_10);
									var node_31 = $.child(div_11);

									Mail(node_31, { class: 'text-muted-foreground h-4 w-4' });

									var span = $.sibling(node_31, 2);
									var text_17 = $.only_child(span, true);

									$.reset(div_11);

									var node_32 = $.sibling(div_11, 2);

									Button(node_32, {
										variant: 'ghost',
										size: 'icon-sm',
										onclick: handleLogout,
										class: 'rounded-btn',
										children: ($$anchor, $$slotProps) => {
											LogOut($$anchor, { class: 'h-4 w-4' });
										},
										$$slots: { default: true }
									});

									$.reset(div_10);
									$.reset(div_9);

									var div_12 = $.sibling(div_9, 2);
									var node_33 = $.child(div_12);

									{
										var consequent_12 = ($$anchor) => {
											var div_13 = root_7();
											var div_14 = $.child(div_13);
											var node_34 = $.child(div_14);

											AlertTriangle(node_34, { class: 'h-5 w-5 text-orange-500' });

											var div_15 = $.sibling(node_34, 2);
											var node_35 = $.child(div_15);

											Label(node_35, {
												class: 'font-medium',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_18 = $.text();

													$.template_effect(($0) => $.set_text(text_18, $0), [() => $t()("Incident Updates")]);
													$.append($$anchor, text_18);
												},
												$$slots: { default: true }
											});

											var p_3 = $.sibling(node_35, 2);
											var text_19 = $.only_child(p_3, true);

											$.reset(div_15);
											$.reset(div_14);

											var node_36 = $.sibling(div_14, 2);

											Switch(node_36, {
												get checked() {
													return $.get(incidentsEnabled);
												},
												onCheckedChange: (value) => handlePreferenceChange("incidents", value)
											});

											$.reset(div_13);
											$.template_effect(($0) => $.set_text(text_19, $0), [() => $t()("Get notified about incidents updates")]);
											$.append($$anchor, div_13);
										};

										$.if(node_33, ($$render) => {
											if ($.get(availableSubscriptions).incidents) $$render(consequent_12);
										});
									}

									var node_37 = $.sibling(node_33, 2);

									{
										var consequent_13 = ($$anchor) => {
											var div_16 = root_7();
											var div_17 = $.child(div_16);
											var node_38 = $.child(div_17);

											Wrench(node_38, { class: 'h-5 w-5 text-blue-500' });

											var div_18 = $.sibling(node_38, 2);
											var node_39 = $.child(div_18);

											Label(node_39, {
												class: 'font-medium',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_20 = $.text();

													$.template_effect(($0) => $.set_text(text_20, $0), [() => $t()("Maintenance Updates")]);
													$.append($$anchor, text_20);
												},
												$$slots: { default: true }
											});

											var p_4 = $.sibling(node_39, 2);
											var text_21 = $.only_child(p_4, true);

											$.reset(div_18);
											$.reset(div_17);

											var node_40 = $.sibling(div_17, 2);

											Switch(node_40, {
												get checked() {
													return $.get(maintenancesEnabled);
												},
												onCheckedChange: (value) => handlePreferenceChange("maintenances", value)
											});

											$.reset(div_16);
											$.template_effect(($0) => $.set_text(text_21, $0), [() => $t()("Get notified about scheduled maintenance")]);
											$.append($$anchor, div_16);
										};

										$.if(node_37, ($$render) => {
											if ($.get(availableSubscriptions).maintenances) $$render(consequent_13);
										});
									}

									$.reset(div_12);

									var node_41 = $.sibling(div_12, 2);

									{
										var consequent_14 = ($$anchor) => {
											var p_5 = root_3();
											var text_22 = $.only_child(p_5, true);

											$.template_effect(() => $.set_text(text_22, $.get(errorMessage)));
											$.append($$anchor, p_5);
										};

										$.if(node_41, ($$render) => {
											if ($.get(errorMessage)) $$render(consequent_14);
										});
									}

									$.reset(div_8);
									$.template_effect(() => $.set_text(text_17, $.get(subscriberEmail)));
									$.append($$anchor, div_8);
								};

								$.if(node_11, ($$render) => {
									if ($.get(currentView) === "loading") $$render(consequent_5); else if ($.get(currentView) === "login") $$render(consequent_8, 1); else if ($.get(currentView) === "otp") $$render(consequent_11, 2); else if ($.get(currentView) === "preferences") $$render(consequent_15, 3);
								});
							}

							$.reset(div);
							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
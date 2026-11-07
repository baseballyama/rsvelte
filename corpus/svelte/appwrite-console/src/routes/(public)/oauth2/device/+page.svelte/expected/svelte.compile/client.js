import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { onMount } from 'svelte';
import { page } from '$app/state';
import { AppwriteException } from '@appwrite.io/console';
import { Card, Layout, Typography, Icon, Spinner } from '@appwrite.io/pink-svelte';
import { IconDesktopComputer } from '@appwrite.io/pink-icons-svelte';
import { Button, Form, Label } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { getOAuth2App } from '$lib/helpers/oauth2-cimd';
import OAuth2ConsentCard from '../consent-card.svelte';
import OAuth2OutcomeCard from '../outcome-card.svelte';

var root = $.from_html(`<div class="spinner-wrap svelte-1fwshjq"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="header-icon-wrap svelte-1fwshjq"><!></div> <!>`, 1);
var root_3 = $.from_html(`<!> <input id="user-code" type="text" placeholder="XXXXXXXX" autocomplete="off" autocapitalize="characters" spellcheck="false" class="code-input svelte-1fwshjq"/> <!>`, 1);
var root_4 = $.from_html(`Signed in as <span class="bold svelte-1fwshjq"> </span>.`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<div class="device-page svelte-1fwshjq"><div class="device-card-wrapper svelte-1fwshjq"><!></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const DEVICE_FLOW = 'device';

	/** Keep only the characters the device user codes are built from. */
	function normalizeUserCode(value) {
		return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
	}

	let phase = $.state('loading');
	let account = $.state(null);
	let code = $.state($.proxy(normalizeUserCode(page.url.searchParams.get('user_code') ?? '')));
	let grant = $.state(null);
	let app = $.state(null);
	let error = $.state(null);
	let submitting = $.state(false);
	let hasPrefilledCode = $.state($.proxy(Boolean(normalizeUserCode(page.url.searchParams.get('user_code') ?? ''))));

	onMount(() => {
		let cancelled = false;

		async function init() {
			const loggedInAccount = await sdk.forConsole.account.get().catch(() => null);

			if (cancelled) return;

			if (!loggedInAccount) {
				void goto(`${base}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replaceState: true });

				return;
			}

			$.set(account, loggedInAccount, true);

			// Always show the code (prefilled from the URL or typed) so the user
			// can confirm it matches their device before exchanging it — never
			// auto-submit.
			$.set(phase, 'enter-code');
		}

		void init();

		return () => {
			cancelled = true;
		};
	});

	// Sync state to the `user_code` in the URL. This tracks ONLY the URL param
	// (not the locally-typed `code`), so typing in the field never re-triggers
	// it. Whenever the URL code changes — including being removed — the previous
	// request is no longer valid, so drop any loaded grant and return to
	// confirmation rather than confirming/approving a stale one.
	let lastUrlCode = $.state(null);

	$.user_effect(() => {
		const urlCode = normalizeUserCode(page.url.searchParams.get('user_code') ?? '');

		if (urlCode === $.get(lastUrlCode)) return;

		$.set(lastUrlCode, urlCode, true);
		$.set(code, urlCode, true);
		$.set(grant, null);
		$.set(app, null);
		$.set(error, null);
		$.set(hasPrefilledCode, Boolean(urlCode), true);

		if ($.get(phase) !== 'loading') $.set(phase, 'enter-code');
	});

	async function handleSubmit() {
		// Guard against a double Enter / programmatic resubmit racing or
		// invalidating the in-flight request.
		if ($.get(submitting)) return;

		const normalized = normalizeUserCode($.get(code));

		if (!normalized) return;

		$.set(error, null);
		$.set(submitting, true);

		try {
			const loadedGrant = await sdk.forConsole.oauth2.createGrant({ userCode: normalized });
			const loadedApp = await getOAuth2App(loadedGrant.appId);

			// A fresh `user_code` may have arrived while we awaited. Ignore this
			// now-stale result so we never show consent for a superseded request.
			if (normalizeUserCode($.get(code)) !== normalized) return;

			trackEvent(Submit.AccountOAuth2DeviceVerify, { app_id: loadedGrant.appId });
			$.set(grant, loadedGrant, true);
			$.set(app, loadedApp, true);
			$.set(error, null);
			$.set(phase, 'consent');
		} catch(e) {
			// Drop errors from a submission the active code has already moved past.
			if (normalizeUserCode($.get(code)) !== normalized) return;

			if (e instanceof AppwriteException && e.type === 'oauth2_invalid_user_code') {
				$.set(error, 'That code is invalid or has expired. Check your device and try again.');
			} else {
				$.set(error, e?.message ?? 'Could not verify that code.', true);
				addNotification({ type: 'error', message: $.get(error) });
				trackError(e, Submit.AccountOAuth2DeviceVerify);
			}

			$.set(phase, 'enter-code');
		} finally {
			$.set(submitting, false);
		}
	}

	function onDone(outcome) {
		$.set(phase, outcome === 'approved' ? 'approved' : 'denied', true);
	}

	var div = root_6();

	$.head('1fwshjq', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Connect a device - Appwrite';
		});
	});

	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			var node_1 = $.child(div_2);

			Spinner(node_1, { size: 'l' });
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		var consequent_3 = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.component(node_2, () => Card.Base, ($$anchor, Card_Base) => {
				Card_Base($$anchor, {
					padding: 'l',
					radius: 'l',
					style: 'width: 100%;',
					children: ($$anchor, $$slotProps) => {
						Form($$anchor, {
							onSubmit: handleSubmit,
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack) => {
									Layout_Stack($$anchor, {
										gap: 'xl',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_5();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
												Layout_Stack_1($$anchor, {
													gap: 'l',
													alignItems: 'center',
													alignContent: 'center',
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = root_2();
														var div_3 = $.first_child(fragment_4);
														var node_5 = $.child(div_3);

														Icon(node_5, {
															get icon() {
																return IconDesktopComputer;
															},
															size: 'l'
														});

														$.reset(div_3);

														var node_6 = $.sibling(div_3, 2);

														$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
															Layout_Stack_2($$anchor, {
																gap: 'xs',
																alignItems: 'center',
																alignContent: 'center',
																children: ($$anchor, $$slotProps) => {
																	var fragment_5 = root_1();
																	var node_7 = $.first_child(fragment_5);

																	$.component(node_7, () => Typography.Title, ($$anchor, Typography_Title) => {
																		Typography_Title($$anchor, {
																			size: 'm',
																			align: 'center',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text = $.text();

																				$.template_effect(() => $.set_text(text, $.get(hasPrefilledCode) ? 'Confirm your code' : 'Connect a device'));
																				$.append($$anchor, text);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_8 = $.sibling(node_7, 2);

																	$.component(node_8, () => Typography.Text, ($$anchor, Typography_Text) => {
																		Typography_Text($$anchor, {
																			variant: 'm-400',
																			align: 'center',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_1 = $.text();

																				$.template_effect(() => $.set_text(text_1, $.get(hasPrefilledCode)
																					? 'Make sure this matches the code shown on your device, then continue.'
																					: 'Enter the code shown on your device to continue.'));

																				$.append($$anchor, text_1);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_5);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											var node_9 = $.sibling(node_4, 2);

											$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
												Layout_Stack_3($$anchor, {
													gap: 's',
													children: ($$anchor, $$slotProps) => {
														var fragment_8 = root_3();
														var node_10 = $.first_child(fragment_8);

														Label(node_10, {
															for: 'user-code',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Device code');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});

														var input = $.sibling(node_10, 2);

														$.remove_input_defaults(input);
														$.autofocus(input, true);
														$.set_attribute(input, 'maxlength', 12);

														var node_11 = $.sibling(input, 2);

														{
															var consequent_1 = ($$anchor) => {
																var fragment_9 = $.comment();
																var node_12 = $.first_child(fragment_9);

																$.component(node_12, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																	Typography_Text_1($$anchor, {
																		variant: 'm-400',
																		color: '--fgcolor-danger',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text();

																			$.template_effect(() => $.set_text(text_3, $.get(error)));
																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_9);
															};

															$.if(node_11, ($$render) => {
																if ($.get(error)) $$render(consequent_1);
															});
														}

														$.template_effect(() => {
															$.set_value(input, $.get(code));
															input.disabled = $.get(submitting);
														});

														$.delegated('input', input, (e) => {
															$.set(code, normalizeUserCode(e.currentTarget.value), true);
															$.set(error, null);
														});

														$.append($$anchor, fragment_8);
													},
													$$slots: { default: true }
												});
											});

											var node_13 = $.sibling(node_9, 2);

											{
												let $0 = $.derived(() => $.get(code).length === 0 || $.get(submitting));

												Button(node_13, {
													fullWidth: true,
													submit: true,
													get disabled() {
														return $.get($0);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text();

														$.template_effect(() => $.set_text(text_4, $.get(submitting) ? 'Verifying…' : 'Continue'));
														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});
											}

											var node_14 = $.sibling(node_13, 2);

											{
												var consequent_2 = ($$anchor) => {
													var fragment_12 = $.comment();
													var node_15 = $.first_child(fragment_12);

													$.component(node_15, () => Typography.Text, ($$anchor, Typography_Text_2) => {
														Typography_Text_2($$anchor, {
															variant: 'm-400',
															align: 'center',
															color: '--fgcolor-neutral-secondary',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_13 = root_4();
																var span = $.sibling($.first_child(fragment_13));
																var text_5 = $.only_child(span, true);

																$.next();
																$.template_effect(() => $.set_text(text_5, $.get(account).email || $.get(account).name));
																$.append($$anchor, fragment_13);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_12);
												};

												$.if(node_14, ($$render) => {
													if ($.get(account)) $$render(consequent_2);
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
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		};

		var consequent_4 = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(account)?.email || $.get(account)?.name || undefined);

				OAuth2ConsentCard($$anchor, {
					get grant() {
						return $.get(grant);
					},

					get app() {
						return $.get(app);
					},

					get accountLabel() {
						return $.get($0);
					},
					flow: DEVICE_FLOW,
					onDone
				});
			}
		};

		var consequent_5 = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(account)?.email || $.get(account)?.name || undefined);

				OAuth2OutcomeCard($$anchor, {
					get outcome() {
						return $.get(phase);
					},
					flow: DEVICE_FLOW,
					get app() {
						return $.get(app);
					},

					get accountLabel() {
						return $.get($0);
					}
				});
			}
		};

		$.if(node, ($$render) => {
			if ($.get(phase) === 'loading') $$render(consequent); else if ($.get(phase) === 'enter-code') $$render(consequent_3, 1); else if ($.get(phase) === 'consent' && $.get(grant) && $.get(app)) $$render(consequent_4, 2); else if ($.get(phase) === 'approved' || $.get(phase) === 'denied') $$render(consequent_5, 3);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input']);
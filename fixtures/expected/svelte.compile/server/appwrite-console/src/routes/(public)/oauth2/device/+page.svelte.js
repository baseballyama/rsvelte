import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const DEVICE_FLOW = 'device';

		/** Keep only the characters the device user codes are built from. */
		function normalizeUserCode(value) {
			return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
		}

		let phase = 'loading';
		let account = null;
		let code = normalizeUserCode(page.url.searchParams.get('user_code') ?? '');
		let grant = null;
		let app = null;
		let error = null;
		let submitting = false;
		let hasPrefilledCode = Boolean(normalizeUserCode(page.url.searchParams.get('user_code') ?? ''));

		onMount(() => {
			let cancelled = false;

			async function init() {
				const loggedInAccount = await sdk.forConsole.account.get().catch(() => null);

				if (cancelled) return;

				if (!loggedInAccount) {
					void goto(`${base}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replaceState: true });

					return;
				}

				account = loggedInAccount;

				// Always show the code (prefilled from the URL or typed) so the user
				// can confirm it matches their device before exchanging it — never
				// auto-submit.
				phase = 'enter-code';
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
		let lastUrlCode = null;

		async function handleSubmit() {
			// Guard against a double Enter / programmatic resubmit racing or
			// invalidating the in-flight request.
			if (submitting) return;

			const normalized = normalizeUserCode(code);

			if (!normalized) return;

			error = null;
			submitting = true;

			try {
				const loadedGrant = await sdk.forConsole.oauth2.createGrant({ userCode: normalized });
				const loadedApp = await getOAuth2App(loadedGrant.appId);

				// A fresh `user_code` may have arrived while we awaited. Ignore this
				// now-stale result so we never show consent for a superseded request.
				if (normalizeUserCode(code) !== normalized) return;

				trackEvent(Submit.AccountOAuth2DeviceVerify, { app_id: loadedGrant.appId });
				grant = loadedGrant;
				app = loadedApp;
				error = null;
				phase = 'consent';
			} catch(e) {
				// Drop errors from a submission the active code has already moved past.
				if (normalizeUserCode(code) !== normalized) return;

				if (e instanceof AppwriteException && e.type === 'oauth2_invalid_user_code') {
					error = 'That code is invalid or has expired. Check your device and try again.';
				} else {
					error = e?.message ?? 'Could not verify that code.';
					addNotification({ type: 'error', message: error });
					trackError(e, Submit.AccountOAuth2DeviceVerify);
				}

				phase = 'enter-code';
			} finally {
				submitting = false;
			}
		}

		function onDone(outcome) {
			phase = outcome === 'approved' ? 'approved' : 'denied';
		}

		$.head('1fwshjq', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Connect a device - Appwrite</title>`);
			});
		});

		$$renderer.push(`<div class="device-page svelte-1fwshjq"><div class="device-card-wrapper svelte-1fwshjq">`);

		if (phase === 'loading') {
			$$renderer.push(`<!--[0--><div class="spinner-wrap svelte-1fwshjq">`);
			Spinner($$renderer, { size: 'l' });
			$$renderer.push(`<!----></div>`);
		} else if (phase === 'enter-code') {
			$$renderer.push('<!--[1-->');

			if (Card.Base) {
				$$renderer.push('<!--[-->');

				Card.Base($$renderer, {
					padding: 'l',
					radius: 'l',
					style: 'width: 100%;',
					children: ($$renderer) => {
						Form($$renderer, {
							onSubmit: handleSubmit,
							children: ($$renderer) => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										gap: 'xl',
										children: ($$renderer) => {
											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													gap: 'l',
													alignItems: 'center',
													alignContent: 'center',
													children: ($$renderer) => {
														$$renderer.push(`<div class="header-icon-wrap svelte-1fwshjq">`);
														Icon($$renderer, { icon: IconDesktopComputer, size: 'l' });
														$$renderer.push(`<!----></div> `);

														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																gap: 'xs',
																alignItems: 'center',
																alignContent: 'center',
																children: ($$renderer) => {
																	if (Typography.Title) {
																		$$renderer.push('<!--[-->');

																		Typography.Title($$renderer, {
																			size: 'm',
																			align: 'center',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(hasPrefilledCode ? 'Confirm your code' : 'Connect a device')}`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			variant: 'm-400',
																			align: 'center',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(hasPrefilledCode
																					? 'Make sure this matches the code shown on your device, then continue.'
																					: 'Enter the code shown on your device to continue.')}`);
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

											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													gap: 's',
													children: ($$renderer) => {
														Label($$renderer, {
															for: 'user-code',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Device code`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> <input id="user-code" type="text"${$.attr('value', code)} placeholder="XXXXXXXX" autofocus="" autocomplete="off" autocapitalize="characters" spellcheck="false"${$.attr('maxlength', 12)}${$.attr('disabled', submitting, true)} class="code-input svelte-1fwshjq"/> `);

														if (error) {
															$$renderer.push('<!--[0-->');

															if (Typography.Text) {
																$$renderer.push('<!--[-->');

																Typography.Text($$renderer, {
																	variant: 'm-400',
																	color: '--fgcolor-danger',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(error)}`);
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

											$$renderer.push(` `);

											Button($$renderer, {
												fullWidth: true,
												submit: true,
												disabled: code.length === 0 || submitting,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(submitting ? 'Verifying…' : 'Continue')}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											if (account) {
												$$renderer.push('<!--[0-->');

												if (Typography.Text) {
													$$renderer.push('<!--[-->');

													Typography.Text($$renderer, {
														variant: 'm-400',
														align: 'center',
														color: '--fgcolor-neutral-secondary',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Signed in as <span class="bold svelte-1fwshjq">${$.escape(account.email || account.name)}</span>.`);
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
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else if (phase === 'consent' && grant && app) {
			$$renderer.push('<!--[2-->');

			OAuth2ConsentCard($$renderer, {
				grant,
				app,
				accountLabel: account?.email || account?.name || undefined,
				flow: DEVICE_FLOW,
				onDone
			});
		} else if (phase === 'approved' || phase === 'denied') {
			$$renderer.push('<!--[3-->');

			OAuth2OutcomeCard($$renderer, {
				outcome: phase,
				flow: DEVICE_FLOW,
				app,
				accountLabel: account?.email || account?.name || undefined
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}
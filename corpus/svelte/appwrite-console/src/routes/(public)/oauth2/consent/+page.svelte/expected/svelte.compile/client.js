import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { page } from '$app/state';
import { AppwriteException } from '@appwrite.io/console';
import { Card, Layout, Typography, Icon, Spinner } from '@appwrite.io/pink-svelte';
import { IconExclamation } from '@appwrite.io/pink-icons-svelte';
import { Button } from '$lib/elements/forms';
import { sdk } from '$lib/stores/sdk';
import { logout } from '$lib/helpers/logout';
import { isWebRedirect } from '$lib/helpers/oauth2-redirect';
import { getOAuth2App } from '$lib/helpers/oauth2-cimd';
import OAuth2ConsentCard from '../consent-card.svelte';
import OAuth2OutcomeCard from '../outcome-card.svelte';
import { OAuth2ErrorMessage, OAuth2ErrorType } from '../errors';

var root = $.from_html(`<div class="spinner-wrap svelte-7g7ins"><!></div>`);
var root_1 = $.from_html(`<div class="error-icon-wrap svelte-7g7ins"><!></div> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="consent-page svelte-7g7ins"><div class="consent-card-wrapper svelte-7g7ins"><!></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let phase = $.state('loading');
	let grant = $.state(null);
	let app = $.state(null);
	let account = $.state(null);
	let error = $.state(null);
	let completedRedirectUrl = $.state(undefined);
	let accountSwitchResumeUrl = $.state(null);
	const ACCOUNT_SWITCH_STORAGE_PREFIX = 'oauth2-account-switch:';

	function rememberAccountSwitchUrl(key, url) {
		sessionStorage.setItem(`${ACCOUNT_SWITCH_STORAGE_PREFIX}${key}`, url);
	}

	function accountSwitchUrlFor(key) {
		return sessionStorage.getItem(`${ACCOUNT_SWITCH_STORAGE_PREFIX}${key}`);
	}

	// OIDC `max_age` is a non-negative integer count of seconds. Reject anything
	// else (e.g. `max_age=abc`) so we omit the param rather than forwarding NaN.
	function parseMaxAge(raw) {
		if (!raw) return undefined;

		const value = Number(raw);

		return Number.isInteger(value) && value >= 0 ? value : undefined;
	}

	function getAccount() {
		return sdk.forConsole.account.get().catch(() => null);
	}

	// The authorize-request fields shared verbatim between createPAR (pre-login
	// push) and authorize (authenticated direct path).
	function readAuthorizeParams(params) {
		const resources = params.getAll('resource');

		return {
			redirectUri: params.get('redirect_uri') ?? '',
			responseType: params.get('response_type') ?? 'code',
			scope: params.get('scope') ?? '',
			state: params.get('state') ?? undefined,
			nonce: params.get('nonce') ?? undefined,
			codeChallenge: params.get('code_challenge') ?? undefined,
			codeChallengeMethod: params.get('code_challenge_method') ?? undefined,
			prompt: params.get('prompt') ?? undefined,
			maxAge: parseMaxAge(params.get('max_age')),
			authorizationDetails: params.get('authorization_details') ?? undefined,
			resource: resources.length > 0 ? resources : undefined
		};
	}

	function goSignIn(resumeUrl) {
		const target = resumeUrl ?? window.location.pathname + window.location.search;

		void goto(resolve(`/login?redirect=${encodeURIComponent(target)}`), { replaceState: true });
	}

	function fail(e, fallback) {
		$.set(error, e?.message ?? fallback, true);
		$.set(phase, 'error');
	}

	// Load a grant + its app branding and render the consent card.
	async function loadConsent(grantId, cancelled, knownAccount) {
		const loadedGrant = await sdk.forConsole.oauth2.getGrant({ grantId });

		const [loadedApp, loadedAccount] = await Promise.all([
			getOAuth2App(loadedGrant.appId),
			knownAccount !== undefined ? Promise.resolve(knownAccount) : getAccount()
		]);

		if (cancelled()) return;

		$.set(grant, loadedGrant, true);
		$.set(app, loadedApp, true);
		$.set(account, loadedAccount, true);
		$.set(phase, 'ready');
	}

	async function resumeFromGrant(grantId, cancelled) {
		$.set(accountSwitchResumeUrl, accountSwitchUrlFor(grantId), true);

		try {
			await loadConsent(grantId, cancelled);
		} catch(e) {
			if (cancelled()) return;

			if (e instanceof AppwriteException && e.code === 401) {
				goSignIn();

				return;
			}

			fail(e, OAuth2ErrorMessage.GRANT_INVALID);
		}
	}

	async function handleAuthorizeResult(result, loggedInAccount, clientId, fromRequestUri, cancelled) {
		if (result.redirectUrl) {
			// Already consented — go straight back to the client.
			window.location.href = result.redirectUrl;

			if (!isWebRedirect(result.redirectUrl)) {
				$.set(completedRedirectUrl, result.redirectUrl, true);
				$.set(account, loggedInAccount, true);
				$.set(app, clientId ? await getOAuth2App(clientId).catch(() => null) : null, true);

				if (cancelled()) return;

				$.set(phase, 'approved');
			}

			return;
		}

		if (result.grantId) {
			if ($.get(accountSwitchResumeUrl)) {
				rememberAccountSwitchUrl(result.grantId, $.get(accountSwitchResumeUrl));
			}

			if (fromRequestUri) {
				// The handle is now consumed — rewrite to the grant URL so
				// reloads resume via getGrant instead of a dead request_uri.
				await goto(resolve(`/oauth2/consent?grant_id=${result.grantId}`), { replaceState: true });

				return;
			}

			await loadConsent(result.grantId, cancelled, loggedInAccount);

			return;
		}

		$.set(error, OAuth2ErrorMessage.AUTHORIZE_FAILED, true);
		$.set(phase, 'error');
	}

	async function resumeFromRequestUri(clientId, requestUri, cancelled) {
		$.set(accountSwitchResumeUrl, accountSwitchUrlFor(requestUri), true);

		const loggedInAccount = await getAccount();

		if (cancelled()) return;

		if (!loggedInAccount) {
			// Dereferencing while logged out can only 401; keep the
			// single-use handle untouched and go straight to login.
			goSignIn();

			return;
		}

		try {
			// The server rejects request_uri combined with any other
			// authorization param; only client_id may accompany it.
			const result = await sdk.forConsole.oauth2.authorize({ clientId: clientId ?? undefined, requestUri });

			if (cancelled()) return;

			await handleAuthorizeResult(result, loggedInAccount, clientId, true, cancelled);
		} catch(e) {
			if (cancelled()) return;

			// Since only the handle is sent, oauth2_invalid_request can only
			// mean the handle is unusable.
			if (e instanceof AppwriteException && e.type === OAuth2ErrorType.INVALID_REQUEST) {
				$.set(error, OAuth2ErrorMessage.HANDLE_EXPIRED, true);
				$.set(phase, 'error');

				return;
			}

			fail(e, OAuth2ErrorMessage.AUTHORIZE_FAILED);
		}
	}

	// Pre-login entry with raw authorize params in the URL.
	async function startAuthorize(clientId, params, cancelled) {
		const authorizeUrl = window.location.pathname + window.location.search;

		$.set(accountSwitchResumeUrl, authorizeUrl);

		const loggedInAccount = await getAccount();

		if (cancelled()) return;

		if (!loggedInAccount) {
			// Carry only a short request_uri through login — the full
			// consent URL travels inside the OAuth provider's `state`
			// during GitHub sign-in and can exceed its size limits.
			try {
				const par = await sdk.forConsole.oauth2.createPAR({ clientId, ...readAuthorizeParams(params) });

				if (cancelled()) return;

				rememberAccountSwitchUrl(par.request_uri, authorizeUrl);
				goSignIn(`${resolve('/oauth2/consent')}?client_id=${encodeURIComponent(clientId)}&request_uri=${encodeURIComponent(par.request_uri)}`);
			} catch {
				if (cancelled()) return;

				// PAR unavailable (older server) or invalid request —
				// fall back to the legacy full-URL redirect.
				goSignIn();
			}

			return;
		}

		// Authenticated: ask the server to create a grant (or detect an
		// existing approved identity), then render consent or redirect.
		try {
			const result = await sdk.forConsole.oauth2.authorize({ clientId, ...readAuthorizeParams(params) });

			if (cancelled()) return;

			await handleAuthorizeResult(result, loggedInAccount, clientId, false, cancelled);
		} catch(e) {
			if (cancelled()) return;

			fail(e, OAuth2ErrorMessage.AUTHORIZE_FAILED);
		}
	}

	async function init(params, cancelled) {
		const grantId = params.get('grant_id');

		if (grantId) {
			await resumeFromGrant(grantId, cancelled);

			return;
		}

		const clientId = params.get('client_id');
		const requestUri = params.get('request_uri');

		if (requestUri) {
			await resumeFromRequestUri(clientId, requestUri, cancelled);

			return;
		}

		if (clientId) {
			await startAuthorize(clientId, params, cancelled);

			return;
		}

		$.set(error, OAuth2ErrorMessage.MISSING_REQUEST, true);
		$.set(phase, 'error');
	}

	function onDone(outcome, redirectUrl) {
		$.set(completedRedirectUrl, redirectUrl, true);
		$.set(phase, outcome === 'approved' ? 'approved' : 'denied', true);
	}

	async function switchAccount() {
		if (!$.get(accountSwitchResumeUrl)) return;

		$.set(phase, 'loading');

		try {
			await logout(false);
			goSignIn($.get(accountSwitchResumeUrl));
		} catch(e) {
			fail(e, 'Failed to switch accounts');
		}
	}

	// A $derived string so identity-only replacements of page.url (e.g. login
	// calling invalidate(ACCOUNT) right after goto) don't restart the flow —
	// a restart would cancel an in-flight authorize and re-dereference an
	// already-consumed single-use request_uri.
	const authorizeQuery = $.derived(() => page.url.searchParams.toString());

	let currentRun = 0;

	// Re-runs when the authorize params change (this route can stay mounted as
	// the router moves between requests). Reset to loading so a previously
	// loaded grant can never be approved against a different request.
	$.user_effect(() => {
		const params = new URLSearchParams($.get(authorizeQuery));
		const run = ++currentRun;

		$.set(phase, 'loading');
		$.set(error, null);
		$.set(completedRedirectUrl, undefined);
		$.set(accountSwitchResumeUrl, null);
		void init(params, () => run !== currentRun);

		return () => {
			currentRun++;
		};
	});

	var div = root_2();

	$.head('7g7ins', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Authorize application - Appwrite';
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

		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.component(node_2, () => Card.Base, ($$anchor, Card_Base) => {
				Card_Base($$anchor, {
					padding: 'l',
					radius: 'l',
					style: 'width: 100%;',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								gap: 'l',
								alignItems: 'center',
								alignContent: 'center',
								children: ($$anchor, $$slotProps) => {
									var fragment_2 = root_1();
									var div_3 = $.first_child(fragment_2);
									var node_4 = $.child(div_3);

									Icon(node_4, {
										get icon() {
											return IconExclamation;
										},
										size: 'l',
										color: '--fgcolor-danger'
									});

									$.reset(div_3);

									var node_5 = $.sibling(div_3, 2);

									$.component(node_5, () => Typography.Title, ($$anchor, Typography_Title) => {
										Typography_Title($$anchor, {
											size: 'm',
											align: 'center',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Authorization failed');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => Typography.Text, ($$anchor, Typography_Text) => {
										Typography_Text($$anchor, {
											variant: 'm-400',
											align: 'center',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, $.get(error)));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_7 = $.sibling(node_6, 2);

									Button(node_7, {
										$$events: { click: () => goto(resolve('/'), { replaceState: true }) },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Go to console');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
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

			$.append($$anchor, fragment);
		};

		var consequent_2 = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(account)?.email || $.get(account)?.name || undefined);
				let $1 = $.derived(() => $.get(accountSwitchResumeUrl) ? switchAccount : undefined);

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
					flow: 'authorization',
					get onSwitchAccount() {
						return $.get($1);
					},
					onDone
				});
			}
		};

		var consequent_3 = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(account)?.email || $.get(account)?.name || undefined);

				OAuth2OutcomeCard($$anchor, {
					get outcome() {
						return $.get(phase);
					},
					flow: 'authorization',
					get app() {
						return $.get(app);
					},

					get accountLabel() {
						return $.get($0);
					},

					get redirectUrl() {
						return $.get(completedRedirectUrl);
					}
				});
			}
		};

		$.if(node, ($$render) => {
			if ($.get(phase) === 'loading') $$render(consequent); else if ($.get(phase) === 'error') $$render(consequent_1, 1); else if ($.get(phase) === 'ready' && $.get(grant) && $.get(app)) $$render(consequent_2, 2); else if ($.get(phase) === 'approved' || $.get(phase) === 'denied') $$render(consequent_3, 3);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}
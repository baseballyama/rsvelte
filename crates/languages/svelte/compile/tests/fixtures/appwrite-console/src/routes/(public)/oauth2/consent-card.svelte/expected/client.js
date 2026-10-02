import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Layout, Typography, Icon, Spinner } from '@appwrite.io/pink-svelte';

import {
	IconCheck,
	IconExclamation,
	IconChevronDown,
	IconChevronUp,
	IconLink,
	IconFolder,
	IconOfficeBuilding,
	IconLockClosed,
	IconExclamationCircle,
	IconAdjustments,
	IconShieldCheck,
	IconSwitchHorizontal
} from '@appwrite.io/pink-icons-svelte';

import { Button, Form } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

import {
	splitConsentScopes,
	buildConsentPermissions,
	buildTierEditorRows,
	PROJECT_SCOPE_PREFIX,
	ORGANIZATION_SCOPE_PREFIX
} from '$lib/helpers/oauth2-scopes';

import { isMcpGrant, composeGrantedScopes } from '$lib/helpers/oauth2-mcp';
import { isWebRedirect } from '$lib/helpers/oauth2-redirect';

import {
	parseAuthorizationDetails,
	mergeIdentifiers,
	serializeGrantedDetails,
	searchProjects,
	searchOrganizations,
	resolveProjectNames,
	resolveOrganizationNames,
	PROJECT_RAR_TYPE,
	ORGANIZATION_RAR_TYPE,
	WILDCARD_IDENTIFIER
} from '$lib/helpers/oauth2-authorization-details';

import { resolveOAuth2AppLogoUrl } from '$lib/helpers/oauth2-app-logo';
import ResourceSelector from './resource-selector.svelte';

var root = $.from_html(`<span><button type="button">Read</button> <button type="button">Read + Write</button></span>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<span class="perm-desc svelte-1ltsqli"> </span>`);
var root_3 = $.from_html(`<li><label class="editor-check svelte-1ltsqli"><input type="checkbox" class="svelte-1ltsqli"/></label> <span class="perm-text svelte-1ltsqli"><span class="perm-row-head svelte-1ltsqli"><span class="perm-title svelte-1ltsqli"> </span> <!></span> <!></span></li>`);
var root_4 = $.from_html(`<ul class="perm-list svelte-1ltsqli"></ul>`);
var root_5 = $.from_html(`<div class="perm-group svelte-1ltsqli"><div class="perm-group-head svelte-1ltsqli"><div class="perm-group-heading-row svelte-1ltsqli"><label class="editor-check group-check svelte-1ltsqli"><input type="checkbox" class="svelte-1ltsqli"/></label> <button type="button" class="perm-group-toggle svelte-1ltsqli"><!> <!></button></div> <span class="subtext svelte-1ltsqli"> </span></div> <!></div>`);
var root_6 = $.from_html(`<img class="avatar svelte-1ltsqli"/>`);
var root_7 = $.from_html(`<div class="avatar placeholder svelte-1ltsqli"> </div>`);
var root_8 = $.from_html(`<span class="connector svelte-1ltsqli"><span class="connector-line svelte-1ltsqli"></span> <span class="connector-node svelte-1ltsqli"><!></span> <span class="connector-line svelte-1ltsqli"></span></span> <div class="avatar account svelte-1ltsqli"> </div>`, 1);
var root_9 = $.from_html(`<div class="account-dropdown svelte-1ltsqli" role="menu"><div class="account-dropdown-current svelte-1ltsqli"><span class="account-avatar large svelte-1ltsqli"> </span> <span class="account-dropdown-text svelte-1ltsqli"><span class="account-dropdown-label svelte-1ltsqli"> </span></span> <span class="account-dropdown-check svelte-1ltsqli"><!></span></div> <button type="button" class="account-dropdown-action svelte-1ltsqli" role="menuitem"><span class="account-dropdown-action-icon svelte-1ltsqli"><!></span> Use a different account</button></div>`);
var root_10 = $.from_html(`<div class="account-menu svelte-1ltsqli"><button type="button" aria-haspopup="menu"><span class="account-avatar svelte-1ltsqli"> </span> <span class="account-label svelte-1ltsqli"> </span> <!></button> <!></div>`);
var root_11 = $.from_html(`<div class="account-chip svelte-1ltsqli"><span class="account-avatar svelte-1ltsqli"> </span> <span class="account-label svelte-1ltsqli"> </span></div>`);
var root_12 = $.from_html(`<span class="subtext editor-identity svelte-1ltsqli"> </span>`);
var root_13 = $.from_html(`<div class="scope-warning svelte-1ltsqli"><!> <span> </span></div>`);

var root_14 = $.from_html(`<div class="scope-warning svelte-1ltsqli"><!> <span>Your selection was too long to grant scope-by-scope, so a
                                        fully selected tier was granted as full tier access instead.</span></div>`);

var root_15 = $.from_html(`<div class="editor-body svelte-1ltsqli"><label class="editor-readonly svelte-1ltsqli"><input type="checkbox" class="svelte-1ltsqli"/> <span class="perm-text svelte-1ltsqli"><span class="perm-title svelte-1ltsqli">Read-only</span> <span class="subtext svelte-1ltsqli">Limit every selected permission to viewing data — nothing
                                        can be created, changed, or deleted.</span></span></label> <!> <!> <!> <!> <!></div>`);

var root_16 = $.from_html(`<section class="panel editor-panel svelte-1ltsqli"><div class="access-summary svelte-1ltsqli"><span class="scope-icon svelte-1ltsqli"><!></span> <span class="scope-head-text svelte-1ltsqli"><!> <span class="subtext svelte-1ltsqli"> </span></span></div> <button type="button" class="customize-head svelte-1ltsqli"><span class="customize-label svelte-1ltsqli"><span class="customize-icon svelte-1ltsqli"><!></span> <span class="scope-head-text svelte-1ltsqli"><span class="perm-title svelte-1ltsqli">Customize access</span> <span class="subtext svelte-1ltsqli"> </span></span></span> <!></button> <!></section>`);
var root_17 = $.from_html(`<button type="button" class="permission-group-toggle svelte-1ltsqli"><!> <!></button>`);
var root_18 = $.from_html(`<span class="subtext svelte-1ltsqli"> </span>`);
var root_19 = $.from_html(`<li class="perm svelte-1ltsqli"><span class="perm-check svelte-1ltsqli"><!></span> <span class="perm-text svelte-1ltsqli"><span class="perm-row-head svelte-1ltsqli"><span class="perm-title svelte-1ltsqli"> </span> <!></span> <!></span></li>`);
var root_20 = $.from_html(`<div class="perm-group svelte-1ltsqli"><div class="perm-group-head svelte-1ltsqli"><!> <!></div> <!></div>`);
var root_21 = $.from_html(`<div class="panel-body svelte-1ltsqli"></div>`);
var root_22 = $.from_html(`<section class="panel svelte-1ltsqli"><button type="button" class="panel-head svelte-1ltsqli"><span class="panel-head-label svelte-1ltsqli"><!> <!></span> <!></button> <!></section>`);
var root_23 = $.from_html(`<section><div class="scope-head svelte-1ltsqli"><span class="scope-icon svelte-1ltsqli"><!></span> <span class="scope-head-text svelte-1ltsqli"><!> <span class="subtext svelte-1ltsqli"> </span></span></div> <!> <!></section>`);
var root_24 = $.from_html(`<div class="error-box svelte-1ltsqli"><!> <!></div>`);
var root_25 = $.from_html(`<!> `, 1);
var root_26 = $.from_html(`<!> <!>`, 1);
var root_27 = $.from_html(`<span>After authorizing, return to your device</span>`);
var root_28 = $.from_html(`<span>You can revoke access anytime</span>`);
var root_29 = $.from_html(`<a target="_blank" rel="noreferrer" class="footer-link svelte-1ltsqli">Privacy</a>`);
var root_30 = $.from_html(`<a target="_blank" rel="noreferrer" class="footer-link svelte-1ltsqli">Terms</a>`);
var root_31 = $.from_html(`<div class="consent svelte-1ltsqli"><header class="header svelte-1ltsqli"><div class="identity svelte-1ltsqli"><!> <!></div> <div class="headline svelte-1ltsqli"><!> <!></div> <!></header> <div class="body svelte-1ltsqli"><!> <!> <!> <!> <!> <p class="footnote svelte-1ltsqli"><span class="footnote-secure svelte-1ltsqli"><!> <!></span> <!> <!></p></div></div>`);

export default function Consent_card($$anchor, $$props) {
	$.push($$props, true);

	const // The `scope` param carries every requested privilege. Scopes are shown
	// read-only — the client decides what it asks for. authorization_details
	// binds the project/organization tiers to concrete resources, and that
	// binding is the only thing the user narrows here.
	// When a tier's scopes are requested but left unbound, fall back to the
	// wildcard so the user still gets the full resource picker.
	// Account menu — the chip doubles as a trigger for switching accounts.
	// MCP grants (detected via the grant's RFC 8707 resources) get a narrowing
	// editor: the client requested the full scope catalog, so consent is the
	// control point. Every other grant renders exactly as before — read-only
	// permissions, no scope narrowing.
	// The one thing the user controls: which projects / organizations the tiers
	// are bound to. Defaults to exactly what the client requested; reset on grant
	// change so a stale selection can't leak.
	// Scope-narrowing editor state (MCP grants only). Rows absent from a tier's
	// selection are selected with full requested access, so the empty record is
	// the "full access" default.
	// The narrowed grant to send on approve. `scope: undefined` means the user
	// kept the full request — the approve call then omits `scope` so the server
	// grants the full literal requested list and re-authorizations skip consent.
	// A requested tier must be bound to at least one resource, otherwise its
	// scopes are inert — the app would be "authorized" yet unable to act. Block
	// Authorize until every requested tier has a selection.
	// Authorize stays enabled while SOMETHING is granted and no requested tier is
	// left without a resource.
	// With the narrowing editor, the selection must keep at least one
	// non-identity scope — an identity-only grant would leave the app
	// "authorized" but unable to act.
	// Resource search wiring. Projects search server-side (there can be many);
	// organizations are few, so they load once and filter client-side.
	// Pin the request we're acting on so a mid-flight grant swap can't redirect
	// with the wrong grant's redirectUrl.
	// For MCP grants the editor may downscope the requested catalog;
	// `scope` stays omitted when the user kept the full request so
	// the server grants the full literal requested list (keeping the
	// consent-skip diff empty on re-authorization). Non-MCP grants
	// never send `scope` — only the resource binding is narrowed.
	// Same consent-skip reasoning for the resource binding: on an
	// MCP grant with untouched pickers, omit `authorizationDetails`
	// so the server keeps exactly what the client requested — the
	// re-auth diff (a hash of requested vs stored details) then
	// stays empty. A narrowed selection is sent and deliberately
	// forces re-consent on the next full request.
	editorGroup = (
		$$anchor,
		tierKey = $.noop,
		heading = $.noop,
		note = $.noop,
		rows = $.noop,
		selection = $.noop
	) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent_3 = ($$anchor) => {
				var div = root_5();
				var div_1 = $.child(div);
				var div_2 = $.child(div_1);
				var label = $.child(div_2);
				var input = $.child(label);

				$.remove_input_defaults(input);
				$.reset(label);

				var button = $.sibling(label, 2);
				var node_1 = $.child(button);

				$.component(node_1, () => Typography.Text, ($$anchor, Typography_Text) => {
					Typography_Text($$anchor, {
						variant: 'm-500',
						color: '--fgcolor-neutral-secondary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, heading()));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => tierPermissionsOpen(tierKey()) ? IconChevronUp : IconChevronDown);

					Icon(node_2, {
						get icon() {
							return $.get($0);
						},
						size: 's'
					});
				}

				$.reset(button);
				$.reset(div_2);

				var span = $.sibling(div_2, 2);
				var text_1 = $.only_child(span, true);

				$.reset(div_1);

				var node_3 = $.sibling(div_1, 2);

				{
					var consequent_2 = ($$anchor) => {
						var ul = root_4();

						$.each(ul, 21, rows, (row) => row.resource, ($$anchor, row) => {
							const state = $.derived(() => rowState(selection(), $.get(row).resource));
							var li = root_3();
							let classes;
							var label_1 = $.child(li);
							var input_1 = $.child(label_1);

							$.remove_input_defaults(input_1);
							$.reset(label_1);

							var span_1 = $.sibling(label_1, 2);
							var span_2 = $.child(span_1);
							var span_3 = $.child(span_2);
							var text_2 = $.only_child(span_3, true);
							var node_4 = $.sibling(span_3, 2);

							{
								var consequent = ($$anchor) => {
									var span_4 = root();
									let classes_1;
									var button_1 = $.child(span_4);
									let classes_2;
									var button_2 = $.sibling(button_1, 2);
									let classes_3;

									$.reset(span_4);

									$.template_effect(() => {
										classes_1 = $.set_class(span_4, 1, 'level-toggle svelte-1ltsqli', null, classes_1, { disabled: !$.get(state).selected });
										classes_2 = $.set_class(button_1, 1, 'level-btn svelte-1ltsqli', null, classes_2, { active: $.get(state).level === 'read' || $.get(readOnlyAll) });
										button_1.disabled = $.get(busy) || !$.get(state).selected;
										classes_3 = $.set_class(button_2, 1, 'level-btn svelte-1ltsqli', null, classes_3, { active: $.get(state).level === 'full' && !$.get(readOnlyAll) });
										button_2.disabled = $.get(busy) || !$.get(state).selected || $.get(readOnlyAll);
									});

									$.delegated('click', button_1, () => updateRow(tierKey(), $.get(row).resource, { level: 'read' }));
									$.delegated('click', button_2, () => updateRow(tierKey(), $.get(row).resource, { level: 'full' }));
									$.append($$anchor, span_4);
								};

								var alternate = ($$anchor) => {
									var span_5 = root_1();
									let classes_4;
									var text_3 = $.only_child(span_5, true);

									$.template_effect(() => {
										classes_4 = $.set_class(span_5, 1, 'access-chip svelte-1ltsqli', null, classes_4, { strong: $.get(row).accessStrong });
										$.set_text(text_3, $.get(row).access);
									});

									$.append($$anchor, span_5);
								};

								$.if(node_4, ($$render) => {
									if ($.get(row).hasRead && $.get(row).hasWrite) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.reset(span_2);

							var node_5 = $.sibling(span_2, 2);

							{
								var consequent_1 = ($$anchor) => {
									var span_6 = root_2();
									var text_4 = $.only_child(span_6, true);

									$.template_effect(() => $.set_text(text_4, $.get(row).description));
									$.append($$anchor, span_6);
								};

								$.if(node_5, ($$render) => {
									if ($.get(row).description) $$render(consequent_1);
								});
							}

							$.reset(span_1);
							$.reset(li);

							$.template_effect(() => {
								classes = $.set_class(li, 1, 'perm editor-row svelte-1ltsqli', null, classes, { off: !$.get(state).selected });
								$.set_checked(input_1, $.get(state).selected);
								input_1.disabled = $.get(busy);
								$.set_attribute(input_1, 'aria-label', `Allow access to ${$.get(row).title ?? ''}`);
								$.set_text(text_2, $.get(row).title);
							});

							$.delegated('change', input_1, (e) => updateRow(tierKey(), $.get(row).resource, { selected: e.currentTarget.checked }));
							$.append($$anchor, li);
						});

						$.reset(ul);
						$.template_effect(() => $.set_attribute(ul, 'id', `${tierKey() ?? ''}-permissions-list`));
						$.append($$anchor, ul);
					};

					var d = $.derived(() => tierPermissionsOpen(tierKey()));

					$.if(node_3, ($$render) => {
						if ($.get(d)) $$render(consequent_2);
					});
				}

				$.reset(div);

				$.template_effect(
					($0, $1, $2) => {
						$.set_checked(input, $0);
						input.disabled = $.get(busy);
						$.set_attribute(input, 'aria-label', `Allow all ${$1 ?? ''} permissions`);
						$.set_attribute(button, 'aria-expanded', $2);
						$.set_attribute(button, 'aria-controls', `${tierKey() ?? ''}-permissions-list`);
						$.set_text(text_1, note());
					},
					[
						() => tierAllSelected(rows(), selection()),
						() => heading().toLowerCase(),
						() => tierPermissionsOpen(tierKey())
					]
				);

				$.delegated('change', input, (e) => setAllRows(tierKey(), rows(), e.currentTarget.checked));
				$.delegated('click', button, () => toggleTierPermissions(tierKey()));
				$.append($$anchor, div);
			};

			$.if(node, ($$render) => {
				if (rows().length > 0) $$render(consequent_3);
			});
		}

		$.append($$anchor, fragment);
	};

	function hostnameOf(uri) {
		try {
			return new URL(uri).hostname;
		} catch {
			return null;
		}
	}

	let accountLabel = $.prop($$props, 'accountLabel', 3, undefined);
	let error = $.state(null);
	let approving = $.state(false);
	let rejecting = $.state(false);
	let busy = $.derived(() => $.get(approving) || $.get(rejecting));

	// The `scope` param carries every requested privilege. Scopes are shown
	// read-only — the client decides what it asks for. authorization_details
	// binds the project/organization tiers to concrete resources, and that
	// binding is the only thing the user narrows here.
	const scopeModel = $.derived(() => splitConsentScopes($$props.grant.scopes ?? []));

	const details = $.derived(() => parseAuthorizationDetails($$props.grant.authorizationDetails));
	const projectScopesRequested = $.derived(() => $.get(scopeModel).project.all || $.get(scopeModel).project.scopes.length > 0);
	const organizationScopesRequested = $.derived(() => $.get(scopeModel).organization.all || $.get(scopeModel).organization.scopes.length > 0);

	// When a tier's scopes are requested but left unbound, fall back to the
	// wildcard so the user still gets the full resource picker.
	const projectIdentifiers = $.derived(() => {
		const bound = mergeIdentifiers($.get(details), PROJECT_RAR_TYPE);

		if (bound.length > 0) return bound;

		return $.get(projectScopesRequested) ? [WILDCARD_IDENTIFIER] : [];
	});

	const organizationIdentifiers = $.derived(() => {
		const bound = mergeIdentifiers($.get(details), ORGANIZATION_RAR_TYPE);

		if (bound.length > 0) return bound;

		return $.get(organizationScopesRequested) ? [WILDCARD_IDENTIFIER] : [];
	});

	const projectRequested = $.derived(() => $.get(projectScopesRequested) && $.get(projectIdentifiers).length > 0);
	const organizationRequested = $.derived(() => $.get(organizationScopesRequested) && $.get(organizationIdentifiers).length > 0);
	const redirectHost = $.derived(() => hostnameOf($$props.grant.redirectUri));
	const appLogoUrl = $.derived(() => resolveOAuth2AppLogoUrl($$props.app));
	const appInitial = $.derived(() => ($$props.app.name || '?').charAt(0).toUpperCase());
	const accountInitial = $.derived(() => (accountLabel() || '?').charAt(0).toUpperCase());
	const permissionGroups = $.derived(() => buildConsentPermissions($.get(scopeModel)));
	let showPermissions = $.state(true);
	let permissionGroupOpen = $.state($.proxy({}));

	// Account menu — the chip doubles as a trigger for switching accounts.
	let accountMenuOpen = $.state(false);

	let accountMenuEl = $.state(null);

	$.user_effect(() => {
		if (!$.get(accountMenuOpen)) return;

		const onPointerDown = (event) => {
			if ($.get(accountMenuEl) && !$.get(accountMenuEl).contains(event.target)) {
				$.set(accountMenuOpen, false);
			}
		};

		const onKeyDown = (event) => {
			if (event.key === 'Escape') $.set(accountMenuOpen, false);
		};

		window.addEventListener('pointerdown', onPointerDown, true);
		window.addEventListener('keydown', onKeyDown);

		return () => {
			window.removeEventListener('pointerdown', onPointerDown, true);
			window.removeEventListener('keydown', onKeyDown);
		};
	});

	function switchAccount() {
		$.set(accountMenuOpen, false);
		void $$props.onSwitchAccount?.();
	}

	// MCP grants (detected via the grant's RFC 8707 resources) get a narrowing
	// editor: the client requested the full scope catalog, so consent is the
	// control point. Every other grant renders exactly as before — read-only
	// permissions, no scope narrowing.
	const canNarrow = $.derived(() => isMcpGrant($$props.grant));

	// The one thing the user controls: which projects / organizations the tiers
	// are bound to. Defaults to exactly what the client requested; reset on grant
	// change so a stale selection can't leak.
	let projectSelected = $.state($.proxy([]));

	let organizationSelected = $.state($.proxy([]));

	// Scope-narrowing editor state (MCP grants only). Rows absent from a tier's
	// selection are selected with full requested access, so the empty record is
	// the "full access" default.
	let customize = $.state(false);

	let readOnlyAll = $.state(false);
	let projectSelection = $.state($.proxy({}));
	let organizationSelection = $.state($.proxy({}));
	let projectPermissionsOpen = $.state(true);
	let organizationPermissionsOpen = $.state(true);

	$.user_effect(() => {
		$$props.grant.$id;
		$.set(projectSelected, [...$.get(projectIdentifiers)], true);
		$.set(organizationSelected, [...$.get(organizationIdentifiers)], true);
		$.set(customize, false);
		$.set(readOnlyAll, false);
		$.set(projectSelection, {}, true);
		$.set(organizationSelection, {}, true);
		$.set(projectPermissionsOpen, true);
		$.set(organizationPermissionsOpen, true);
		$.set(permissionGroupOpen, {}, true);
	});

	const projectRows = $.derived(() => $.get(canNarrow)
		? buildTierEditorRows($.get(scopeModel).project, PROJECT_SCOPE_PREFIX)
		: []);

	const organizationRows = $.derived(() => $.get(canNarrow)
		? buildTierEditorRows($.get(scopeModel).organization, ORGANIZATION_SCOPE_PREFIX)
		: []);

	function sameIdentifiers(a, b) {
		return a.length === b.length && a.every((id) => b.includes(id));
	}

	const resourcesNarrowed = $.derived(() => !sameIdentifiers($.get(projectSelected), $.get(projectIdentifiers)) || !sameIdentifiers($.get(organizationSelected), $.get(organizationIdentifiers)));

	// The narrowed grant to send on approve. `scope: undefined` means the user
	// kept the full request — the approve call then omits `scope` so the server
	// grants the full literal requested list and re-authorizations skip consent.
	const composed = $.derived(() => $.get(canNarrow)
		? composeGrantedScopes({
			model: $.get(scopeModel),
			project: $.get(projectSelection),
			organization: $.get(organizationSelection),
			readOnly: $.get(readOnlyAll),
			resourcesNarrowed: $.get(resourcesNarrowed)
		})
		: null);

	function rowState(selection, resource) {
		return selection[resource] ?? { selected: true, level: 'full' };
	}

	function updateRow(tier, resource, patch) {
		const selection = tier === 'project'
			? $.get(projectSelection)
			: $.get(organizationSelection);

		const next = {
			...selection,
			[resource]: { ...rowState(selection, resource), ...patch }
		};

		if (tier === 'project') $.set(projectSelection, next, true); else $.set(organizationSelection, next, true);
	}

	function setAllRows(tier, rows, selected) {
		const next = {};

		for (const row of rows) next[row.resource] = { selected, level: 'full' };

		if (tier === 'project') $.set(projectSelection, next, true); else $.set(organizationSelection, next, true);
	}

	function tierAllSelected(rows, selection) {
		return rows.every((row) => rowState(selection, row.resource).selected);
	}

	function tierPermissionsOpen(tier) {
		return tier === 'project'
			? $.get(projectPermissionsOpen)
			: $.get(organizationPermissionsOpen);
	}

	function toggleTierPermissions(tier) {
		if (tier === 'project') $.set(projectPermissionsOpen, !$.get(projectPermissionsOpen)); else $.set(organizationPermissionsOpen, !$.get(organizationPermissionsOpen));
	}

	function togglePermissionGroup(heading) {
		$.set(
			permissionGroupOpen,
			{
				...$.get(permissionGroupOpen),
				[heading]: $.get(permissionGroupOpen)[heading] === false
			},
			true
		);
	}

	const projectGranted = $.derived(() => $.get(projectRequested) && $.get(projectSelected).length > 0);
	const organizationGranted = $.derived(() => $.get(organizationRequested) && $.get(organizationSelected).length > 0);

	// A requested tier must be bound to at least one resource, otherwise its
	// scopes are inert — the app would be "authorized" yet unable to act. Block
	// Authorize until every requested tier has a selection.
	const projectNeedsResource = $.derived(() => $.get(projectRequested) && $.get(projectSelected).length === 0);

	const organizationNeedsResource = $.derived(() => $.get(organizationRequested) && $.get(organizationSelected).length === 0);

	// Authorize stays enabled while SOMETHING is granted and no requested tier is
	// left without a resource.
	const nothingToGrant = $.derived(() => $.get(scopeModel).identity.length === 0 && !$.get(scopeModel).all && !$.get(projectGranted) && !$.get(organizationGranted));

	// With the narrowing editor, the selection must keep at least one
	// non-identity scope — an identity-only grant would leave the app
	// "authorized" but unable to act.
	const nothingSelected = $.derived(() => $.get(composed)?.blocked ?? false);

	const blocked = $.derived(() => $.get(nothingToGrant) || $.get(projectNeedsResource) || $.get(organizationNeedsResource) || $.get(nothingSelected));

	// Resource search wiring. Projects search server-side (there can be many);
	// organizations are few, so they load once and filter client-side.
	function findProjects(term, offset, limit) {
		return searchProjects(term, offset, limit);
	}

	function findOrganizations(term, offset, limit) {
		return searchOrganizations(term, offset, limit);
	}

	function resolveProjects(ids) {
		return resolveProjectNames(ids);
	}

	function resolveOrganizations(ids) {
		return resolveOrganizationNames(ids);
	}

	const summary = $.derived(() => {
		const parts = [];

		if ($.get(scopeModel).identity.length > 0) parts.push('view your identity');
		if ($.get(scopeModel).all) parts.push('fully manage your Appwrite account');
		if ($.get(projectRequested)) parts.push('access the projects you choose');
		if ($.get(organizationRequested)) parts.push('manage the organizations you choose');
		if (parts.length === 0) return `${$$props.app.name} is requesting access to your Appwrite account.`;

		const joined = parts.length === 1
			? parts[0]
			: `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;

		return `This will allow ${$$props.app.name} to ${joined}.`;
	});

	async function approve() {
		if ($.get(busy)) return;

		// Pin the request we're acting on so a mid-flight grant swap can't redirect
		// with the wrong grant's redirectUrl.
		const grantId = $$props.grant.$id;

		$.set(error, null);
		$.set(approving, true);

		try {
			const result = await sdk.forConsole.oauth2.approve({
				grantId,
				// For MCP grants the editor may downscope the requested catalog;
				// `scope` stays omitted when the user kept the full request so
				// the server grants the full literal requested list (keeping the
				// consent-skip diff empty on re-authorization). Non-MCP grants
				// never send `scope` — only the resource binding is narrowed.
				scope: $.get(composed)?.scope,

				// Same consent-skip reasoning for the resource binding: on an
				// MCP grant with untouched pickers, omit `authorizationDetails`
				// so the server keeps exactly what the client requested — the
				// re-auth diff (a hash of requested vs stored details) then
				// stays empty. A narrowed selection is sent and deliberately
				// forces re-consent on the next full request.
				authorizationDetails: $.get(projectRequested) || $.get(organizationRequested)
					? $.get(canNarrow) && !$.get(resourcesNarrowed)
						? undefined
						: serializeGrantedDetails({
							project: $.get(projectGranted) ? $.get(projectSelected) : undefined,
							organization: $.get(organizationGranted) ? $.get(organizationSelected) : undefined
						})
					: undefined
			});

			if ($$props.grant.$id !== grantId) return;

			trackEvent(Submit.AccountOAuth2ConsentApprove, { app_id: $$props.grant.appId, flow: $$props.flow });

			if ($$props.flow === 'device' || !result.redirectUrl) {
				$$props.onDone?.('approved', result.redirectUrl);

				return;
			}

			window.location.href = result.redirectUrl;

			if (!isWebRedirect(result.redirectUrl)) {
				$$props.onDone?.('approved', result.redirectUrl);
			}
		} catch(e) {
			if ($$props.grant.$id !== grantId) return;

			const message = e?.message ?? 'Failed to authorize the application';

			$.set(error, message, true);
			addNotification({ type: 'error', message });
			trackError(e, Submit.AccountOAuth2ConsentApprove);
		} finally {
			$.set(approving, false);
		}
	}

	async function reject() {
		if ($.get(busy)) return;

		const grantId = $$props.grant.$id;

		$.set(error, null);
		$.set(rejecting, true);

		try {
			const result = await sdk.forConsole.oauth2.reject({ grantId });

			if ($$props.grant.$id !== grantId) return;

			trackEvent(Submit.AccountOAuth2ConsentDeny, { app_id: $$props.grant.appId, flow: $$props.flow });

			if ($$props.flow === 'device' || !result.redirectUrl) {
				$$props.onDone?.('denied', result.redirectUrl);

				return;
			}

			window.location.href = result.redirectUrl;

			if (!isWebRedirect(result.redirectUrl)) {
				$$props.onDone?.('denied', result.redirectUrl);
			}
		} catch(e) {
			if ($$props.grant.$id !== grantId) return;

			const message = e?.message ?? 'Failed to cancel the request';

			$.set(error, message, true);
			addNotification({ type: 'error', message });
			trackError(e, Submit.AccountOAuth2ConsentDeny);
		} finally {
			$.set(rejecting, false);
		}
	}

	var fragment_2 = $.comment();
	var node_6 = $.first_child(fragment_2);

	$.component(node_6, () => Card.Base, ($$anchor, Card_Base) => {
		Card_Base($$anchor, {
			padding: 'none',
			radius: 'l',
			style: 'width: 100%; overflow: hidden;',
			children: ($$anchor, $$slotProps) => {
				var div_3 = root_31();
				var header = $.child(div_3);
				var div_4 = $.child(header);
				var node_7 = $.child(div_4);

				{
					var consequent_4 = ($$anchor) => {
						var img = root_6();

						$.template_effect(() => {
							$.set_attribute(img, 'src', $.get(appLogoUrl));
							$.set_attribute(img, 'alt', $$props.app.name);
						});

						$.append($$anchor, img);
					};

					var alternate_1 = ($$anchor) => {
						var div_5 = root_7();
						var text_5 = $.only_child(div_5, true);

						$.template_effect(() => $.set_text(text_5, $.get(appInitial)));
						$.append($$anchor, div_5);
					};

					$.if(node_7, ($$render) => {
						if ($.get(appLogoUrl)) $$render(consequent_4); else $$render(alternate_1, -1);
					});
				}

				var node_8 = $.sibling(node_7, 2);

				{
					var consequent_5 = ($$anchor) => {
						var fragment_3 = root_8();
						var span_7 = $.first_child(fragment_3);
						var span_8 = $.sibling($.child(span_7), 2);
						var node_9 = $.child(span_8);

						Icon(node_9, {
							get icon() {
								return IconLink;
							},
							size: 's'
						});

						$.reset(span_8);
						$.next(2);
						$.reset(span_7);

						var div_6 = $.sibling(span_7, 2);
						var text_6 = $.only_child(div_6, true);

						$.template_effect(() => $.set_text(text_6, $.get(accountInitial)));
						$.append($$anchor, fragment_3);
					};

					$.if(node_8, ($$render) => {
						if (accountLabel()) $$render(consequent_5);
					});
				}

				$.reset(div_4);

				var div_7 = $.sibling(div_4, 2);
				var node_10 = $.child(div_7);

				$.component(node_10, () => Typography.Title, ($$anchor, Typography_Title) => {
					Typography_Title($$anchor, {
						size: 'm',
						align: 'center',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text();

							$.template_effect(() => $.set_text(text_7, `Authorize ${$$props.app.name ?? ''}`));
							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_10, 2);

				$.component(node_11, () => Typography.Text, ($$anchor, Typography_Text_1) => {
					Typography_Text_1($$anchor, {
						variant: 'm-400',
						align: 'center',
						color: '--fgcolor-neutral-secondary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text();

							$.template_effect(() => $.set_text(text_8, $.get(summary)));
							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_7);

				var node_12 = $.sibling(div_7, 2);

				{
					var consequent_8 = ($$anchor) => {
						var fragment_6 = $.comment();
						var node_13 = $.first_child(fragment_6);

						{
							var consequent_7 = ($$anchor) => {
								var div_8 = root_10();
								var button_3 = $.child(div_8);
								let classes_5;
								var span_9 = $.child(button_3);
								var text_9 = $.only_child(span_9, true);
								var span_10 = $.sibling(span_9, 2);
								var text_10 = $.only_child(span_10, true);
								var node_14 = $.sibling(span_10, 2);

								{
									let $0 = $.derived(() => $.get(accountMenuOpen) ? IconChevronUp : IconChevronDown);

									Icon(node_14, {
										get icon() {
											return $.get($0);
										},
										size: 's'
									});
								}

								$.reset(button_3);

								var node_15 = $.sibling(button_3, 2);

								{
									var consequent_6 = ($$anchor) => {
										var div_9 = root_9();
										var div_10 = $.child(div_9);
										var span_11 = $.child(div_10);
										var text_11 = $.only_child(span_11, true);
										var span_12 = $.sibling(span_11, 2);
										var span_13 = $.child(span_12);
										var text_12 = $.only_child(span_13, true);

										$.reset(span_12);

										var span_14 = $.sibling(span_12, 2);
										var node_16 = $.child(span_14);

										Icon(node_16, {
											get icon() {
												return IconCheck;
											},
											size: 's'
										});

										$.reset(span_14);
										$.reset(div_10);

										var button_4 = $.sibling(div_10, 2);
										var span_15 = $.child(button_4);
										var node_17 = $.child(span_15);

										Icon(node_17, {
											get icon() {
												return IconSwitchHorizontal;
											},
											size: 's'
										});

										$.reset(span_15);
										$.next();
										$.reset(button_4);
										$.reset(div_9);

										$.template_effect(() => {
											$.set_text(text_11, $.get(accountInitial));
											$.set_text(text_12, accountLabel());
											button_4.disabled = $.get(busy);
										});

										$.delegated('click', button_4, switchAccount);
										$.append($$anchor, div_9);
									};

									$.if(node_15, ($$render) => {
										if ($.get(accountMenuOpen)) $$render(consequent_6);
									});
								}

								$.reset(div_8);
								$.bind_this(div_8, ($$value) => $.set(accountMenuEl, $$value), () => $.get(accountMenuEl));

								$.template_effect(() => {
									classes_5 = $.set_class(button_3, 1, 'account-chip interactive svelte-1ltsqli', null, classes_5, { open: $.get(accountMenuOpen) });
									button_3.disabled = $.get(busy);
									$.set_attribute(button_3, 'aria-expanded', $.get(accountMenuOpen));
									$.set_text(text_9, $.get(accountInitial));
									$.set_text(text_10, accountLabel());
								});

								$.delegated('click', button_3, () => $.set(accountMenuOpen, !$.get(accountMenuOpen)));
								$.append($$anchor, div_8);
							};

							var alternate_2 = ($$anchor) => {
								var div_11 = root_11();
								var span_16 = $.child(div_11);
								var text_13 = $.only_child(span_16, true);
								var span_17 = $.sibling(span_16, 2);
								var text_14 = $.only_child(span_17, true);

								$.reset(div_11);

								$.template_effect(() => {
									$.set_text(text_13, $.get(accountInitial));
									$.set_text(text_14, accountLabel());
								});

								$.append($$anchor, div_11);
							};

							$.if(node_13, ($$render) => {
								if ($$props.onSwitchAccount) $$render(consequent_7); else $$render(alternate_2, -1);
							});
						}

						$.append($$anchor, fragment_6);
					};

					$.if(node_12, ($$render) => {
						if (accountLabel()) $$render(consequent_8);
					});
				}

				$.reset(header);

				var div_12 = $.sibling(header, 2);
				var node_18 = $.child(div_12);

				{
					var consequent_13 = ($$anchor) => {
						var section = root_16();
						var div_13 = $.child(section);
						var span_18 = $.child(div_13);
						var node_19 = $.child(span_18);

						Icon(node_19, {
							get icon() {
								return IconShieldCheck;
							},
							size: 's'
						});

						$.reset(span_18);

						var span_19 = $.sibling(span_18, 2);
						var node_20 = $.child(span_19);

						$.component(node_20, () => Typography.Text, ($$anchor, Typography_Text_2) => {
							Typography_Text_2($$anchor, {
								variant: 'm-500',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_15 = $.text();

									$.template_effect(() => $.set_text(text_15, $.get(composed)?.untouched ? 'Full access' : 'Custom access'));
									$.append($$anchor, text_15);
								},
								$$slots: { default: true }
							});
						});

						var span_20 = $.sibling(node_20, 2);
						var text_16 = $.only_child(span_20, true);

						$.reset(span_19);
						$.reset(div_13);

						var button_5 = $.sibling(div_13, 2);
						var span_21 = $.child(button_5);
						var span_22 = $.child(span_21);
						var node_21 = $.child(span_22);

						Icon(node_21, {
							get icon() {
								return IconAdjustments;
							},
							size: 's'
						});

						$.reset(span_22);

						var span_23 = $.sibling(span_22, 2);
						var span_24 = $.sibling($.child(span_23), 2);
						var text_17 = $.only_child(span_24);

						$.reset(span_23);
						$.reset(span_21);

						var node_22 = $.sibling(span_21, 2);

						{
							let $0 = $.derived(() => $.get(customize) ? IconChevronUp : IconChevronDown);

							Icon(node_22, {
								get icon() {
									return $.get($0);
								},
								size: 's'
							});
						}

						$.reset(button_5);

						var node_23 = $.sibling(button_5, 2);

						{
							var consequent_12 = ($$anchor) => {
								var div_14 = root_15();
								var label_2 = $.child(div_14);
								var input_2 = $.child(label_2);

								$.remove_input_defaults(input_2);
								$.next(2);
								$.reset(label_2);

								var node_24 = $.sibling(label_2, 2);

								{
									var consequent_9 = ($$anchor) => {
										var span_25 = root_12();
										var text_18 = $.only_child(span_25);

										$.template_effect(
											($0) => $.set_text(text_18, `Basic identity (${$0 ?? ''}) is always shared so ${$$props.app.name ?? ''} can recognize your
                                    account.`),
											[
												() => $.get(scopeModel).identity.map((scope) => scope.id).join(', ')
											]
										);

										$.append($$anchor, span_25);
									};

									$.if(node_24, ($$render) => {
										if ($.get(scopeModel).identity.length > 0) $$render(consequent_9);
									});
								}

								var node_25 = $.sibling(node_24, 2);

								editorGroup(node_25, () => 'project', () => 'Projects', () => 'Applies only to the projects you select below.', () => $.get(projectRows), () => $.get(projectSelection));

								var node_26 = $.sibling(node_25, 2);

								editorGroup(node_26, () => 'organization', () => 'Organizations', () => 'Applies only to the organizations you select below.', () => $.get(organizationRows), () => $.get(organizationSelection));

								var node_27 = $.sibling(node_26, 2);

								{
									var consequent_10 = ($$anchor) => {
										var div_15 = root_13();
										var node_28 = $.child(div_15);

										Icon(node_28, {
											get icon() {
												return IconExclamationCircle;
											},
											size: 's',
											color: '--fgcolor-warning'
										});

										var span_26 = $.sibling(node_28, 2);
										var text_19 = $.only_child(span_26);

										$.reset(div_15);

										$.template_effect(() => $.set_text(text_19, `Select at least one permission, or ${$$props.app.name ?? ''} gets no access
                                        at all.`));

										$.append($$anchor, div_15);
									};

									$.if(node_27, ($$render) => {
										if ($.get(nothingSelected)) $$render(consequent_10);
									});
								}

								var node_29 = $.sibling(node_27, 2);

								{
									var consequent_11 = ($$anchor) => {
										var div_16 = root_14();
										var node_30 = $.child(div_16);

										Icon(node_30, {
											get icon() {
												return IconExclamationCircle;
											},
											size: 's',
											color: '--fgcolor-warning'
										});

										$.next(2);
										$.reset(div_16);
										$.append($$anchor, div_16);
									};

									$.if(node_29, ($$render) => {
										if ($.get(composed)?.lengthCollapsed) $$render(consequent_11);
									});
								}

								$.reset(div_14);
								$.template_effect(() => input_2.disabled = $.get(busy));
								$.bind_checked(input_2, () => $.get(readOnlyAll), ($$value) => $.set(readOnlyAll, $$value));
								$.append($$anchor, div_14);
							};

							$.if(node_23, ($$render) => {
								if ($.get(customize)) $$render(consequent_12);
							});
						}

						$.reset(section);

						$.template_effect(() => {
							$.set_text(text_16, $.get(composed)?.untouched
								? `${$$props.app.name} will be able to manage your organizations, projects, and their data on your behalf.`
								: `${$$props.app.name} only gets the permissions you selected below.`);

							$.set_attribute(button_5, 'aria-expanded', $.get(customize));
							$.set_text(text_17, `You can limit ${$$props.app.name ?? ''} to specific projects and actions.`);
						});

						$.delegated('click', button_5, () => $.set(customize, !$.get(customize)));
						$.append($$anchor, section);
					};

					var consequent_20 = ($$anchor) => {
						var section_1 = root_22();
						var button_6 = $.child(section_1);
						var span_27 = $.child(button_6);
						var node_31 = $.child(span_27);

						Icon(node_31, {
							get icon() {
								return IconLockClosed;
							},
							size: 's'
						});

						var node_32 = $.sibling(node_31, 2);

						$.component(node_32, () => Typography.Text, ($$anchor, Typography_Text_3) => {
							Typography_Text_3($$anchor, {
								variant: 'm-500',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_20 = $.text('Permissions');

									$.append($$anchor, text_20);
								},
								$$slots: { default: true }
							});
						});

						$.reset(span_27);

						var node_33 = $.sibling(span_27, 2);

						{
							let $0 = $.derived(() => $.get(showPermissions) ? IconChevronUp : IconChevronDown);

							Icon(node_33, {
								get icon() {
									return $.get($0);
								},
								size: 's'
							});
						}

						$.reset(button_6);

						var node_34 = $.sibling(button_6, 2);

						{
							var consequent_19 = ($$anchor) => {
								var div_17 = root_21();

								$.each(div_17, 21, () => $.get(permissionGroups), (group) => group.heading, ($$anchor, group) => {
									const collapsible = $.derived(() => $.get(group).collapsible === true);
									var div_18 = root_20();
									var div_19 = $.child(div_18);
									var node_35 = $.child(div_19);

									{
										var consequent_14 = ($$anchor) => {
											var button_7 = root_17();
											var node_36 = $.child(button_7);

											$.component(node_36, () => Typography.Text, ($$anchor, Typography_Text_4) => {
												Typography_Text_4($$anchor, {
													variant: 'm-500',
													color: '--fgcolor-neutral-secondary',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_21 = $.text();

														$.template_effect(() => $.set_text(text_21, $.get(group).heading));
														$.append($$anchor, text_21);
													},
													$$slots: { default: true }
												});
											});

											var node_37 = $.sibling(node_36, 2);

											{
												let $0 = $.derived(() => $.get(permissionGroupOpen)[$.get(group).heading] !== false ? IconChevronUp : IconChevronDown);

												Icon(node_37, {
													get icon() {
														return $.get($0);
													},
													size: 's'
												});
											}

											$.reset(button_7);

											$.template_effect(
												($0) => {
													$.set_attribute(button_7, 'aria-expanded', $.get(permissionGroupOpen)[$.get(group).heading] !== false);
													$.set_attribute(button_7, 'aria-controls', `permission-group-${$0 ?? ''}`);
												},
												[() => $.get(group).heading.toLowerCase()]
											);

											$.delegated('click', button_7, () => togglePermissionGroup($.get(group).heading));
											$.append($$anchor, button_7);
										};

										var alternate_3 = ($$anchor) => {
											var fragment_9 = $.comment();
											var node_38 = $.first_child(fragment_9);

											$.component(node_38, () => Typography.Text, ($$anchor, Typography_Text_5) => {
												Typography_Text_5($$anchor, {
													variant: 'm-500',
													color: '--fgcolor-neutral-secondary',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_22 = $.text();

														$.template_effect(() => $.set_text(text_22, $.get(group).heading));
														$.append($$anchor, text_22);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_9);
										};

										$.if(node_35, ($$render) => {
											if ($.get(collapsible)) $$render(consequent_14); else $$render(alternate_3, -1);
										});
									}

									var node_39 = $.sibling(node_35, 2);

									{
										var consequent_15 = ($$anchor) => {
											var span_28 = root_18();
											var text_23 = $.only_child(span_28, true);

											$.template_effect(() => $.set_text(text_23, $.get(group).note));
											$.append($$anchor, span_28);
										};

										$.if(node_39, ($$render) => {
											if ($.get(group).note) $$render(consequent_15);
										});
									}

									$.reset(div_19);

									var node_40 = $.sibling(div_19, 2);

									{
										var consequent_18 = ($$anchor) => {
											var ul_1 = root_4();

											$.each(ul_1, 21, () => $.get(group).lines, (line) => line.token, ($$anchor, line) => {
												var li_1 = root_19();
												var span_29 = $.child(li_1);
												var node_41 = $.child(span_29);

												Icon(node_41, {
													get icon() {
														return IconCheck;
													},
													size: 's'
												});

												$.reset(span_29);

												var span_30 = $.sibling(span_29, 2);
												var span_31 = $.child(span_30);
												var span_32 = $.child(span_31);
												var text_24 = $.only_child(span_32, true);
												var node_42 = $.sibling(span_32, 2);

												{
													var consequent_16 = ($$anchor) => {
														var span_33 = root_1();
														let classes_6;
														var text_25 = $.only_child(span_33, true);

														$.template_effect(() => {
															classes_6 = $.set_class(span_33, 1, 'access-chip svelte-1ltsqli', null, classes_6, { strong: $.get(line).accessStrong });
															$.set_text(text_25, $.get(line).access);
														});

														$.append($$anchor, span_33);
													};

													$.if(node_42, ($$render) => {
														if ($.get(line).access) $$render(consequent_16);
													});
												}

												$.reset(span_31);

												var node_43 = $.sibling(span_31, 2);

												{
													var consequent_17 = ($$anchor) => {
														var span_34 = root_2();
														var text_26 = $.only_child(span_34, true);

														$.template_effect(() => $.set_text(text_26, $.get(line).description));
														$.append($$anchor, span_34);
													};

													$.if(node_43, ($$render) => {
														if ($.get(line).description) $$render(consequent_17);
													});
												}

												$.reset(span_30);
												$.reset(li_1);
												$.template_effect(() => $.set_text(text_24, $.get(line).title));
												$.append($$anchor, li_1);
											});

											$.reset(ul_1);
											$.template_effect(($0) => $.set_attribute(ul_1, 'id', `permission-group-${$0 ?? ''}`), [() => $.get(group).heading.toLowerCase()]);
											$.append($$anchor, ul_1);
										};

										$.if(node_40, ($$render) => {
											if (!$.get(collapsible) || $.get(permissionGroupOpen)[$.get(group).heading] !== false) $$render(consequent_18);
										});
									}

									$.reset(div_18);
									$.append($$anchor, div_18);
								});

								$.reset(div_17);
								$.append($$anchor, div_17);
							};

							$.if(node_34, ($$render) => {
								if ($.get(showPermissions)) $$render(consequent_19);
							});
						}

						$.reset(section_1);
						$.template_effect(() => $.set_attribute(button_6, 'aria-expanded', $.get(showPermissions)));
						$.delegated('click', button_6, () => $.set(showPermissions, !$.get(showPermissions)));
						$.append($$anchor, section_1);
					};

					$.if(node_18, ($$render) => {
						if ($.get(canNarrow)) $$render(consequent_13); else if ($.get(permissionGroups).length > 0) $$render(consequent_20, 1);
					});
				}

				var node_44 = $.sibling(node_18, 2);

				{
					var consequent_22 = ($$anchor) => {
						var section_2 = root_23();
						let classes_7;
						var div_20 = $.child(section_2);
						var span_35 = $.child(div_20);
						var node_45 = $.child(span_35);

						Icon(node_45, {
							get icon() {
								return IconFolder;
							},
							size: 's'
						});

						$.reset(span_35);

						var span_36 = $.sibling(span_35, 2);
						var node_46 = $.child(span_36);

						$.component(node_46, () => Typography.Text, ($$anchor, Typography_Text_6) => {
							Typography_Text_6($$anchor, {
								variant: 'm-500',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_27 = $.text('Project access');

									$.append($$anchor, text_27);
								},
								$$slots: { default: true }
							});
						});

						var span_37 = $.sibling(node_46, 2);
						var text_28 = $.only_child(span_37);

						$.reset(span_36);
						$.reset(div_20);

						var node_47 = $.sibling(div_20, 2);

						ResourceSelector(node_47, {
							pluralLabel: 'projects',
							get requested() {
								return $.get(projectIdentifiers);
							},
							find: findProjects,
							resolveNames: resolveProjects,
							get disabled() {
								return $.get(busy);
							},

							get selected() {
								return $.get(projectSelected);
							},

							set selected($$value) {
								$.set(projectSelected, $$value, true);
							}
						});

						var node_48 = $.sibling(node_47, 2);

						{
							var consequent_21 = ($$anchor) => {
								var div_21 = root_13();
								var node_49 = $.child(div_21);

								Icon(node_49, {
									get icon() {
										return IconExclamationCircle;
									},
									size: 's',
									color: '--fgcolor-warning'
								});

								var span_38 = $.sibling(node_49, 2);
								var text_29 = $.only_child(span_38);

								$.reset(div_21);
								$.template_effect(() => $.set_text(text_29, `Pick at least one project, or ${$$props.app.name ?? ''} gets no project access.`));
								$.append($$anchor, div_21);
							};

							$.if(node_48, ($$render) => {
								if ($.get(projectNeedsResource)) $$render(consequent_21);
							});
						}

						$.reset(section_2);

						$.template_effect(() => {
							classes_7 = $.set_class(section_2, 1, 'panel scope-panel svelte-1ltsqli', null, classes_7, { 'needs-attention': $.get(projectNeedsResource) });
							$.set_text(text_28, `Choose which projects ${$$props.app.name ?? ''} can access.`);
						});

						$.append($$anchor, section_2);
					};

					$.if(node_44, ($$render) => {
						if ($.get(projectRequested)) $$render(consequent_22);
					});
				}

				var node_50 = $.sibling(node_44, 2);

				{
					var consequent_24 = ($$anchor) => {
						var section_3 = root_23();
						let classes_8;
						var div_22 = $.child(section_3);
						var span_39 = $.child(div_22);
						var node_51 = $.child(span_39);

						Icon(node_51, {
							get icon() {
								return IconOfficeBuilding;
							},
							size: 's'
						});

						$.reset(span_39);

						var span_40 = $.sibling(span_39, 2);
						var node_52 = $.child(span_40);

						$.component(node_52, () => Typography.Text, ($$anchor, Typography_Text_7) => {
							Typography_Text_7($$anchor, {
								variant: 'm-500',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_30 = $.text('Organization access');

									$.append($$anchor, text_30);
								},
								$$slots: { default: true }
							});
						});

						var span_41 = $.sibling(node_52, 2);
						var text_31 = $.only_child(span_41);

						$.reset(span_40);
						$.reset(div_22);

						var node_53 = $.sibling(div_22, 2);

						ResourceSelector(node_53, {
							pluralLabel: 'organizations',
							get requested() {
								return $.get(organizationIdentifiers);
							},
							find: findOrganizations,
							resolveNames: resolveOrganizations,
							get disabled() {
								return $.get(busy);
							},

							get selected() {
								return $.get(organizationSelected);
							},

							set selected($$value) {
								$.set(organizationSelected, $$value, true);
							}
						});

						var node_54 = $.sibling(node_53, 2);

						{
							var consequent_23 = ($$anchor) => {
								var div_23 = root_13();
								var node_55 = $.child(div_23);

								Icon(node_55, {
									get icon() {
										return IconExclamationCircle;
									},
									size: 's',
									color: '--fgcolor-warning'
								});

								var span_42 = $.sibling(node_55, 2);
								var text_32 = $.only_child(span_42);

								$.reset(div_23);
								$.template_effect(() => $.set_text(text_32, `Pick at least one organization, or ${$$props.app.name ?? ''} gets no organization access.`));
								$.append($$anchor, div_23);
							};

							$.if(node_54, ($$render) => {
								if ($.get(organizationNeedsResource)) $$render(consequent_23);
							});
						}

						$.reset(section_3);

						$.template_effect(() => {
							classes_8 = $.set_class(section_3, 1, 'panel scope-panel svelte-1ltsqli', null, classes_8, { 'needs-attention': $.get(organizationNeedsResource) });
							$.set_text(text_31, `Choose which organizations ${$$props.app.name ?? ''} can access.`);
						});

						$.append($$anchor, section_3);
					};

					$.if(node_50, ($$render) => {
						if ($.get(organizationRequested)) $$render(consequent_24);
					});
				}

				var node_56 = $.sibling(node_50, 2);

				{
					var consequent_25 = ($$anchor) => {
						var div_24 = root_24();
						var node_57 = $.child(div_24);

						Icon(node_57, {
							get icon() {
								return IconExclamation;
							},
							size: 's',
							color: '--fgcolor-danger'
						});

						var node_58 = $.sibling(node_57, 2);

						$.component(node_58, () => Typography.Text, ($$anchor, Typography_Text_8) => {
							Typography_Text_8($$anchor, {
								variant: 'm-400',
								color: '--fgcolor-danger',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_33 = $.text();

									$.template_effect(() => $.set_text(text_33, $.get(error)));
									$.append($$anchor, text_33);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_24);
						$.append($$anchor, div_24);
					};

					$.if(node_56, ($$render) => {
						if ($.get(error)) $$render(consequent_25);
					});
				}

				var node_59 = $.sibling(node_56, 2);

				Form(node_59, {
					onSubmit: approve,
					children: ($$anchor, $$slotProps) => {
						var fragment_12 = $.comment();
						var node_60 = $.first_child(fragment_12);

						$.component(node_60, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								gap: 's',
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root_26();
									var node_61 = $.first_child(fragment_13);

									{
										let $0 = $.derived(() => $.get(busy) || $.get(blocked));

										Button(node_61, {
											fullWidth: true,
											submit: true,
											get disabled() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_14 = root_25();
												var node_62 = $.first_child(fragment_14);

												{
													var consequent_26 = ($$anchor) => {
														Spinner($$anchor, { size: 's' });
													};

													var alternate_4 = ($$anchor) => {
														Icon($$anchor, {
															get icon() {
																return IconCheck;
															},
															slot: 'start',
															size: 's'
														});
													};

													$.if(node_62, ($$render) => {
														if ($.get(approving)) $$render(consequent_26); else $$render(alternate_4, -1);
													});
												}

												var text_34 = $.sibling(node_62);

												$.template_effect(() => $.set_text(text_34, ` ${$.get(approving) ? 'Authorizing…' : 'Authorize'}`));
												$.append($$anchor, fragment_14);
											},
											$$slots: { default: true }
										});
									}

									var node_63 = $.sibling(node_61, 2);

									Button(node_63, {
										fullWidth: true,
										secondary: true,
										get disabled() {
											return $.get(busy);
										},
										$$events: { click: reject },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_35 = $.text();

											$.template_effect(() => $.set_text(text_35, $.get(rejecting) ? 'Cancelling…' : 'Cancel'));
											$.append($$anchor, text_35);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_12);
					},
					$$slots: { default: true }
				});

				var p = $.sibling(node_59, 2);
				var span_43 = $.child(p);
				var node_64 = $.child(span_43);

				Icon(node_64, {
					get icon() {
						return IconLockClosed;
					},
					size: 's'
				});

				var node_65 = $.sibling(node_64, 2);

				{
					var consequent_27 = ($$anchor) => {
						var span_44 = root_1();
						var text_36 = $.only_child(span_44);

						$.template_effect(() => $.set_text(text_36, `You'll be returned to ${$.get(redirectHost) ?? ''}`));
						$.append($$anchor, span_44);
					};

					var consequent_28 = ($$anchor) => {
						var span_45 = root_27();

						$.append($$anchor, span_45);
					};

					var alternate_5 = ($$anchor) => {
						var span_46 = root_28();

						$.append($$anchor, span_46);
					};

					$.if(node_65, ($$render) => {
						if ($$props.flow === 'authorization' && $.get(redirectHost)) $$render(consequent_27); else if ($$props.flow === 'device') $$render(consequent_28, 1); else $$render(alternate_5, -1);
					});
				}

				$.reset(span_43);

				var node_66 = $.sibling(span_43, 2);

				{
					var consequent_29 = ($$anchor) => {
						var a_1 = root_29();

						$.template_effect(() => $.set_attribute(a_1, 'href', $$props.app.privacyPolicyUrl));
						$.append($$anchor, a_1);
					};

					$.if(node_66, ($$render) => {
						if ($$props.app.privacyPolicyUrl) $$render(consequent_29);
					});
				}

				var node_67 = $.sibling(node_66, 2);

				{
					var consequent_30 = ($$anchor) => {
						var a_2 = root_30();

						$.template_effect(() => $.set_attribute(a_2, 'href', $$props.app.termsUrl));
						$.append($$anchor, a_2);
					};

					$.if(node_67, ($$render) => {
						if ($$props.app.termsUrl) $$render(consequent_30);
					});
				}

				$.reset(p);
				$.reset(div_12);
				$.reset(div_3);
				$.append($$anchor, div_3);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_2);
	$.pop();
}

$.delegate(['change', 'click']);
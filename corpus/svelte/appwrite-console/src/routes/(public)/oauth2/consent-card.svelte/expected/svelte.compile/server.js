import * as $ from 'svelte/internal/server';
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

export default function Consent_card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function hostnameOf(uri) {
			try {
				return new URL(uri).hostname;
			} catch {
				return null;
			}
		}

		let {
			grant,
			app,
			accountLabel = undefined,
			flow,
			onDone,
			onSwitchAccount
		} = $$props;

		let error = null;
		let approving = false;
		let rejecting = false;
		let busy = $.derived(() => approving || rejecting);

		// The `scope` param carries every requested privilege. Scopes are shown
		// read-only — the client decides what it asks for. authorization_details
		// binds the project/organization tiers to concrete resources, and that
		// binding is the only thing the user narrows here.
		const scopeModel = $.derived(() => splitConsentScopes(grant.scopes ?? []));

		const details = $.derived(() => parseAuthorizationDetails(grant.authorizationDetails));
		const projectScopesRequested = $.derived(() => scopeModel().project.all || scopeModel().project.scopes.length > 0);
		const organizationScopesRequested = $.derived(() => scopeModel().organization.all || scopeModel().organization.scopes.length > 0);

		// When a tier's scopes are requested but left unbound, fall back to the
		// wildcard so the user still gets the full resource picker.
		const projectIdentifiers = $.derived(() => {
			const bound = mergeIdentifiers(details(), PROJECT_RAR_TYPE);

			if (bound.length > 0) return bound;

			return projectScopesRequested() ? [WILDCARD_IDENTIFIER] : [];
		});

		const organizationIdentifiers = $.derived(() => {
			const bound = mergeIdentifiers(details(), ORGANIZATION_RAR_TYPE);

			if (bound.length > 0) return bound;

			return organizationScopesRequested() ? [WILDCARD_IDENTIFIER] : [];
		});

		const projectRequested = $.derived(() => projectScopesRequested() && projectIdentifiers().length > 0);
		const organizationRequested = $.derived(() => organizationScopesRequested() && organizationIdentifiers().length > 0);
		const redirectHost = $.derived(() => hostnameOf(grant.redirectUri));
		const appLogoUrl = $.derived(() => resolveOAuth2AppLogoUrl(app));
		const appInitial = $.derived(() => (app.name || '?').charAt(0).toUpperCase());
		const accountInitial = $.derived(() => (accountLabel || '?').charAt(0).toUpperCase());
		const permissionGroups = $.derived(() => buildConsentPermissions(scopeModel()));
		let showPermissions = true;
		let permissionGroupOpen = {};

		// Account menu — the chip doubles as a trigger for switching accounts.
		let accountMenuOpen = false;

		let accountMenuEl = null;

		function switchAccount() {
			accountMenuOpen = false;
			void onSwitchAccount?.();
		}

		// MCP grants (detected via the grant's RFC 8707 resources) get a narrowing
		// editor: the client requested the full scope catalog, so consent is the
		// control point. Every other grant renders exactly as before — read-only
		// permissions, no scope narrowing.
		const canNarrow = $.derived(() => isMcpGrant(grant));

		// The one thing the user controls: which projects / organizations the tiers
		// are bound to. Defaults to exactly what the client requested; reset on grant
		// change so a stale selection can't leak.
		let projectSelected = [];

		let organizationSelected = [];

		// Scope-narrowing editor state (MCP grants only). Rows absent from a tier's
		// selection are selected with full requested access, so the empty record is
		// the "full access" default.
		let customize = false;

		let readOnlyAll = false;
		let projectSelection = {};
		let organizationSelection = {};
		let projectPermissionsOpen = true;
		let organizationPermissionsOpen = true;

		const projectRows = $.derived(() => canNarrow()
			? buildTierEditorRows(scopeModel().project, PROJECT_SCOPE_PREFIX)
			: []);

		const organizationRows = $.derived(() => canNarrow()
			? buildTierEditorRows(scopeModel().organization, ORGANIZATION_SCOPE_PREFIX)
			: []);

		function sameIdentifiers(a, b) {
			return a.length === b.length && a.every((id) => b.includes(id));
		}

		const resourcesNarrowed = $.derived(() => !sameIdentifiers(projectSelected, projectIdentifiers()) || !sameIdentifiers(organizationSelected, organizationIdentifiers()));

		// The narrowed grant to send on approve. `scope: undefined` means the user
		// kept the full request — the approve call then omits `scope` so the server
		// grants the full literal requested list and re-authorizations skip consent.
		const composed = $.derived(() => canNarrow()
			? composeGrantedScopes({
				model: scopeModel(),
				project: projectSelection,
				organization: organizationSelection,
				readOnly: readOnlyAll,
				resourcesNarrowed: resourcesNarrowed()
			})
			: null);

		function rowState(selection, resource) {
			return selection[resource] ?? { selected: true, level: 'full' };
		}

		function updateRow(tier, resource, patch) {
			const selection = tier === 'project' ? projectSelection : organizationSelection;

			const next = {
				...selection,
				[resource]: { ...rowState(selection, resource), ...patch }
			};

			if (tier === 'project') projectSelection = next; else organizationSelection = next;
		}

		function setAllRows(tier, rows, selected) {
			const next = {};

			for (const row of rows) next[row.resource] = { selected, level: 'full' };

			if (tier === 'project') projectSelection = next; else organizationSelection = next;
		}

		function tierAllSelected(rows, selection) {
			return rows.every((row) => rowState(selection, row.resource).selected);
		}

		function tierPermissionsOpen(tier) {
			return tier === 'project' ? projectPermissionsOpen : organizationPermissionsOpen;
		}

		function toggleTierPermissions(tier) {
			if (tier === 'project') projectPermissionsOpen = !projectPermissionsOpen; else organizationPermissionsOpen = !organizationPermissionsOpen;
		}

		function togglePermissionGroup(heading) {
			permissionGroupOpen = {
				...permissionGroupOpen,
				[heading]: permissionGroupOpen[heading] === false
			};
		}

		const projectGranted = $.derived(() => projectRequested() && projectSelected.length > 0);
		const organizationGranted = $.derived(() => organizationRequested() && organizationSelected.length > 0);

		// A requested tier must be bound to at least one resource, otherwise its
		// scopes are inert — the app would be "authorized" yet unable to act. Block
		// Authorize until every requested tier has a selection.
		const projectNeedsResource = $.derived(() => projectRequested() && projectSelected.length === 0);

		const organizationNeedsResource = $.derived(() => organizationRequested() && organizationSelected.length === 0);

		// Authorize stays enabled while SOMETHING is granted and no requested tier is
		// left without a resource.
		const nothingToGrant = $.derived(() => scopeModel().identity.length === 0 && !scopeModel().all && !projectGranted() && !organizationGranted());

		// With the narrowing editor, the selection must keep at least one
		// non-identity scope — an identity-only grant would leave the app
		// "authorized" but unable to act.
		const nothingSelected = $.derived(() => composed()?.blocked ?? false);

		const blocked = $.derived(() => nothingToGrant() || projectNeedsResource() || organizationNeedsResource() || nothingSelected());

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

			if (scopeModel().identity.length > 0) parts.push('view your identity');
			if (scopeModel().all) parts.push('fully manage your Appwrite account');
			if (projectRequested()) parts.push('access the projects you choose');
			if (organizationRequested()) parts.push('manage the organizations you choose');
			if (parts.length === 0) return `${app.name} is requesting access to your Appwrite account.`;

			const joined = parts.length === 1
				? parts[0]
				: `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;

			return `This will allow ${app.name} to ${joined}.`;
		});

		async function approve() {
			if (busy()) return;

			// Pin the request we're acting on so a mid-flight grant swap can't redirect
			// with the wrong grant's redirectUrl.
			const grantId = grant.$id;

			error = null;
			approving = true;

			try {
				const result = await sdk.forConsole.oauth2.approve({
					grantId,
					// For MCP grants the editor may downscope the requested catalog;
					// `scope` stays omitted when the user kept the full request so
					// the server grants the full literal requested list (keeping the
					// consent-skip diff empty on re-authorization). Non-MCP grants
					// never send `scope` — only the resource binding is narrowed.
					scope: composed()?.scope,

					// Same consent-skip reasoning for the resource binding: on an
					// MCP grant with untouched pickers, omit `authorizationDetails`
					// so the server keeps exactly what the client requested — the
					// re-auth diff (a hash of requested vs stored details) then
					// stays empty. A narrowed selection is sent and deliberately
					// forces re-consent on the next full request.
					authorizationDetails: projectRequested() || organizationRequested()
						? canNarrow() && !resourcesNarrowed()
							? undefined
							: serializeGrantedDetails({
								project: projectGranted() ? projectSelected : undefined,
								organization: organizationGranted() ? organizationSelected : undefined
							})
						: undefined
				});

				if (grant.$id !== grantId) return;

				trackEvent(Submit.AccountOAuth2ConsentApprove, { app_id: grant.appId, flow });

				if (flow === 'device' || !result.redirectUrl) {
					onDone?.('approved', result.redirectUrl);

					return;
				}

				window.location.href = result.redirectUrl;

				if (!isWebRedirect(result.redirectUrl)) {
					onDone?.('approved', result.redirectUrl);
				}
			} catch(e) {
				if (grant.$id !== grantId) return;

				const message = e?.message ?? 'Failed to authorize the application';

				error = message;
				addNotification({ type: 'error', message });
				trackError(e, Submit.AccountOAuth2ConsentApprove);
			} finally {
				approving = false;
			}
		}

		async function reject() {
			if (busy()) return;

			const grantId = grant.$id;

			error = null;
			rejecting = true;

			try {
				const result = await sdk.forConsole.oauth2.reject({ grantId });

				if (grant.$id !== grantId) return;

				trackEvent(Submit.AccountOAuth2ConsentDeny, { app_id: grant.appId, flow });

				if (flow === 'device' || !result.redirectUrl) {
					onDone?.('denied', result.redirectUrl);

					return;
				}

				window.location.href = result.redirectUrl;

				if (!isWebRedirect(result.redirectUrl)) {
					onDone?.('denied', result.redirectUrl);
				}
			} catch(e) {
				if (grant.$id !== grantId) return;

				const message = e?.message ?? 'Failed to cancel the request';

				error = message;
				addNotification({ type: 'error', message });
				trackError(e, Submit.AccountOAuth2ConsentDeny);
			} finally {
				rejecting = false;
			}
		}

		function editorGroup($$renderer, tierKey, heading, note, rows, selection) {
			if (rows.length > 0) {
				$$renderer.push(`<!--[0--><div class="perm-group svelte-1ltsqli"><div class="perm-group-head svelte-1ltsqli"><div class="perm-group-heading-row svelte-1ltsqli"><label class="editor-check group-check svelte-1ltsqli"><input type="checkbox"${$.attr('checked', tierAllSelected(rows, selection), true)}${$.attr('disabled', busy(), true)}${$.attr('aria-label', `Allow all ${$.stringify(heading.toLowerCase())} permissions`)} class="svelte-1ltsqli"/></label> <button type="button" class="perm-group-toggle svelte-1ltsqli"${$.attr('aria-expanded', tierPermissionsOpen(tierKey))}${$.attr('aria-controls', `${$.stringify(tierKey)}-permissions-list`)}>`);

				if (Typography.Text) {
					$$renderer.push('<!--[-->');

					Typography.Text($$renderer, {
						variant: 'm-500',
						color: '--fgcolor-neutral-secondary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(heading)}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				Icon($$renderer, {
					icon: tierPermissionsOpen(tierKey) ? IconChevronUp : IconChevronDown,
					size: 's'
				});

				$$renderer.push(`<!----></button></div> <span class="subtext svelte-1ltsqli">${$.escape(note)}</span></div> `);

				if (tierPermissionsOpen(tierKey)) {
					$$renderer.push(`<!--[0--><ul class="perm-list svelte-1ltsqli"${$.attr('id', `${$.stringify(tierKey)}-permissions-list`)}><!--[-->`);

					const each_array = $.ensure_array_like(rows);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let row = each_array[$$index];
						const state = rowState(selection, row.resource);

						$$renderer.push(`<li${$.attr_class('perm editor-row svelte-1ltsqli', void 0, { 'off': !state.selected })}><label class="editor-check svelte-1ltsqli"><input type="checkbox"${$.attr('checked', state.selected, true)}${$.attr('disabled', busy(), true)}${$.attr('aria-label', `Allow access to ${$.stringify(row.title)}`)} class="svelte-1ltsqli"/></label> <span class="perm-text svelte-1ltsqli"><span class="perm-row-head svelte-1ltsqli"><span class="perm-title svelte-1ltsqli">${$.escape(row.title)}</span> `);

						if (row.hasRead && row.hasWrite) {
							$$renderer.push(`<!--[0--><span${$.attr_class('level-toggle svelte-1ltsqli', void 0, { 'disabled': !state.selected })}><button type="button"${$.attr_class('level-btn svelte-1ltsqli', void 0, { 'active': state.level === 'read' || readOnlyAll })}${$.attr('disabled', busy() || !state.selected, true)}>Read</button> <button type="button"${$.attr_class('level-btn svelte-1ltsqli', void 0, { 'active': state.level === 'full' && !readOnlyAll })}${$.attr('disabled', busy() || !state.selected || readOnlyAll, true)}>Read + Write</button></span>`);
						} else {
							$$renderer.push(`<!--[-1--><span${$.attr_class('access-chip svelte-1ltsqli', void 0, { 'strong': row.accessStrong })}>${$.escape(row.access)}</span>`);
						}

						$$renderer.push(`<!--]--></span> `);

						if (row.description) {
							$$renderer.push(`<!--[0--><span class="perm-desc svelte-1ltsqli">${$.escape(row.description)}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></span></li>`);
					}

					$$renderer.push(`<!--]--></ul>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Base) {
				$$renderer.push('<!--[-->');

				Card.Base($$renderer, {
					padding: 'none',
					radius: 'l',
					style: 'width: 100%; overflow: hidden;',
					children: ($$renderer) => {
						$$renderer.push(`<div class="consent svelte-1ltsqli"><header class="header svelte-1ltsqli"><div class="identity svelte-1ltsqli">`);

						if (appLogoUrl()) {
							$$renderer.push(`<!--[0--><img${$.attr('src', appLogoUrl())}${$.attr('alt', app.name)} class="avatar svelte-1ltsqli"/>`);
						} else {
							$$renderer.push(`<!--[-1--><div class="avatar placeholder svelte-1ltsqli">${$.escape(appInitial())}</div>`);
						}

						$$renderer.push(`<!--]--> `);

						if (accountLabel) {
							$$renderer.push(`<!--[0--><span class="connector svelte-1ltsqli"><span class="connector-line svelte-1ltsqli"></span> <span class="connector-node svelte-1ltsqli">`);
							Icon($$renderer, { icon: IconLink, size: 's' });
							$$renderer.push(`<!----></span> <span class="connector-line svelte-1ltsqli"></span></span> <div class="avatar account svelte-1ltsqli">${$.escape(accountInitial())}</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="headline svelte-1ltsqli">`);

						if (Typography.Title) {
							$$renderer.push('<!--[-->');

							Typography.Title($$renderer, {
								size: 'm',
								align: 'center',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Authorize ${$.escape(app.name)}`);
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
								color: '--fgcolor-neutral-secondary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(summary())}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div> `);

						if (accountLabel) {
							$$renderer.push('<!--[0-->');

							if (onSwitchAccount) {
								$$renderer.push(`<!--[0--><div class="account-menu svelte-1ltsqli"><button type="button"${$.attr_class('account-chip interactive svelte-1ltsqli', void 0, { 'open': accountMenuOpen })}${$.attr('disabled', busy(), true)} aria-haspopup="menu"${$.attr('aria-expanded', accountMenuOpen)}><span class="account-avatar svelte-1ltsqli">${$.escape(accountInitial())}</span> <span class="account-label svelte-1ltsqli">${$.escape(accountLabel)}</span> `);

								Icon($$renderer, {
									icon: accountMenuOpen ? IconChevronUp : IconChevronDown,
									size: 's'
								});

								$$renderer.push(`<!----></button> `);

								if (accountMenuOpen) {
									$$renderer.push(`<!--[0--><div class="account-dropdown svelte-1ltsqli" role="menu"><div class="account-dropdown-current svelte-1ltsqli"><span class="account-avatar large svelte-1ltsqli">${$.escape(accountInitial())}</span> <span class="account-dropdown-text svelte-1ltsqli"><span class="account-dropdown-label svelte-1ltsqli">${$.escape(accountLabel)}</span></span> <span class="account-dropdown-check svelte-1ltsqli">`);
									Icon($$renderer, { icon: IconCheck, size: 's' });
									$$renderer.push(`<!----></span></div> <button type="button" class="account-dropdown-action svelte-1ltsqli" role="menuitem"${$.attr('disabled', busy(), true)}><span class="account-dropdown-action-icon svelte-1ltsqli">`);
									Icon($$renderer, { icon: IconSwitchHorizontal, size: 's' });
									$$renderer.push(`<!----></span> Use a different account</button></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div>`);
							} else {
								$$renderer.push(`<!--[-1--><div class="account-chip svelte-1ltsqli"><span class="account-avatar svelte-1ltsqli">${$.escape(accountInitial())}</span> <span class="account-label svelte-1ltsqli">${$.escape(accountLabel)}</span></div>`);
							}

							$$renderer.push(`<!--]-->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></header> <div class="body svelte-1ltsqli">`);

						if (canNarrow()) {
							$$renderer.push(`<!--[0--><section class="panel editor-panel svelte-1ltsqli"><div class="access-summary svelte-1ltsqli"><span class="scope-icon svelte-1ltsqli">`);
							Icon($$renderer, { icon: IconShieldCheck, size: 's' });
							$$renderer.push(`<!----></span> <span class="scope-head-text svelte-1ltsqli">`);

							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									variant: 'm-500',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(composed()?.untouched ? 'Full access' : 'Custom access')}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <span class="subtext svelte-1ltsqli">${$.escape(composed()?.untouched
								? `${app.name} will be able to manage your organizations, projects, and their data on your behalf.`
								: `${app.name} only gets the permissions you selected below.`)}</span></span></div> <button type="button" class="customize-head svelte-1ltsqli"${$.attr('aria-expanded', customize)}><span class="customize-label svelte-1ltsqli"><span class="customize-icon svelte-1ltsqli">`);

							Icon($$renderer, { icon: IconAdjustments, size: 's' });
							$$renderer.push(`<!----></span> <span class="scope-head-text svelte-1ltsqli"><span class="perm-title svelte-1ltsqli">Customize access</span> <span class="subtext svelte-1ltsqli">You can limit ${$.escape(app.name)} to specific projects and actions.</span></span></span> `);
							Icon($$renderer, { icon: customize ? IconChevronUp : IconChevronDown, size: 's' });
							$$renderer.push(`<!----></button> `);

							if (customize) {
								$$renderer.push(`<!--[0--><div class="editor-body svelte-1ltsqli"><label class="editor-readonly svelte-1ltsqli"><input type="checkbox"${$.attr('checked', readOnlyAll, true)}${$.attr('disabled', busy(), true)} class="svelte-1ltsqli"/> <span class="perm-text svelte-1ltsqli"><span class="perm-title svelte-1ltsqli">Read-only</span> <span class="subtext svelte-1ltsqli">Limit every selected permission to viewing data — nothing
                                        can be created, changed, or deleted.</span></span></label> `);

								if (scopeModel().identity.length > 0) {
									$$renderer.push(`<!--[0--><span class="subtext editor-identity svelte-1ltsqli">Basic identity (${$.escape(scopeModel().identity.map((scope) => scope.id).join(', '))}) is always shared so ${$.escape(app.name)} can recognize your
                                    account.</span>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);
								editorGroup($$renderer, 'project', 'Projects', 'Applies only to the projects you select below.', projectRows(), projectSelection);
								$$renderer.push(`<!----> `);
								editorGroup($$renderer, 'organization', 'Organizations', 'Applies only to the organizations you select below.', organizationRows(), organizationSelection);
								$$renderer.push(`<!----> `);

								if (nothingSelected()) {
									$$renderer.push(`<!--[0--><div class="scope-warning svelte-1ltsqli">`);

									Icon($$renderer, {
										icon: IconExclamationCircle,
										size: 's',
										color: '--fgcolor-warning'
									});

									$$renderer.push(`<!----> <span>Select at least one permission, or ${$.escape(app.name)} gets no access
                                        at all.</span></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--> `);

								if (composed()?.lengthCollapsed) {
									$$renderer.push(`<!--[0--><div class="scope-warning svelte-1ltsqli">`);

									Icon($$renderer, {
										icon: IconExclamationCircle,
										size: 's',
										color: '--fgcolor-warning'
									});

									$$renderer.push(`<!----> <span>Your selection was too long to grant scope-by-scope, so a
                                        fully selected tier was granted as full tier access instead.</span></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></section>`);
						} else if (permissionGroups().length > 0) {
							$$renderer.push(`<!--[1--><section class="panel svelte-1ltsqli"><button type="button" class="panel-head svelte-1ltsqli"${$.attr('aria-expanded', showPermissions)}><span class="panel-head-label svelte-1ltsqli">`);
							Icon($$renderer, { icon: IconLockClosed, size: 's' });
							$$renderer.push(`<!----> `);

							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									variant: 'm-500',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Permissions`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</span> `);

							Icon($$renderer, {
								icon: showPermissions ? IconChevronUp : IconChevronDown,
								size: 's'
							});

							$$renderer.push(`<!----></button> `);

							if (showPermissions) {
								$$renderer.push(`<!--[0--><div class="panel-body svelte-1ltsqli"><!--[-->`);

								const each_array_1 = $.ensure_array_like(permissionGroups());

								for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
									let group = each_array_1[$$index_2];
									const collapsible = group.collapsible === true;

									$$renderer.push(`<div class="perm-group svelte-1ltsqli"><div class="perm-group-head svelte-1ltsqli">`);

									if (collapsible) {
										$$renderer.push(`<!--[0--><button type="button" class="permission-group-toggle svelte-1ltsqli"${$.attr('aria-expanded', permissionGroupOpen[group.heading] !== false)}${$.attr('aria-controls', `permission-group-${$.stringify(group.heading.toLowerCase())}`)}>`);

										if (Typography.Text) {
											$$renderer.push('<!--[-->');

											Typography.Text($$renderer, {
												variant: 'm-500',
												color: '--fgcolor-neutral-secondary',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(group.heading)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										Icon($$renderer, {
											icon: permissionGroupOpen[group.heading] !== false ? IconChevronUp : IconChevronDown,
											size: 's'
										});

										$$renderer.push(`<!----></button>`);
									} else {
										$$renderer.push('<!--[-1-->');

										if (Typography.Text) {
											$$renderer.push('<!--[-->');

											Typography.Text($$renderer, {
												variant: 'm-500',
												color: '--fgcolor-neutral-secondary',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(group.heading)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]--> `);

									if (group.note) {
										$$renderer.push(`<!--[0--><span class="subtext svelte-1ltsqli">${$.escape(group.note)}</span>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div> `);

									if (!collapsible || permissionGroupOpen[group.heading] !== false) {
										$$renderer.push(`<!--[0--><ul class="perm-list svelte-1ltsqli"${$.attr('id', `permission-group-${$.stringify(group.heading.toLowerCase())}`)}><!--[-->`);

										const each_array_2 = $.ensure_array_like(group.lines);

										for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
											let line = each_array_2[$$index_1];

											$$renderer.push(`<li class="perm svelte-1ltsqli"><span class="perm-check svelte-1ltsqli">`);
											Icon($$renderer, { icon: IconCheck, size: 's' });
											$$renderer.push(`<!----></span> <span class="perm-text svelte-1ltsqli"><span class="perm-row-head svelte-1ltsqli"><span class="perm-title svelte-1ltsqli">${$.escape(line.title)}</span> `);

											if (line.access) {
												$$renderer.push(`<!--[0--><span${$.attr_class('access-chip svelte-1ltsqli', void 0, { 'strong': line.accessStrong })}>${$.escape(line.access)}</span>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></span> `);

											if (line.description) {
												$$renderer.push(`<!--[0--><span class="perm-desc svelte-1ltsqli">${$.escape(line.description)}</span>`);
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--></span></li>`);
										}

										$$renderer.push(`<!--]--></ul>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></div>`);
								}

								$$renderer.push(`<!--]--></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></section>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (projectRequested()) {
							$$renderer.push(`<!--[0--><section${$.attr_class('panel scope-panel svelte-1ltsqli', void 0, { 'needs-attention': projectNeedsResource() })}><div class="scope-head svelte-1ltsqli"><span class="scope-icon svelte-1ltsqli">`);
							Icon($$renderer, { icon: IconFolder, size: 's' });
							$$renderer.push(`<!----></span> <span class="scope-head-text svelte-1ltsqli">`);

							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									variant: 'm-500',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Project access`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <span class="subtext svelte-1ltsqli">Choose which projects ${$.escape(app.name)} can access.</span></span></div> `);

							ResourceSelector($$renderer, {
								pluralLabel: 'projects',
								requested: projectIdentifiers(),
								find: findProjects,
								resolveNames: resolveProjects,
								disabled: busy(),
								get selected() {
									return projectSelected;
								},

								set selected($$value) {
									projectSelected = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							if (projectNeedsResource()) {
								$$renderer.push(`<!--[0--><div class="scope-warning svelte-1ltsqli">`);

								Icon($$renderer, {
									icon: IconExclamationCircle,
									size: 's',
									color: '--fgcolor-warning'
								});

								$$renderer.push(`<!----> <span>Pick at least one project, or ${$.escape(app.name)} gets no project access.</span></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></section>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (organizationRequested()) {
							$$renderer.push(`<!--[0--><section${$.attr_class('panel scope-panel svelte-1ltsqli', void 0, { 'needs-attention': organizationNeedsResource() })}><div class="scope-head svelte-1ltsqli"><span class="scope-icon svelte-1ltsqli">`);
							Icon($$renderer, { icon: IconOfficeBuilding, size: 's' });
							$$renderer.push(`<!----></span> <span class="scope-head-text svelte-1ltsqli">`);

							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									variant: 'm-500',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Organization access`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <span class="subtext svelte-1ltsqli">Choose which organizations ${$.escape(app.name)} can access.</span></span></div> `);

							ResourceSelector($$renderer, {
								pluralLabel: 'organizations',
								requested: organizationIdentifiers(),
								find: findOrganizations,
								resolveNames: resolveOrganizations,
								disabled: busy(),
								get selected() {
									return organizationSelected;
								},

								set selected($$value) {
									organizationSelected = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----> `);

							if (organizationNeedsResource()) {
								$$renderer.push(`<!--[0--><div class="scope-warning svelte-1ltsqli">`);

								Icon($$renderer, {
									icon: IconExclamationCircle,
									size: 's',
									color: '--fgcolor-warning'
								});

								$$renderer.push(`<!----> <span>Pick at least one organization, or ${$.escape(app.name)} gets no organization access.</span></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></section>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (error) {
							$$renderer.push(`<!--[0--><div class="error-box svelte-1ltsqli">`);
							Icon($$renderer, { icon: IconExclamation, size: 's', color: '--fgcolor-danger' });
							$$renderer.push(`<!----> `);

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

							$$renderer.push(`</div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						Form($$renderer, {
							onSubmit: approve,
							children: ($$renderer) => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										gap: 's',
										children: ($$renderer) => {
											Button($$renderer, {
												fullWidth: true,
												submit: true,
												disabled: busy() || blocked(),
												children: ($$renderer) => {
													if (approving) {
														$$renderer.push('<!--[0-->');
														Spinner($$renderer, { size: 's' });
													} else {
														$$renderer.push('<!--[-1-->');
														Icon($$renderer, { icon: IconCheck, slot: 'start', size: 's' });
													}

													$$renderer.push(`<!--]--> ${$.escape(approving ? 'Authorizing…' : 'Authorize')}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Button($$renderer, {
												fullWidth: true,
												secondary: true,
												disabled: busy(),
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(rejecting ? 'Cancelling…' : 'Cancel')}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
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

						$$renderer.push(`<!----> <p class="footnote svelte-1ltsqli"><span class="footnote-secure svelte-1ltsqli">`);
						Icon($$renderer, { icon: IconLockClosed, size: 's' });
						$$renderer.push(`<!----> `);

						if (flow === 'authorization' && redirectHost()) {
							$$renderer.push(`<!--[0--><span>You'll be returned to ${$.escape(redirectHost())}</span>`);
						} else if (flow === 'device') {
							$$renderer.push(`<!--[1--><span>After authorizing, return to your device</span>`);
						} else {
							$$renderer.push(`<!--[-1--><span>You can revoke access anytime</span>`);
						}

						$$renderer.push(`<!--]--></span> `);

						if (app.privacyPolicyUrl) {
							$$renderer.push(`<!--[0--><a${$.attr('href', app.privacyPolicyUrl)} target="_blank" rel="noreferrer" class="footer-link svelte-1ltsqli">Privacy</a>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (app.termsUrl) {
							$$renderer.push(`<!--[0--><a${$.attr('href', app.termsUrl)} target="_blank" rel="noreferrer" class="footer-link svelte-1ltsqli">Terms</a>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></p></div></div>`);
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
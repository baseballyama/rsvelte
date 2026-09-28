import * as $ from 'svelte/internal/server';
import { sdk } from '$lib/stores/sdk';
import { ID } from '@appwrite.io/console';
import { onMount } from 'svelte';
import { addNotification } from '$lib/stores/notifications';
import { project } from '../store';
import { Container } from '$lib/layout';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import UpdateName from './updateName.svelte';
import UpdateProtocols from './updateProtocols.svelte';
import UpdateServices from './updateServices.svelte';
import UpdateInstallations from './updateInstallations.svelte';
import DeleteProject from './deleteProject.svelte';
import { Submit, trackEvent } from '$lib/actions/analytics';
import { canWriteProjects } from '$lib/stores/roles';
import ChangeOrganization from './changeOrganization.svelte';
import UpdateVariables from '../updateVariables.svelte';
import { page } from '$app/state';
import UpdateLabels from './updateLabels.svelte';
import PremiumGeoDB from './premiumGeoDB.svelte';
import UpdateOAuth2Server from './updateOAuth2Server.svelte';
import { isCloud } from '$lib/system';
import { Alert } from '@appwrite.io/pink-svelte';
import { flags } from '$lib/flags';
import { user } from '$lib/stores/user';
import { organization } from '$lib/stores/organization';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;

		onMount(() => {
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);
			const alert = urlParams.get('alert') ?? '';
			let notified = false;

			if (alert === 'installation-created') {
				addNotification({
					type: 'success',
					message: `Git installation has imported to your project`
				});

				trackEvent(Submit.InstallationCreate);
				notified = true;
			} else if (alert === 'installation-updated') {
				addNotification({
					type: 'success',
					message: `Git installation has been successfully updated`
				});

				trackEvent(Submit.InstallationCreate);
				notified = true;
			}

			if (notified) {
				window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
			}
		});

		async function sdkCreateVariable(key, value, secret) {
			await sdk.forProject(page.params.region, page.params.project).projectApi.createVariable({ variableId: ID.unique(), key, value, secret });
			await invalidate(Dependencies.PROJECT_VARIABLES);
		}

		async function sdkUpdateVariable(variableId, key, value, secret) {
			await sdk.forProject(page.params.region, page.params.project).projectApi.updateVariable({ variableId, key, value, secret });
			await invalidate(Dependencies.PROJECT_VARIABLES);
		}

		async function sdkDeleteVariable(variableId) {
			await sdk.forProject(page.params.region, page.params.project).projectApi.deleteVariable({ variableId });
			await invalidate(Dependencies.PROJECT_VARIABLES);
		}

		Container($$renderer, {
			children: ($$renderer) => {
				if ($.store_get($$store_subs ??= {}, '$project', project)) {
					$$renderer.push('<!--[0-->');

					if (!$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects)) {
						$$renderer.push('<!--[0-->');

						if (Alert.Inline) {
							$$renderer.push('<!--[-->');

							Alert.Inline($$renderer, {
								status: 'info',
								title: 'Read-only project settings',
								children: ($$renderer) => {
									$$renderer.push(`<!---->You can open this settings area, but editing project-level settings requires the <code>projects.write</code> scope.`);
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

					$$renderer.push(`<!--]--> `);
					UpdateName($$renderer, {});
					$$renderer.push(`<!----> `);
					UpdateLabels($$renderer, {});
					$$renderer.push(`<!----> `);
					UpdateProtocols($$renderer, {});
					$$renderer.push(`<!----> `);

					if (flags.oauth2Server({
						account: $.store_get($$store_subs ??= {}, '$user', user),
						organization: $.store_get($$store_subs ??= {}, '$organization', organization)
					})) {
						$$renderer.push('<!--[0-->');
						UpdateOAuth2Server($$renderer, {});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);
					UpdateServices($$renderer, {});
					$$renderer.push(`<!----> `);

					UpdateInstallations($$renderer, $.spread_props([
						data.installations,
						{ limit: data.limit, offset: data.offset }
					]));

					$$renderer.push(`<!----> `);

					if (isCloud && $.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects)) {
						$$renderer.push('<!--[0-->');
						PremiumGeoDB($$renderer, { addons: data.addons, addonPrice: data.addonPrice });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					UpdateVariables($$renderer, {
						sdkCreateVariable,
						sdkUpdateVariable,
						sdkDeleteVariable,
						disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
						isGlobal: true,
						variableList: data.variables,
						backendPagination: true,
						variablesOffset: data.variablesOffset,
						variablesLimit: data.limit,
						project: data.project,
						analyticsSource: 'project_settings'
					});

					$$renderer.push(`<!----> `);
					ChangeOrganization($$renderer, {});
					$$renderer.push(`<!----> `);
					DeleteProject($$renderer, {});
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
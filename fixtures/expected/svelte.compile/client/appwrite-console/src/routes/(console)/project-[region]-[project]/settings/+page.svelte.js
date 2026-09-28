import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`You can open this settings area, but editing project-level settings requires the <code>projects.write</code> scope.`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $project = () => $.store_get(project, '$project', $$stores);
	const $canWriteProjects = () => $.store_get(canWriteProjects, '$canWriteProjects', $$stores);
	const $user = () => $.store_get(user, '$user', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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

	Container($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.component(node_2, () => Alert.Inline, ($$anchor, Alert_Inline) => {
								Alert_Inline($$anchor, {
									status: 'info',
									title: 'Read-only project settings',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_4 = root();

										$.next(2);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						};

						$.if(node_1, ($$render) => {
							if (!$canWriteProjects()) $$render(consequent);
						});
					}

					var node_3 = $.sibling(node_1, 2);

					UpdateName(node_3, {});

					var node_4 = $.sibling(node_3, 2);

					UpdateLabels(node_4, {});

					var node_5 = $.sibling(node_4, 2);

					UpdateProtocols(node_5, {});

					var node_6 = $.sibling(node_5, 2);

					{
						var consequent_1 = ($$anchor) => {
							UpdateOAuth2Server($$anchor, {});
						};

						var d = $.derived(() => flags.oauth2Server({ account: $user(), organization: $organization() }));

						$.if(node_6, ($$render) => {
							if ($.get(d)) $$render(consequent_1);
						});
					}

					var node_7 = $.sibling(node_6, 2);

					UpdateServices(node_7, {});

					var node_8 = $.sibling(node_7, 2);

					UpdateInstallations(node_8, $.spread_props(() => $$props.data.installations, {
						get limit() {
							return $$props.data.limit;
						},

						get offset() {
							return $$props.data.offset;
						}
					}));

					var node_9 = $.sibling(node_8, 2);

					{
						var consequent_2 = ($$anchor) => {
							PremiumGeoDB($$anchor, {
								get addons() {
									return $$props.data.addons;
								},

								get addonPrice() {
									return $$props.data.addonPrice;
								}
							});
						};

						$.if(node_9, ($$render) => {
							if (isCloud && $canWriteProjects()) $$render(consequent_2);
						});
					}

					var node_10 = $.sibling(node_9, 2);

					{
						let $0 = $.derived(() => !$canWriteProjects());

						UpdateVariables(node_10, {
							sdkCreateVariable,
							sdkUpdateVariable,
							sdkDeleteVariable,
							get disabled() {
								return $.get($0);
							},
							isGlobal: true,
							get variableList() {
								return $$props.data.variables;
							},
							backendPagination: true,
							get variablesOffset() {
								return $$props.data.variablesOffset;
							},

							get variablesLimit() {
								return $$props.data.limit;
							},

							get project() {
								return $$props.data.project;
							},
							analyticsSource: 'project_settings'
						});
					}

					var node_11 = $.sibling(node_10, 2);

					ChangeOrganization(node_11, {});

					var node_12 = $.sibling(node_11, 2);

					DeleteProject(node_12, {});
					$.append($$anchor, fragment_2);
				};

				$.if(node, ($$render) => {
					if ($project()) $$render(consequent_3);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}
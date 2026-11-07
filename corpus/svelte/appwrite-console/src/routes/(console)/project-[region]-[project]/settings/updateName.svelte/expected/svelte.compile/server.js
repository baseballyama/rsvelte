import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid, CopyInput } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { project } from '../store';
import { canWriteProjects } from '$lib/stores/roles';
import { getProjectEndpoint } from '$lib/helpers/project';

export default function UpdateName($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let name = null;

		onMount(() => {
			name = $.store_get($$store_subs ??= {}, '$project', project).name;
		});

		async function updateName() {
			try {
				await sdk.forConsole.organization($.store_get($$store_subs ??= {}, '$project', project).teamId).updateProject({
					projectId: $.store_get($$store_subs ??= {}, '$project', project).$id,
					name
				});

				await invalidate(Dependencies.PROJECT);
				await invalidate(Dependencies.ORGANIZATION);
				addNotification({ type: 'success', message: 'Project name has been updated' });
				trackEvent(Submit.ProjectUpdateName);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.ProjectUpdateName);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Access Appwrite services using this project's API Endpoint and Project ID.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`API credentials`);
						}
					},

					aside: ($$renderer) => {
						{
							CopyInput($$renderer, {
								label: 'Project ID',
								value: $.store_get($$store_subs ??= {}, '$project', project).$id
							});

							$$renderer.push(`<!----> `);
							CopyInput($$renderer, { label: 'API Endpoint', value: getProjectEndpoint() });
							$$renderer.push(`<!---->`);
						}
					},

					actions: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								event: 'view_api_keys',
								href: `${base}/project-${page.params.region}-${page.params.project}/overview/api-keys#integrations`,
								children: ($$renderer) => {
									$$renderer.push(`<!---->View API keys`);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			Form($$renderer, {
				onSubmit: updateName,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						$$slots: {
							title: ($$renderer) => {
								{
									$$renderer.push(`Name`);
								}
							},

							aside: ($$renderer) => {
								{
									InputText($$renderer, {
										id: 'name',
										label: 'Name',
										required: true,
										disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
										placeholder: 'Enter name',
										get value() {
											return name;
										},

										set value($$value) {
											name = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects) || name === $.store_get($$store_subs ??= {}, '$project', project).name,
										submit: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Update`);
										},
										$$slots: { default: true }
									});
								}
							}
						}
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
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
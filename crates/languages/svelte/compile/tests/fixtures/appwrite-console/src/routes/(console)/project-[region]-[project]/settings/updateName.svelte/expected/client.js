import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);

export default function UpdateName($$anchor, $$props) {
	$.push($$props, true);

	const $project = () => $.store_get(project, '$project', $$stores);
	const $canWriteProjects = () => $.store_get(canWriteProjects, '$canWriteProjects', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let name = null;

	onMount(() => {
		name = $project().name;
	});

	async function updateName() {
		try {
			await sdk.forConsole.organization($project().teamId).updateProject({ projectId: $project().$id, name });
			await invalidate(Dependencies.PROJECT);
			await invalidate(Dependencies.ORGANIZATION);
			addNotification({ type: 'success', message: 'Project name has been updated' });
			trackEvent(Submit.ProjectUpdateName);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.ProjectUpdateName);
		}
	}

	var fragment = root();
	var node = $.first_child(fragment);

	CardGrid(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Access Appwrite services using this project\'s API Endpoint and Project ID.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('API credentials');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				CopyInput(node_1, {
					label: 'Project ID',
					get value() {
						return $project().$id;
					}
				});

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(getProjectEndpoint);

					CopyInput(node_2, {
						label: 'API Endpoint',
						get value() {
							return $.get($0);
						}
					});
				}

				$.append($$anchor, fragment_1);
			},

			actions: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/overview/api-keys#integrations`);

					Button($$anchor, {
						secondary: true,
						event: 'view_api_keys',
						get href() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('View API keys');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				}
			}
		}
	});

	var node_3 = $.sibling(node, 2);

	Form(node_3, {
		onSubmit: updateName,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				$$slots: {
					title: ($$anchor, $$slotProps) => {
						var text_3 = $.text('Name');

						$.append($$anchor, text_3);
					},

					aside: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => !$canWriteProjects());

							InputText($$anchor, {
								id: 'name',
								label: 'Name',
								required: true,
								get disabled() {
									return $.get($0);
								},
								placeholder: 'Enter name',
								get value() {
									return name;
								},

								set value($$value) {
									name = $$value;
								}
							});
						}
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => !$canWriteProjects() || name === $project().name);

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Update');

									$.append($$anchor, text_4);
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

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
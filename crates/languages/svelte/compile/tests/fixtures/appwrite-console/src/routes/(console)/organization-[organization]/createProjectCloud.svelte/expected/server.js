import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { onDestroy } from 'svelte';
import { sdk } from '$lib/stores/sdk';
import { Modal } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { Dependencies } from '$lib/constants';
import { goto, invalidate } from '$app/navigation';
import CreateProject from '$lib/layout/createProject.svelte';
import { ID, Region } from '@appwrite.io/console';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

export default function CreateProjectCloud($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			teamId,
			projects,
			showCreateProjectCloud = void 0,
			regions = [],
			currentPlan = undefined
		} = $$props;

		let initialProjectId = ID.unique();
		let error = null;
		let projectRegion = Region.Fra;
		let projectName = 'New project';
		let projectId = initialProjectId;
		let showSubmissionLoader = false;

		async function create() {
			let project;

			showSubmissionLoader = true;

			try {
				project = await sdk.forConsole.organization(teamId).createProject({
					projectId: projectId ?? ID.unique(),
					name: projectName,
					region: projectRegion
				});

				await goto(resolve('/(console)/project-[region]-[project]', { region: project.region, project: project.$id }));

				trackEvent(Submit.ProjectCreate, {
					teamId,
					region: projectRegion,
					customId: initialProjectId !== projectId
				});
			} catch(e) {
				error = e.message;
				trackError(e, Submit.ProjectCreate);
			} finally {
				showSubmissionLoader = false;

				if (project) {
					// reload projects for nav breadcrumb!
					await invalidate(Dependencies.ORGANIZATION);
				}
			}
		}

		onDestroy(() => {
			error = null;
			projectName = 'New project';
			projectRegion = Region.Fra;
			showCreateProjectCloud = false;

			// reset with a new ID
			initialProjectId = ID.unique();

			projectId = initialProjectId;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				autoClose: false,
				onSubmit: create,
				title: 'Create project',
				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				},

				get show() {
					return showCreateProjectCloud;
				},

				set show($$value) {
					showCreateProjectCloud = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					CreateProject($$renderer, {
						regions,
						projects,
						currentPlan,
						showTitle: false,
						get projectName() {
							return projectName;
						},

						set projectName($$value) {
							projectName = $$value;
							$$settled = false;
						},

						get id() {
							return projectId;
						},

						set id($$value) {
							projectId = $$value;
							$$settled = false;
						},

						get region() {
							return projectRegion;
						},

						set region($$value) {
							projectRegion = $$value;
							$$settled = false;
						}
					});
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								submit: true,
								size: 's',
								disabled: currentPlan?.projects > 0 && projects && projects >= currentPlan?.projects,
								forceShowLoader: showSubmissionLoader,
								submissionLoader: showSubmissionLoader,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Create`);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { showCreateProjectCloud });
	});
}
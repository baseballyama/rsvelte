import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function CreateProjectCloud($$anchor, $$props) {
	$.push($$props, true);

	let showCreateProjectCloud = $.prop($$props, 'showCreateProjectCloud', 15),
		regions = $.prop($$props, 'regions', 19, () => []),
		currentPlan = $.prop($$props, 'currentPlan', 3, undefined);

	let initialProjectId = ID.unique();
	let error = $.state(null);
	let projectRegion = $.state($.proxy(Region.Fra));
	let projectName = $.state('New project');
	let projectId = $.state($.proxy(initialProjectId));
	let showSubmissionLoader = $.state(false);

	async function create() {
		let project;

		$.set(showSubmissionLoader, true);

		try {
			project = await sdk.forConsole.organization($$props.teamId).createProject({
				projectId: $.get(projectId) ?? ID.unique(),
				name: $.get(projectName),
				region: $.get(projectRegion)
			});

			await goto(resolve('/(console)/project-[region]-[project]', { region: project.region, project: project.$id }));

			trackEvent(Submit.ProjectCreate, {
				teamId: $$props.teamId,
				region: $.get(projectRegion),
				customId: initialProjectId !== $.get(projectId)
			});
		} catch(e) {
			$.set(error, e.message, true);
			trackError(e, Submit.ProjectCreate);
		} finally {
			$.set(showSubmissionLoader, false);

			if (project) {
				// reload projects for nav breadcrumb!
				await invalidate(Dependencies.ORGANIZATION);
			}
		}
	}

	onDestroy(() => {
		$.set(error, null);
		$.set(projectName, 'New project');
		$.set(projectRegion, Region.Fra, true);
		showCreateProjectCloud(false);

		// reset with a new ID
		initialProjectId = ID.unique();

		$.set(projectId, initialProjectId, true);
	});

	Modal($$anchor, {
		autoClose: false,
		onSubmit: create,
		title: 'Create project',
		get error() {
			return $.get(error);
		},

		set error($$value) {
			$.set(error, $$value, true);
		},

		get show() {
			return showCreateProjectCloud();
		},

		set show($$value) {
			showCreateProjectCloud($$value);
		},

		children: ($$anchor, $$slotProps) => {
			CreateProject($$anchor, {
				get regions() {
					return regions();
				},

				get projects() {
					return $$props.projects;
				},

				get currentPlan() {
					return currentPlan();
				},
				showTitle: false,
				get projectName() {
					return $.get(projectName);
				},

				set projectName($$value) {
					$.set(projectName, $$value, true);
				},

				get id() {
					return $.get(projectId);
				},

				set id($$value) {
					$.set(projectId, $$value, true);
				},

				get region() {
					return $.get(projectRegion);
				},

				set region($$value) {
					$.set(projectRegion, $$value, true);
				}
			});
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => currentPlan()?.projects > 0 && $$props.projects && $$props.projects >= currentPlan()?.projects);

					Button($$anchor, {
						submit: true,
						size: 's',
						get disabled() {
							return $.get($0);
						},

						get forceShowLoader() {
							return $.get(showSubmissionLoader);
						},

						get submissionLoader() {
							return $.get(showSubmissionLoader);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Create');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				}
			}
		}
	});

	$.pop();
}
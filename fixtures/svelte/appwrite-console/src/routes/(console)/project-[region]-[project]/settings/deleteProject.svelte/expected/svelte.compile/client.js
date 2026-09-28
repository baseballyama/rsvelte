import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto, invalidate } from '$app/navigation';
import { base } from '$app/paths';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { BoxAvatar, CardGrid, Modal } from '$lib/components';
import { Button, InputText } from '$lib/elements/forms';
import { toLocaleDateTime } from '$lib/helpers/date';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { project, projectRegion } from '../store';
import { organization } from '$lib/stores/organization';
import { Dependencies } from '$lib/constants';
import { canWriteProjects } from '$lib/stores/roles';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <p> </p>`, 1);
var root_2 = $.from_html(`<h6 class="u-bold u-trim-1" data-private=""> </h6>`);
var root_3 = $.from_html(`This project will be deleted along with all of its metadata, stats, and other resources. <b>This action is irreversible.</b>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function DeleteProject($$anchor, $$props) {
	$.push($$props, true);

	const $project = () => $.store_get(project, '$project', $$stores);
	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $projectRegion = () => $.store_get(projectRegion, '$projectRegion', $$stores);
	const $canWriteProjects = () => $.store_get(canWriteProjects, '$canWriteProjects', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let error;
	let showDelete = false;
	let name = null;

	async function finishAndRedirect() {
		showDelete = false;
		trackEvent(Submit.ProjectDelete);

		addNotification({
			type: 'success',
			message: `${$project().name} has been deleted`
		});

		await goto(`${base}/organization-${$organization().$id}`, { replaceState: true });

		// reload projects for nav breadcrumb!
		await invalidate(Dependencies.ORGANIZATION);
	}

	const handleDelete = async () => {
		try {
			// send the project to correct region pool for deletion!
			await sdk.forProject($project().region, $project().$id).project.delete();

			await finishAndRedirect();
		} catch(e) {
			error = e.message;
			trackError(e, Submit.ProjectDelete);
		}
	};

	var fragment = root_4();
	var node = $.first_child(fragment);

	CardGrid(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('The project will be permanently deleted, including all the metadata, resources and stats within it.\n    This action is irreversible.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Delete project');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				BoxAvatar($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								var p = root();
								var text_2 = $.only_child(p);

								$.template_effect(() => $.set_text(text_2, `Region: ${$projectRegion().name ?? ''}`));
								$.append($$anchor, p);
							};

							$.if(node_1, ($$render) => {
								if (isCloud && $projectRegion()) $$render(consequent);
							});
						}

						var p_1 = $.sibling(node_1, 2);
						var text_3 = $.only_child(p_1);

						$.template_effect(($0) => $.set_text(text_3, `Last update: ${$0 ?? ''}`), [() => toLocaleDateTime($project().$updatedAt)]);
						$.append($$anchor, fragment_2);
					},

					$$slots: {
						default: true,
						title: ($$anchor, $$slotProps) => {
							var h6 = root_2();
							var text_4 = $.only_child(h6, true);

							$.template_effect(() => $.set_text(text_4, $project().name));
							$.append($$anchor, h6);
						}
					}
				});
			},

			actions: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => !$canWriteProjects());

					Button($$anchor, {
						secondary: true,
						get disabled() {
							return $.get($0);
						},
						$$events: { click: () => showDelete = true },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Delete');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				}
			}
		}
	});

	var node_2 = $.sibling(node, 2);

	Modal(node_2, {
		size: 's',
		title: 'Delete project',
		onSubmit: handleDelete,
		get show() {
			return showDelete;
		},

		set show($$value) {
			showDelete = $$value;
		},

		get error() {
			return error;
		},

		set error($$value) {
			error = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => `Enter "${$project().name}" to continue`);

				InputText($$anchor, {
					get label() {
						return $.get($0);
					},
					placeholder: 'Enter name',
					id: 'project-name',
					autofocus: true,
					required: true,
					get value() {
						return name;
					},

					set value($$value) {
						name = $$value;
					}
				});
			}
		},

		$$slots: {
			default: true,
			description: ($$anchor, $$slotProps) => {
				var fragment_5 = root_3();

				$.next();
				$.append($$anchor, fragment_5);
			},

			footer: ($$anchor, $$slotProps) => {
				var fragment_6 = root_4();
				var node_3 = $.first_child(fragment_6);

				Button(node_3, {
					text: true,
					$$events: { click: () => showDelete = false },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Cancel');

						$.append($$anchor, text_6);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				{
					let $0 = $.derived(() => name !== $project().name);

					Button(node_4, {
						submissionLoader: true,
						submit: true,
						get disabled() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Delete');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_6);
			}
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
import * as $ from 'svelte/internal/server';
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

export default function DeleteProject($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let error;
		let showDelete = false;
		let name = null;

		async function finishAndRedirect() {
			showDelete = false;
			trackEvent(Submit.ProjectDelete);

			addNotification({
				type: 'success',
				message: `${$.store_get($$store_subs ??= {}, '$project', project).name} has been deleted`
			});

			await goto(`${base}/organization-${$.store_get($$store_subs ??= {}, '$organization', organization).$id}`, { replaceState: true });

			// reload projects for nav breadcrumb!
			await invalidate(Dependencies.ORGANIZATION);
		}

		const handleDelete = async () => {
			try {
				// send the project to correct region pool for deletion!
				await sdk.forProject($.store_get($$store_subs ??= {}, '$project', project).region, $.store_get($$store_subs ??= {}, '$project', project).$id).project.delete();

				await finishAndRedirect();
			} catch(e) {
				error = e.message;
				trackError(e, Submit.ProjectDelete);
			}
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->The project will be permanently deleted, including all the metadata, resources and stats within it.
    This action is irreversible.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Delete project`);
						}
					},

					aside: ($$renderer) => {
						{
							BoxAvatar($$renderer, {
								children: ($$renderer) => {
									if (isCloud && $.store_get($$store_subs ??= {}, '$projectRegion', projectRegion)) {
										$$renderer.push(`<!--[0--><p>Region: ${$.escape($.store_get($$store_subs ??= {}, '$projectRegion', projectRegion).name)}</p>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> <p>Last update: ${$.escape(toLocaleDateTime($.store_get($$store_subs ??= {}, '$project', project).$updatedAt))}</p>`);
								},

								$$slots: {
									default: true,
									title: ($$renderer) => {
										{
											$$renderer.push(`<h6 class="u-bold u-trim-1" data-private="">${$.escape($.store_get($$store_subs ??= {}, '$project', project).name)}</h6>`);
										}
									}
								}
							});
						}
					},

					actions: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Delete`);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				size: 's',
				title: 'Delete project',
				onSubmit: handleDelete,
				get show() {
					return showDelete;
				},

				set show($$value) {
					showDelete = $$value;
					$$settled = false;
				},

				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					InputText($$renderer, {
						label: `Enter "${$.store_get($$store_subs ??= {}, '$project', project).name}" to continue`,
						placeholder: 'Enter name',
						id: 'project-name',
						autofocus: true,
						required: true,
						get value() {
							return name;
						},

						set value($$value) {
							name = $$value;
							$$settled = false;
						}
					});
				},

				$$slots: {
					default: true,
					description: ($$renderer) => {
						{
							$$renderer.push(`This project will be deleted along with all of its metadata, stats, and other resources. <b>This action is irreversible.</b>`);
						}
					},

					footer: ($$renderer) => {
						{
							Button($$renderer, {
								text: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submissionLoader: true,
								submit: true,
								disabled: name !== $.store_get($$store_subs ??= {}, '$project', project).name,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Delete`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				}
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
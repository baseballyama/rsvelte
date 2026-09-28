import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { Modal, CustomId } from '$lib/components';
import { InputText, Button } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { ID } from '@appwrite.io/console';
import { IconPencil } from '@appwrite.io/pink-icons-svelte';
import { Icon, Tag } from '@appwrite.io/pink-svelte';
import { createEventDispatcher } from 'svelte';

export default function CreateTeam($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { showCreate = false } = $$props;
		const dispatch = createEventDispatcher();
		let name = '';
		let id = null;
		let error = null;
		let showCustomId = false;

		const create = async () => {
			try {
				const team = await sdk.forProject(page.params.region, page.params.project).teams.create({ teamId: id ?? ID.unique(), name });

				name = '';
				showCreate = false;
				showCustomId = false;
				addNotification({ type: 'success', message: `${team.name} has been created` });
				trackEvent(Submit.TeamCreate, { customId: !!id });
				dispatch('created', team);
			} catch(e) {
				error = e.message;
				trackError(e, Submit.TeamCreate);
			}
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Modal($$renderer, {
				title: 'Create team',
				error,
				size: 'm',
				onSubmit: create,
				get show() {
					return showCreate;
				},

				set show($$value) {
					showCreate = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					InputText($$renderer, {
						id: 'name',
						label: 'Name',
						placeholder: 'Enter name',
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

					$$renderer.push(`<!----> `);

					if (!showCustomId) {
						$$renderer.push(`<!--[0--><div>`);

						Tag($$renderer, {
							size: 's',
							children: ($$renderer) => {
								Icon($$renderer, { icon: IconPencil });
								$$renderer.push(`<!----> Team ID`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					} else {
						$$renderer.push('<!--[-1-->');

						CustomId($$renderer, {
							autofocus: true,
							name: 'Team',
							get show() {
								return showCustomId;
							},

							set show($$value) {
								showCustomId = $$value;
								$$settled = false;
							},

							get id() {
								return id;
							},

							set id($$value) {
								id = $$value;
								$$settled = false;
							}
						});
					}

					$$renderer.push(`<!--]-->`);
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								submit: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Create`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
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
		$.bind_props($$props, { showCreate });
	});
}
import * as $ from 'svelte/internal/server';
import { CardGrid } from '$lib/components';
import { Button, InputSelect } from '$lib/elements/forms';
import { organizationList } from '$lib/stores/organization';
import { project } from '../store';
import TransferProjectModal from './transferProjectModal.svelte';
import { canWriteProjects } from '$lib/stores/roles';

export default function ChangeOrganization($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let teamId;
		let showTransfer = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			CardGrid($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Select an organization you own to move this project.`);
				},

				$$slots: {
					default: true,
					title: ($$renderer) => {
						{
							$$renderer.push(`Change organization`);
						}
					},

					aside: ($$renderer) => {
						{
							InputSelect($$renderer, {
								required: true,
								id: 'organization',
								placeholder: 'Select destination',
								label: 'Move to',
								disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
								options: $.store_get($$store_subs ??= {}, '$organizationList', organizationList).teams.filter((team) => team.$id !== $.store_get($$store_subs ??= {}, '$project', project).teamId).map((team) => ({ value: team.$id, label: team.name })),
								get value() {
									return teamId;
								},

								set value($$value) {
									teamId = $$value;
									$$settled = false;
								}
							});
						}
					},

					actions: ($$renderer) => {
						{
							Button($$renderer, {
								secondary: true,
								disabled: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects) || teamId === $.store_get($$store_subs ??= {}, '$project', project).teamId || !teamId,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Move`);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			if (teamId) {
				$$renderer.push('<!--[0-->');

				TransferProjectModal($$renderer, {
					teamName: $.store_get($$store_subs ??= {}, '$organizationList', organizationList).teams.find((t) => t.$id == teamId).name,
					get teamId() {
						return teamId;
					},

					set teamId($$value) {
						teamId = $$value;
						$$settled = false;
					},

					get show() {
						return showTransfer;
					},

					set show($$value) {
						showTransfer = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
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
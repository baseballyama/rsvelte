import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CardGrid } from '$lib/components';
import { Button, InputSelect } from '$lib/elements/forms';
import { organizationList } from '$lib/stores/organization';
import { project } from '../store';
import TransferProjectModal from './transferProjectModal.svelte';
import { canWriteProjects } from '$lib/stores/roles';

var root = $.from_html(`<!> <!>`, 1);

export default function ChangeOrganization($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteProjects = () => $.store_get(canWriteProjects, '$canWriteProjects', $$stores);
	const $organizationList = () => $.store_get(organizationList, '$organizationList', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let teamId;
	let showTransfer = false;
	var fragment = root();
	var node = $.first_child(fragment);

	CardGrid(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select an organization you own to move this project.');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text_1 = $.text('Change organization');

				$.append($$anchor, text_1);
			},

			aside: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => !$canWriteProjects());
					let $1 = $.derived(() => $organizationList().teams.filter((team) => team.$id !== $project().teamId).map((team) => ({ value: team.$id, label: team.name })));

					InputSelect($$anchor, {
						required: true,
						id: 'organization',
						placeholder: 'Select destination',
						label: 'Move to',
						get disabled() {
							return $.get($0);
						},

						get options() {
							return $.get($1);
						},

						get value() {
							return teamId;
						},

						set value($$value) {
							teamId = $$value;
						}
					});
				}
			},

			actions: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => !$canWriteProjects() || teamId === $project().teamId || !teamId);

					Button($$anchor, {
						secondary: true,
						get disabled() {
							return $.get($0);
						},
						$$events: { click: () => showTransfer = true },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Move');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				}
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => $organizationList().teams.find((t) => t.$id == teamId).name);

				TransferProjectModal($$anchor, {
					get teamName() {
						return $.get($0);
					},

					get teamId() {
						return teamId;
					},

					set teamId($$value) {
						teamId = $$value;
					},

					get show() {
						return showTransfer;
					},

					set show($$value) {
						showTransfer = $$value;
					}
				});
			}
		};

		$.if(node_1, ($$render) => {
			if (teamId) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
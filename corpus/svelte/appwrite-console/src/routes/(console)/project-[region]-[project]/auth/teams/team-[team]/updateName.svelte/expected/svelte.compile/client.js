import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { team } from './store';

export default function UpdateName($$anchor, $$props) {
	$.push($$props, true);

	const $team = () => $.store_get(team, '$team', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let teamName = null;

	onMount(async () => {
		teamName ??= $team().name;
	});

	async function updateName() {
		try {
			await sdk.forProject(page.params.region, page.params.project).teams.updateName({ teamId: page.params.team, name: teamName });
			await invalidate(Dependencies.TEAM);
			addNotification({ message: 'Name has been updated', type: 'success' });
			trackEvent(Submit.TeamUpdateName);
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.TeamUpdateName);
		}
	}

	Form($$anchor, {
		onSubmit: updateName,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				$$slots: {
					title: ($$anchor, $$slotProps) => {
						var text = $.text('Name');

						$.append($$anchor, text);
					},

					aside: ($$anchor, $$slotProps) => {
						InputText($$anchor, {
							required: true,
							id: 'name',
							label: 'Name',
							placeholder: 'Enter team name',
							autocomplete: false,
							get value() {
								return teamName;
							},

							set value($$value) {
								teamName = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => teamName === $team().name || !teamName);

							Button($$anchor, {
								submit: true,
								get disabled() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Update');

									$.append($$anchor, text_1);
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

	$.pop();
	$$cleanup();
}
import * as $ from 'svelte/internal/server';
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

export default function UpdateName($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let teamName = null;

		onMount(async () => {
			teamName ??= $.store_get($$store_subs ??= {}, '$team', team).name;
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
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
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										submit: true,
										disabled: teamName === $.store_get($$store_subs ??= {}, '$team', team).name || !teamName,
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
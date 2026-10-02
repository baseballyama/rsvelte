import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { user } from '$lib/stores/user';
import { onMount } from 'svelte';

export default function UpdateName($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let name = null;

		onMount(async () => {
			name ??= $.store_get($$store_subs ??= {}, '$user', user).name ?? '';
		});

		async function updateName() {
			try {
				await sdk.forConsole.account.updateName({ name });
				await invalidate(Dependencies.ACCOUNT);
				addNotification({ message: 'Name has been updated', type: 'success' });
				trackEvent(Submit.AccountUpdateName);
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.AccountUpdateName);
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
										id: 'name',
										label: 'Name',
										placeholder: 'Enter name',
										required: true,
										get value() {
											return name;
										},

										set value($$value) {
											name = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: name === $.store_get($$store_subs ??= {}, '$user', user).name || !name,
										submit: true,
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
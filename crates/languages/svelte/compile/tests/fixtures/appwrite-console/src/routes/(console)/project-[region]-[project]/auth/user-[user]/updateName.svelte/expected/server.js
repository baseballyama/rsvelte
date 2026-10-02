import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { user } from './store';
import { page } from '$app/state';

export default function UpdateName($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let userName = null;

		onMount(async () => {
			userName ??= $.store_get($$store_subs ??= {}, '$user', user).name ?? '';
		});

		async function updateName() {
			try {
				await sdk.forProject(page.params.region, page.params.project).users.updateName({
					userId: $.store_get($$store_subs ??= {}, '$user', user).$id,
					name: userName
				});

				await invalidate(Dependencies.USER);
				addNotification({ message: 'Name has been updated', type: 'success' });
				trackEvent(Submit.UserUpdateName);
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.UserUpdateName);
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
									$$renderer.push(`<ul data-private="">`);

									InputText($$renderer, {
										id: 'name',
										label: 'Name',
										placeholder: 'Enter name',
										autocomplete: false,
										get value() {
											return userName;
										},

										set value($$value) {
											userName = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></ul>`);
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: userName === $.store_get($$store_subs ??= {}, '$user', user).name,
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
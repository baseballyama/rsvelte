import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputEmail } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { user } from './store';
import { page } from '$app/state';

export default function UpdateEmail($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let userEmail = null;

		onMount(async () => {
			userEmail ??= $.store_get($$store_subs ??= {}, '$user', user).email;
		});

		async function updateEmail() {
			try {
				await sdk.forProject(page.params.region, page.params.project).users.updateEmail({
					userId: $.store_get($$store_subs ??= {}, '$user', user).$id,
					email: userEmail
				});

				await invalidate(Dependencies.USER);
				addNotification({ message: 'Email has been updated', type: 'success' });
				trackEvent(Submit.UserUpdateEmail);
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.UserUpdateEmail);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updateEmail,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						$$slots: {
							title: ($$renderer) => {
								{
									$$renderer.push(`Email`);
								}
							},

							aside: ($$renderer) => {
								{
									InputEmail($$renderer, {
										id: 'email',
										label: 'Email',
										placeholder: 'Enter email',
										autocomplete: false,
										get value() {
											return userEmail;
										},

										set value($$value) {
											userEmail = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: userEmail === $.store_get($$store_subs ??= {}, '$user', user).email,
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
import * as $ from 'svelte/internal/server';
import { invalidate } from '$app/navigation';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputPhone } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { onMount } from 'svelte';
import { user } from './store';
import { page } from '$app/state';

export default function UpdatePhone($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let userPhone = null;

		onMount(async () => {
			userPhone ??= $.store_get($$store_subs ??= {}, '$user', user).phone;
		});

		async function updatePhone() {
			try {
				await sdk.forProject(page.params.region, page.params.project).users.updatePhone({
					userId: $.store_get($$store_subs ??= {}, '$user', user).$id,
					number: userPhone
				});

				await invalidate(Dependencies.USER);
				addNotification({ message: 'Phone has been updated', type: 'success' });
				trackEvent(Submit.UserUpdatePhone);
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.UserUpdatePhone);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: updatePhone,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Phone number must start with '+' and maximum of 15 digits.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Phone`);
								}
							},

							aside: ($$renderer) => {
								{
									InputPhone($$renderer, {
										id: 'phone',
										label: 'Phone',
										placeholder: 'For example: +14155552671',
										autocomplete: false,
										get value() {
											return userPhone;
										},

										set value($$value) {
											userPhone = $$value;
											$$settled = false;
										}
									});
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: userPhone === $.store_get($$store_subs ??= {}, '$user', user).phone,
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
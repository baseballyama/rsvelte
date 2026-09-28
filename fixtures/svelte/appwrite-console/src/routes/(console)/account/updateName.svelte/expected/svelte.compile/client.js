import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { user } from '$lib/stores/user';
import { onMount } from 'svelte';

export default function UpdateName($$anchor, $$props) {
	$.push($$props, true);

	const $user = () => $.store_get(user, '$user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let name = null;

	onMount(async () => {
		name ??= $user().name ?? '';
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
							id: 'name',
							label: 'Name',
							placeholder: 'Enter name',
							required: true,
							get value() {
								return name;
							},

							set value($$value) {
								name = $$value;
							}
						});
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => name === $user().name || !name);

							Button($$anchor, {
								get disabled() {
									return $.get($0);
								},
								submit: true,
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
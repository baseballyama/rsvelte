import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<ul data-private=""><!></ul>`);

export default function UpdateName($$anchor, $$props) {
	$.push($$props, true);

	const $user = () => $.store_get(user, '$user', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let userName = null;

	onMount(async () => {
		userName ??= $user().name ?? '';
	});

	async function updateName() {
		try {
			await sdk.forProject(page.params.region, page.params.project).users.updateName({ userId: $user().$id, name: userName });
			await invalidate(Dependencies.USER);
			addNotification({ message: 'Name has been updated', type: 'success' });
			trackEvent(Submit.UserUpdateName);
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.UserUpdateName);
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
						var ul = root();
						var node = $.child(ul);

						InputText(node, {
							id: 'name',
							label: 'Name',
							placeholder: 'Enter name',
							autocomplete: false,
							get value() {
								return userName;
							},

							set value($$value) {
								userName = $$value;
							}
						});

						$.reset(ul);
						$.append($$anchor, ul);
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => userName === $user().name);

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
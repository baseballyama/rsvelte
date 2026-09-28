import * as $ from 'svelte/internal/server';
import { CardGrid } from '$lib/components';
import { Button, Form, InputText } from '$lib/elements/forms';
import { onMount } from 'svelte';
import { topic } from '../store';
import { invalidate } from '$app/navigation';
import { trackEvent, Submit, trackError } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { page } from '$app/state';

export default function UpdateName($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let name = null;

		onMount(async () => {
			name ??= $.store_get($$store_subs ??= {}, '$topic', topic).name;
		});

		async function updateName() {
			try {
				await sdk.forProject(page.params.region, page.params.project).messaging.updateTopic({
					topicId: $.store_get($$store_subs ??= {}, '$topic', topic).$id,
					name
				});

				await invalidate(Dependencies.MESSAGING_TOPIC);
				addNotification({ message: 'Name has been updated', type: 'success' });
				trackEvent(Submit.MessagingTopicUpdateName);
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.MessagingTopicUpdateName);
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
											return name;
										},

										set value($$value) {
											name = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></ul>`);
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: name === $.store_get($$store_subs ??= {}, '$topic', topic).name,
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
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<ul data-private=""><!></ul>`);

export default function UpdateName($$anchor, $$props) {
	$.push($$props, true);

	const $topic = () => $.store_get(topic, '$topic', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let name = null;

	onMount(async () => {
		name ??= $topic().name;
	});

	async function updateName() {
		try {
			await sdk.forProject(page.params.region, page.params.project).messaging.updateTopic({ topicId: $topic().$id, name });
			await invalidate(Dependencies.MESSAGING_TOPIC);
			addNotification({ message: 'Name has been updated', type: 'success' });
			trackEvent(Submit.MessagingTopicUpdateName);
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.MessagingTopicUpdateName);
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
								return name;
							},

							set value($$value) {
								name = $$value;
							}
						});

						$.reset(ul);
						$.append($$anchor, ul);
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => name === $topic().name);

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
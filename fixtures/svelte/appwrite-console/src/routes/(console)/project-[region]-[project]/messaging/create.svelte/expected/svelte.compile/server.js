import * as $ from 'svelte/internal/server';
import { WizardWithSteps } from '$lib/layout';
import Step1 from './wizard/step1.svelte';
import Step2 from './wizard/step2.svelte';
import Step3 from './wizard/step3.svelte';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { addNotification } from '$lib/stores/notifications';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { project } from '../store';
import { wizard } from '$lib/stores/wizard';
import { providerType, messageParams } from './wizard/store';
import { ID, MessagingProviderType } from '@appwrite.io/console';
import { page } from '$app/state';

export default function Create($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		async function create() {
			try {
				let response;
				const messageId = $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].messageId || ID.unique();

				switch ($.store_get($$store_subs ??= {}, '$providerType', providerType)) {
					case MessagingProviderType.Email:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.createEmail({
							messageId,
							subject: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].subject,
							content: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].content,
							topics: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].topics,
							users: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].users,
							targets: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].targets,
							draft: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].draft,
							html: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].html,
							scheduledAt: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].scheduledAt
						});
						break;

					case MessagingProviderType.Sms:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.createSMS({
							messageId,
							content: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].content,
							topics: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].topics,
							users: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].users,
							targets: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].targets,
							draft: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].draft,
							scheduledAt: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].scheduledAt
						});
						break;

					case MessagingProviderType.Push:
						{
							const file = $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[MessagingProviderType.Push]?.file;
							const fileCompoundId = file ? `${file.bucketId}:${file.$id}` : undefined;
							const customData = {};
							const { data } = $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[MessagingProviderType.Push];

							if (data && data.length > 0) {
								data.forEach((item) => {
									if (item[0] === '') return;

									customData[item[0]] = item[1];
								});
							}

							response = await sdk.forProject(page.params.region, page.params.project).messaging.createPush({
								messageId,
								title: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].title,
								body: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].body,
								topics: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].topics,
								users: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].users,
								targets: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].targets,
								data: customData,
								image: fileCompoundId,
								draft: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].draft,
								scheduledAt: $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].scheduledAt
							});
						}
						break;
				}

				wizard.hide();

				let message = '';

				switch (response.status) {
					case 'draft':
						message = 'The message has been saved as draft.';
						break;

					case 'processing':
						message = 'The message is queued for processing.';
						break;

					case 'scheduled':
						message = 'The message has been scheduled.';
						break;
				}

				addNotification({ type: 'success', message });

				trackEvent(Submit.MessagingMessageCreate, {
					providerType: $.store_get($$store_subs ??= {}, '$providerType', providerType),
					status: response.status
				});

				await goto(`${base}/project-${$.store_get($$store_subs ??= {}, '$project', project).region}-${$.store_get($$store_subs ??= {}, '$project', project).$id}/messaging/message-${response.$id}`);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.MessagingMessageCreate);
			}
		}

		async function saveDraft() {
			$.store_mutate($$store_subs ??= {}, '$messageParams', messageParams, $.store_get($$store_subs ??= {}, '$messageParams', messageParams)[$.store_get($$store_subs ??= {}, '$providerType', providerType)].draft = true);
			create();
		}

		const stepsComponents = new Map();

		stepsComponents.set(1, {
			label: 'Message',
			component: Step1,
			actions: [{ label: 'Save as draft', onClick: saveDraft }]
		});

		stepsComponents.set(2, {
			label: 'Targets',
			component: Step2,
			actions: [{ label: 'Save as draft', onClick: saveDraft }]
		});

		stepsComponents.set(3, {
			label: 'Schedule',
			component: Step3,
			actions: [{ label: 'Save as draft', onClick: saveDraft }]
		});

		$.store_mutate($$store_subs ??= {}, '$wizard', wizard, $.store_get($$store_subs ??= {}, '$wizard', wizard).finalAction = create);

		WizardWithSteps($$renderer, {
			title: 'Create message',
			steps: stepsComponents,
			finalAction: 'Send'
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function Create($$anchor, $$props) {
	$.push($$props, true);

	const $messageParams = () => $.store_get(messageParams, '$messageParams', $$stores);
	const $providerType = () => $.store_get(providerType, '$providerType', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const $wizard = () => $.store_get(wizard, '$wizard', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	async function create() {
		try {
			let response;
			const messageId = $messageParams()[$providerType()].messageId || ID.unique();

			switch ($providerType()) {
				case MessagingProviderType.Email:
					response = await sdk.forProject(page.params.region, page.params.project).messaging.createEmail({
						messageId,
						subject: $messageParams()[$providerType()].subject,
						content: $messageParams()[$providerType()].content,
						topics: $messageParams()[$providerType()].topics,
						users: $messageParams()[$providerType()].users,
						targets: $messageParams()[$providerType()].targets,
						draft: $messageParams()[$providerType()].draft,
						html: $messageParams()[$providerType()].html,
						scheduledAt: $messageParams()[$providerType()].scheduledAt
					});
					break;

				case MessagingProviderType.Sms:
					response = await sdk.forProject(page.params.region, page.params.project).messaging.createSMS({
						messageId,
						content: $messageParams()[$providerType()].content,
						topics: $messageParams()[$providerType()].topics,
						users: $messageParams()[$providerType()].users,
						targets: $messageParams()[$providerType()].targets,
						draft: $messageParams()[$providerType()].draft,
						scheduledAt: $messageParams()[$providerType()].scheduledAt
					});
					break;

				case MessagingProviderType.Push:
					{
						const file = $messageParams()[MessagingProviderType.Push]?.file;
						const fileCompoundId = file ? `${file.bucketId}:${file.$id}` : undefined;
						const customData = {};
						const { data } = $messageParams()[MessagingProviderType.Push];

						if (data && data.length > 0) {
							data.forEach((item) => {
								if (item[0] === '') return;

								customData[item[0]] = item[1];
							});
						}

						response = await sdk.forProject(page.params.region, page.params.project).messaging.createPush({
							messageId,
							title: $messageParams()[$providerType()].title,
							body: $messageParams()[$providerType()].body,
							topics: $messageParams()[$providerType()].topics,
							users: $messageParams()[$providerType()].users,
							targets: $messageParams()[$providerType()].targets,
							data: customData,
							image: fileCompoundId,
							draft: $messageParams()[$providerType()].draft,
							scheduledAt: $messageParams()[$providerType()].scheduledAt
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
			trackEvent(Submit.MessagingMessageCreate, { providerType: $providerType(), status: response.status });
			await goto(`${base}/project-${$project().region}-${$project().$id}/messaging/message-${response.$id}`);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.MessagingMessageCreate);
		}
	}

	async function saveDraft() {
		$.store_mutate(messageParams, $.untrack($messageParams)[$providerType()].draft = true, $.untrack($messageParams));
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

	$.store_mutate(wizard, $.untrack($wizard).finalAction = create, $.untrack($wizard));

	WizardWithSteps($$anchor, {
		title: 'Create message',
		get steps() {
			return stepsComponents;
		},
		finalAction: 'Send'
	});

	$.pop();
	$$cleanup();
}
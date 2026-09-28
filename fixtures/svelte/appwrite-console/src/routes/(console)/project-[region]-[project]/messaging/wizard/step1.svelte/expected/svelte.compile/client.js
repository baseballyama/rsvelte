import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { WizardStep } from '$lib/layout';
import { messageParams, providerType } from './store';
import { providers } from '../providers/store';
import EmailFormList from './emailFormList.svelte';
import SmsFormList from './smsFormList.svelte';
import PushFormList, { validateData } from './pushFormList.svelte';
import { MessagingProviderType } from '@appwrite.io/console';
import { Button } from '@appwrite.io/pink-svelte';

var root = $.from_html(` <!>.`, 1);

export default function Step1($$anchor, $$props) {
	$.push($$props, true);

	const $providerType = () => $.store_get(providerType, '$providerType', $$stores);
	const $messageParams = () => $.store_get(messageParams, '$messageParams', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let docsUrl = `https://appwrite.io/docs/products/messaging`;

	const createMessage = (providerText) => {
		const vowels = ['a', 'e', 'i', 'o', 'u'];
		const firstLetter = providerText.toLowerCase().charAt(0);
		const lastLetter = providerText.toLowerCase().charAt(providerText.length - 1);
		let article = vowels.includes(firstLetter) ? 'an' : 'a';

		article = lastLetter === 's' ? '' : article;
		providerText = providerText.toLowerCase() === 'sms' ? 'SMS messages' : providerText;

		return `Create ${article} ${providerText} that will be displayed to your subscribers.`;
	};

	switch ($providerType()) {
		case MessagingProviderType.Email:
			docsUrl += '/send-email-messages';
			break;

		case MessagingProviderType.Sms:
			docsUrl += '/send-sms-messages';
			break;

		case MessagingProviderType.Push:
			docsUrl += '/send-push-notifications';
			break;
	}

	{
		let $0 = $.derived(() => $providerType() === MessagingProviderType.Push && !!validateData($messageParams()[MessagingProviderType.Push].data));

		WizardStep($$anchor, {
			get nextDisabled() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						EmailFormList($$anchor, {});
					};

					var consequent_1 = ($$anchor) => {
						SmsFormList($$anchor, {});
					};

					var consequent_2 = ($$anchor) => {
						PushFormList($$anchor, {});
					};

					$.if(node, ($$render) => {
						if ($providerType() === MessagingProviderType.Email) $$render(consequent); else if ($providerType() === MessagingProviderType.Sms) $$render(consequent_1, 1); else if ($providerType() === MessagingProviderType.Push) $$render(consequent_2, 2);
					});
				}

				$.append($$anchor, fragment_1);
			},

			$$slots: {
				default: true,
				title: ($$anchor, $$slotProps) => {
					var text = $.text('Message');

					$.append($$anchor, text);
				},

				subtitle: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var text_1 = $.first_child(fragment_5);
					var node_1 = $.sibling(text_1);

					$.component(node_1, () => Button.Anchor, ($$anchor, Button_Anchor) => {
						Button_Anchor($$anchor, {
							get href() {
								return docsUrl;
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('documentation');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					});

					$.next();
					$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''} Learn more in our `), [() => createMessage(providers[$providerType()].text)]);
					$.append($$anchor, fragment_5);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}
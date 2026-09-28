import * as $ from 'svelte/internal/server';
import { WizardStep } from '$lib/layout';
import { messageParams, providerType } from './store';
import { providers } from '../providers/store';
import EmailFormList from './emailFormList.svelte';
import SmsFormList from './smsFormList.svelte';
import PushFormList, { validateData } from './pushFormList.svelte';
import { MessagingProviderType } from '@appwrite.io/console';
import { Button } from '@appwrite.io/pink-svelte';

export default function Step1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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

		switch ($.store_get($$store_subs ??= {}, '$providerType', providerType)) {
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

		WizardStep($$renderer, {
			nextDisabled: $.store_get($$store_subs ??= {}, '$providerType', providerType) === MessagingProviderType.Push && !!validateData($.store_get($$store_subs ??= {}, '$messageParams', messageParams)[MessagingProviderType.Push].data),
			children: ($$renderer) => {
				if ($.store_get($$store_subs ??= {}, '$providerType', providerType) === MessagingProviderType.Email) {
					$$renderer.push('<!--[0-->');
					EmailFormList($$renderer, {});
				} else if ($.store_get($$store_subs ??= {}, '$providerType', providerType) === MessagingProviderType.Sms) {
					$$renderer.push('<!--[1-->');
					SmsFormList($$renderer, {});
				} else if ($.store_get($$store_subs ??= {}, '$providerType', providerType) === MessagingProviderType.Push) {
					$$renderer.push('<!--[2-->');
					PushFormList($$renderer, {});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},

			$$slots: {
				default: true,
				title: ($$renderer) => {
					{
						$$renderer.push(`Message`);
					}
				},

				subtitle: ($$renderer) => {
					{
						$$renderer.push(`${$.escape(createMessage(providers[$.store_get($$store_subs ??= {}, '$providerType', providerType)].text))} Learn more in our `);

						if (Button.Anchor) {
							$$renderer.push('<!--[-->');

							Button.Anchor($$renderer, {
								href: docsUrl,
								children: ($$renderer) => {
									$$renderer.push(`<!---->documentation`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`.`);
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
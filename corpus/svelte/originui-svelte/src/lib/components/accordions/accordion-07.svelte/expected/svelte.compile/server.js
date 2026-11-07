import * as $ from 'svelte/internal/server';
import * as Accordion from '$lib/components/ui/accordion/index.js';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import { Accordion as AccordionPrimitive } from 'bits-ui';

export default function Accordion_07($$renderer) {
	const items = [
		{
			content: 'Connect your accounts from Google, GitHub, or Microsoft to enable single sign-on and streamline your workflow. Connected accounts can be used for quick login and importing your preferences across platforms. You can revoke access to any connected account at any time.',
			id: '1',
			sub: 'Manage your linked social and work accounts',
			title: 'Connected accounts'
		},

		{
			content: 'Choose which updates you want to receive. You can get notifications for: security alerts, billing updates, newsletter and product announcements, usage reports, and scheduled maintenance. Notifications can be delivered via email, SMS, or push notifications on your devices.',
			id: '2',
			sub: 'Customize your notification preferences',
			title: 'Notifications'
		},

		{
			content: 'Protect your account with two-factor authentication. You can use authenticator apps like Google Authenticator or Authy, receive SMS codes, or use security keys like YubiKey. We recommend using an authenticator app for the most secure experience.',
			id: '3',
			sub: 'Add an extra layer of security to your account',
			title: '2-step verification'
		},

		{
			content: 'Our support team is available around the clock to assist you. For billing inquiries, technical issues, or general questions, you can reach us through live chat, email at support@example.com, or schedule a call with our technical team. Premium support is available for enterprise customers.',
			id: '4',
			sub: "We're here to help 24/7",
			title: 'Contact support'
		}
	];

	$$renderer.push(`<div class="space-y-4"><h2 class="text-xl font-bold">W/ sub-header and chevron</h2> `);

	if (Accordion.Root) {
		$$renderer.push('<!--[-->');

		Accordion.Root($$renderer, {
			type: 'single',
			class: 'w-full',
			value: '3',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: item.id,
							class: 'py-2',
							children: ($$renderer) => {
								if (AccordionPrimitive.Header) {
									$$renderer.push('<!--[-->');

									AccordionPrimitive.Header($$renderer, {
										class: 'flex',
										children: ($$renderer) => {
											if (AccordionPrimitive.Trigger) {
												$$renderer.push('<!--[-->');

												AccordionPrimitive.Trigger($$renderer, {
													class: 'flex flex-1 items-center justify-between py-2 text-left text-[15px] leading-6 font-semibold transition-all [&[data-state=open]>svg]:rotate-180',
													children: ($$renderer) => {
														$$renderer.push(`<span class="flex flex-col space-y-1"><span>${$.escape(item.title)}</span> `);

														if (item.sub) {
															$$renderer.push(`<!--[0--><span class="text-sm font-normal">${$.escape(item.sub)}</span>`);
														} else {
															$$renderer.push('<!--[-1-->');
														}

														$$renderer.push(`<!--]--></span> `);

														ChevronDown($$renderer, {
															size: 16,
															class: 'shrink-0 opacity-60 transition-transform duration-200',
															'aria-hidden': 'true'
														});

														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Accordion.Content) {
									$$renderer.push('<!--[-->');

									Accordion.Content($$renderer, {
										class: 'text-muted-foreground pb-2',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(item.content)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}
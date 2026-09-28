import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Accordion from '$lib/components/ui/accordion/index.js';
import Plus from '@lucide/svelte/icons/plus';
import { Accordion as AccordionPrimitive } from 'bits-ui';

var root = $.from_html(`<span class="text-sm font-normal"> </span>`);
var root_1 = $.from_html(`<span class="flex flex-col space-y-1"><span> </span> <!></span> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="space-y-4"><h2 class="text-xl font-bold">W/ sub-header and plus-minus</h2> <!></div>`);

export default function Accordion_08($$anchor) {
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

	var div = root_3();
	var node = $.sibling($.child(div), 2);

	$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			type: 'single',
			class: 'w-full',
			value: '3',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.each(node_1, 17, () => items, (item) => item.id, ($$anchor, item) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
						Accordion_Item($$anchor, {
							get value() {
								return $.get(item).id;
							},
							class: 'py-2',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_2();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => AccordionPrimitive.Header, ($$anchor, AccordionPrimitive_Header) => {
									AccordionPrimitive_Header($$anchor, {
										class: 'flex',
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = $.comment();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => AccordionPrimitive.Trigger, ($$anchor, AccordionPrimitive_Trigger) => {
												AccordionPrimitive_Trigger($$anchor, {
													class: 'flex flex-1 items-center justify-between py-2 text-left text-[15px] leading-6 font-semibold transition-all [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0',
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = root_1();
														var span = $.first_child(fragment_4);
														var span_1 = $.child(span);
														var text = $.only_child(span_1, true);
														var node_5 = $.sibling(span_1, 2);

														{
															var consequent = ($$anchor) => {
																var span_2 = root();
																var text_1 = $.only_child(span_2, true);

																$.template_effect(() => $.set_text(text_1, $.get(item).sub));
																$.append($$anchor, span_2);
															};

															$.if(node_5, ($$render) => {
																if ($.get(item).sub) $$render(consequent);
															});
														}

														$.reset(span);

														var node_6 = $.sibling(span, 2);

														Plus(node_6, {
															size: 16,
															class: 'shrink-0 opacity-60 transition-transform duration-200',
															'aria-hidden': 'true'
														});

														$.template_effect(() => $.set_text(text, $.get(item).title));
														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								var node_7 = $.sibling(node_3, 2);

								$.component(node_7, () => Accordion.Content, ($$anchor, Accordion_Content) => {
									Accordion_Content($$anchor, {
										class: 'text-muted-foreground pb-2',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, $.get(item).content));
											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}
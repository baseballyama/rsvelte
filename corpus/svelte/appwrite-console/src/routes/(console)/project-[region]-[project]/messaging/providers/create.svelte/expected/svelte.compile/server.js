import * as $ from 'svelte/internal/server';
import Provider from './wizard/provider.svelte';
import Settings from './wizard/settings.svelte';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { addNotification } from '$lib/stores/notifications';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { project } from '../../store';
import { wizard } from '$lib/stores/wizard';
import { provider, providerParams, providerType } from './wizard/store';
import { ID, MessagingProviderType } from '@appwrite.io/console';
import { getProviderDisplayNameAndIcon, Providers } from '../provider.svelte';
import { page } from '$app/state';
import { Button, Form } from '$lib/elements/forms';
import { ActionList, Card, Fieldset, Layout, Typography } from '@appwrite.io/pink-svelte';
import Wizard from '$lib/layout/wizard.svelte';
import { IconBookOpen, IconInfo, IconUserGroup } from '@appwrite.io/pink-icons-svelte';
import { newMemberModal } from '$lib/stores/organization';
import { getProviderText } from '../helper';
import { providers } from './store';
import CreateMember from '$routes/(console)/organization-[organization]/createMember.svelte';

export default function Create($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let formRef;

		async function create() {
			try {
				let response;
				const providerId = $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].providerId || ID.unique();

				switch ($.store_get($$store_subs ??= {}, '$provider', provider)) {
					case Providers.Twilio:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.createTwilioProvider({
							providerId,
							name: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].name,
							from: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].from,
							accountSid: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].accountSid,
							authToken: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].authToken,
							enabled: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].enabled
						});
						break;

					case Providers.Msg91:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.createMsg91Provider({
							providerId,
							name: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].name,
							templateId: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].templateId,
							senderId: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].senderId,
							authKey: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].authKey,
							enabled: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].enabled
						});
						break;

					case Providers.Telesign:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.createTelesignProvider({
							providerId,
							name: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].name,
							from: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].from,
							customerId: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].customerId,
							apiKey: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].apiKey,
							enabled: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].enabled
						});
						break;

					case Providers.Textmagic:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.createTextmagicProvider({
							providerId,
							name: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].name,
							from: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].from,
							username: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].username,
							apiKey: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].apiKey,
							enabled: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].enabled
						});
						break;

					case Providers.Vonage:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.createVonageProvider({
							providerId,
							name: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].name,
							from: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].from,
							apiKey: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].apiKey,
							apiSecret: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].apiSecret,
							enabled: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].enabled
						});
						break;

					case Providers.Mailgun:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.createMailgunProvider({
							providerId,
							name: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].name,
							apiKey: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].apiKey,
							domain: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].domain,
							isEuRegion: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].isEuRegion,
							fromName: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].fromName || undefined,
							fromEmail: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].fromEmail,
							replyToName: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].replyToName || undefined,
							replyToEmail: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].replyToEmail || undefined,
							enabled: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].enabled
						});
						break;

					case Providers.Sendgrid:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.createSendgridProvider({
							providerId,
							name: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].name,
							apiKey: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].apiKey,
							fromName: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].fromName || undefined,
							fromEmail: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].fromEmail,
							replyToName: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].replyToName || undefined,
							replyToEmail: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].replyToEmail || undefined,
							enabled: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].enabled
						});
						break;

					case Providers.Resend:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.createResendProvider({
							providerId,
							name: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].name,
							apiKey: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].apiKey,
							fromName: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].fromName || undefined,
							fromEmail: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].fromEmail,
							replyToName: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].replyToName || undefined,
							replyToEmail: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].replyToEmail || undefined,
							enabled: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].enabled
						});
						break;

					case Providers.SMTP:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.createSMTPProvider({
							providerId,
							name: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].name,
							host: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].host,
							port: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].port || undefined,
							username: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].username || undefined,
							password: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].password || undefined,
							encryption: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].encryption,
							autoTLS: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].autoTLS,
							mailer: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].mailer || undefined,
							fromName: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].fromName || undefined,
							fromEmail: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].fromEmail,
							replyToName: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].replyToName || undefined,
							replyToEmail: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].replyToEmail || undefined,
							enabled: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].enabled
						});
						break;

					case Providers.FCM:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.createFCMProvider({
							providerId,
							name: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].name,
							serviceAccountJSON: JSON.parse($.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].serviceAccountJSON),
							enabled: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].enabled
						});
						break;

					case Providers.APNS:
						response = await sdk.forProject(page.params.region, page.params.project).messaging.createAPNSProvider({
							providerId,
							name: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].name,
							authKey: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].authKey,
							authKeyId: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].authKeyId,
							teamId: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].teamId,
							bundleId: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].bundleId,
							sandbox: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].sandbox,
							enabled: $.store_get($$store_subs ??= {}, '$providerParams', providerParams)[$.store_get($$store_subs ??= {}, '$provider', provider)].enabled
						});
						break;
				}

				wizard.hide();

				addNotification({
					type: 'success',
					message: `${response.name} has been created`
				});

				trackEvent(Submit.MessagingProviderCreate, {
					provider: $.store_get($$store_subs ??= {}, '$provider', provider)
				});

				await goto(`${base}/project-${$.store_get($$store_subs ??= {}, '$project', project).region}-${$.store_get($$store_subs ??= {}, '$project', project).$id}/messaging/providers/provider-${response.$id}`);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.MessagingProviderCreate);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				title: 'Create provider',
				columnSize: 'l',
				confirmExit: true,
				children: ($$renderer) => {
					Form($$renderer, {
						onSubmit: create,
						isModal: false,
						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xxl',
									children: ($$renderer) => {
										Fieldset($$renderer, {
											legend: 'Provider',
											children: ($$renderer) => {
												Provider($$renderer, {});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Fieldset($$renderer, {
											legend: 'Settings',
											children: ($$renderer) => {
												Settings($$renderer, {});
											},
											$$slots: { default: true }
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

					$$renderer.push(`<!----> `);

					if ($.store_get($$store_subs ??= {}, '$newMemberModal', newMemberModal)) {
						$$renderer.push('<!--[0-->');

						CreateMember($$renderer, {
							get showCreate() {
								return $.store_get($$store_subs ??= {}, '$newMemberModal', newMemberModal);
							},

							set showCreate($$value) {
								$.store_set(newMemberModal, $$value);
								$$settled = false;
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},

				$$slots: {
					default: true,
					aside: ($$renderer) => {
						{
							if (Card.Base) {
								$$renderer.push('<!--[-->');

								Card.Base($$renderer, {
									padding: 's',
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												gap: 's',
												children: ($$renderer) => {
													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															variant: 'm-500',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Need a hand?`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (ActionList.Root) {
														$$renderer.push('<!--[-->');

														ActionList.Root($$renderer, {
															children: ($$renderer) => {
																if (providers[$.store_get($$store_subs ??= {}, '$providerType', providerType)].providers[$.store_get($$store_subs ??= {}, '$provider', provider)].needAHand) {
																	$$renderer.push('<!--[0-->');

																	const needAHand = providers[$.store_get($$store_subs ??= {}, '$providerType', providerType)].providers[$.store_get($$store_subs ??= {}, '$provider', provider)].needAHand;

																	if (ActionList.Item.Accordion) {
																		$$renderer.push('<!--[-->');

																		ActionList.Item.Accordion($$renderer, {
																			hasDivider: true,
																			title: `How to enable ${getProviderText($.store_get($$store_subs ??= {}, '$provider', provider))} ${$.store_get($$store_subs ??= {}, '$providerType', providerType) === MessagingProviderType.Push || $.store_get($$store_subs ??= {}, '$providerType', providerType) === MessagingProviderType.Sms
																				? `${getProviderDisplayNameAndIcon($.store_get($$store_subs ??= {}, '$provider', provider)).displayName} notifications`
																				: getProviderText($.store_get($$store_subs ??= {}, '$provider', provider))}?`,
																			icon: IconInfo,
																			children: ($$renderer) => {
																				if (Layout.Stack) {
																					$$renderer.push('<!--[-->');

																					Layout.Stack($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!--[-->`);

																							const each_array = $.ensure_array_like(needAHand);

																							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																								let p = each_array[$$index];

																								$$renderer.push(`<p>${$.html(p)}</p>`);
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
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]--> `);

																if (ActionList.Item.Anchor) {
																	$$renderer.push('<!--[-->');

																	ActionList.Item.Anchor($$renderer, {
																		hasDivider: true,
																		href: `https://appwrite.io/docs/products/messaging/${$.store_get($$store_subs ??= {}, '$provider', provider)}`,
																		title: 'Read the guide in the docs',
																		icon: IconBookOpen,
																		target: '_blank',
																		rel: 'noreferrer'
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (ActionList.Item.Button) {
																	$$renderer.push('<!--[-->');
																	ActionList.Item.Button($$renderer, { title: 'Invite a team member', icon: IconUserGroup });
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
					},

					footer: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									justifyContent: 'flex-end',
									direction: 'row',
									children: ($$renderer) => {
										Button($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Create`);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}
					}
				}
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
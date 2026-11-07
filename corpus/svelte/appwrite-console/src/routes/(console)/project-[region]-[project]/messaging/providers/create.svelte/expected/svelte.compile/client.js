import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<p></p>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Create($$anchor, $$props) {
	$.push($$props, true);

	const $providerParams = () => $.store_get(providerParams, '$providerParams', $$stores);
	const $provider = () => $.store_get(provider, '$provider', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const $providerType = () => $.store_get(providerType, '$providerType', $$stores);
	const $newMemberModal = () => $.store_get(newMemberModal, '$newMemberModal', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let formRef;

	async function create() {
		try {
			let response;
			const providerId = $providerParams()[$provider()].providerId || ID.unique();

			switch ($provider()) {
				case Providers.Twilio:
					response = await sdk.forProject(page.params.region, page.params.project).messaging.createTwilioProvider({
						providerId,
						name: $providerParams()[$provider()].name,
						from: $providerParams()[$provider()].from,
						accountSid: $providerParams()[$provider()].accountSid,
						authToken: $providerParams()[$provider()].authToken,
						enabled: $providerParams()[$provider()].enabled
					});
					break;

				case Providers.Msg91:
					response = await sdk.forProject(page.params.region, page.params.project).messaging.createMsg91Provider({
						providerId,
						name: $providerParams()[$provider()].name,
						templateId: $providerParams()[$provider()].templateId,
						senderId: $providerParams()[$provider()].senderId,
						authKey: $providerParams()[$provider()].authKey,
						enabled: $providerParams()[$provider()].enabled
					});
					break;

				case Providers.Telesign:
					response = await sdk.forProject(page.params.region, page.params.project).messaging.createTelesignProvider({
						providerId,
						name: $providerParams()[$provider()].name,
						from: $providerParams()[$provider()].from,
						customerId: $providerParams()[$provider()].customerId,
						apiKey: $providerParams()[$provider()].apiKey,
						enabled: $providerParams()[$provider()].enabled
					});
					break;

				case Providers.Textmagic:
					response = await sdk.forProject(page.params.region, page.params.project).messaging.createTextmagicProvider({
						providerId,
						name: $providerParams()[$provider()].name,
						from: $providerParams()[$provider()].from,
						username: $providerParams()[$provider()].username,
						apiKey: $providerParams()[$provider()].apiKey,
						enabled: $providerParams()[$provider()].enabled
					});
					break;

				case Providers.Vonage:
					response = await sdk.forProject(page.params.region, page.params.project).messaging.createVonageProvider({
						providerId,
						name: $providerParams()[$provider()].name,
						from: $providerParams()[$provider()].from,
						apiKey: $providerParams()[$provider()].apiKey,
						apiSecret: $providerParams()[$provider()].apiSecret,
						enabled: $providerParams()[$provider()].enabled
					});
					break;

				case Providers.Mailgun:
					response = await sdk.forProject(page.params.region, page.params.project).messaging.createMailgunProvider({
						providerId,
						name: $providerParams()[$provider()].name,
						apiKey: $providerParams()[$provider()].apiKey,
						domain: $providerParams()[$provider()].domain,
						isEuRegion: $providerParams()[$provider()].isEuRegion,
						fromName: $providerParams()[$provider()].fromName || undefined,
						fromEmail: $providerParams()[$provider()].fromEmail,
						replyToName: $providerParams()[$provider()].replyToName || undefined,
						replyToEmail: $providerParams()[$provider()].replyToEmail || undefined,
						enabled: $providerParams()[$provider()].enabled
					});
					break;

				case Providers.Sendgrid:
					response = await sdk.forProject(page.params.region, page.params.project).messaging.createSendgridProvider({
						providerId,
						name: $providerParams()[$provider()].name,
						apiKey: $providerParams()[$provider()].apiKey,
						fromName: $providerParams()[$provider()].fromName || undefined,
						fromEmail: $providerParams()[$provider()].fromEmail,
						replyToName: $providerParams()[$provider()].replyToName || undefined,
						replyToEmail: $providerParams()[$provider()].replyToEmail || undefined,
						enabled: $providerParams()[$provider()].enabled
					});
					break;

				case Providers.Resend:
					response = await sdk.forProject(page.params.region, page.params.project).messaging.createResendProvider({
						providerId,
						name: $providerParams()[$provider()].name,
						apiKey: $providerParams()[$provider()].apiKey,
						fromName: $providerParams()[$provider()].fromName || undefined,
						fromEmail: $providerParams()[$provider()].fromEmail,
						replyToName: $providerParams()[$provider()].replyToName || undefined,
						replyToEmail: $providerParams()[$provider()].replyToEmail || undefined,
						enabled: $providerParams()[$provider()].enabled
					});
					break;

				case Providers.SMTP:
					response = await sdk.forProject(page.params.region, page.params.project).messaging.createSMTPProvider({
						providerId,
						name: $providerParams()[$provider()].name,
						host: $providerParams()[$provider()].host,
						port: $providerParams()[$provider()].port || undefined,
						username: $providerParams()[$provider()].username || undefined,
						password: $providerParams()[$provider()].password || undefined,
						encryption: $providerParams()[$provider()].encryption,
						autoTLS: $providerParams()[$provider()].autoTLS,
						mailer: $providerParams()[$provider()].mailer || undefined,
						fromName: $providerParams()[$provider()].fromName || undefined,
						fromEmail: $providerParams()[$provider()].fromEmail,
						replyToName: $providerParams()[$provider()].replyToName || undefined,
						replyToEmail: $providerParams()[$provider()].replyToEmail || undefined,
						enabled: $providerParams()[$provider()].enabled
					});
					break;

				case Providers.FCM:
					response = await sdk.forProject(page.params.region, page.params.project).messaging.createFCMProvider({
						providerId,
						name: $providerParams()[$provider()].name,
						serviceAccountJSON: JSON.parse($providerParams()[$provider()].serviceAccountJSON),
						enabled: $providerParams()[$provider()].enabled
					});
					break;

				case Providers.APNS:
					response = await sdk.forProject(page.params.region, page.params.project).messaging.createAPNSProvider({
						providerId,
						name: $providerParams()[$provider()].name,
						authKey: $providerParams()[$provider()].authKey,
						authKeyId: $providerParams()[$provider()].authKeyId,
						teamId: $providerParams()[$provider()].teamId,
						bundleId: $providerParams()[$provider()].bundleId,
						sandbox: $providerParams()[$provider()].sandbox,
						enabled: $providerParams()[$provider()].enabled
					});
					break;
			}

			wizard.hide();

			addNotification({
				type: 'success',
				message: `${response.name} has been created`
			});

			trackEvent(Submit.MessagingProviderCreate, { provider: $provider() });
			await goto(`${base}/project-${$project().region}-${$project().$id}/messaging/providers/provider-${response.$id}`);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.MessagingProviderCreate);
		}
	}

	Wizard($$anchor, {
		title: 'Create provider',
		columnSize: 'l',
		confirmExit: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.bind_this(
				Form(node, {
					onSubmit: create,
					isModal: false,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								gap: 'xxl',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									Fieldset(node_2, {
										legend: 'Provider',
										children: ($$anchor, $$slotProps) => {
											Provider($$anchor, {});
										},
										$$slots: { default: true }
									});

									var node_3 = $.sibling(node_2, 2);

									Fieldset(node_3, {
										legend: 'Settings',
										children: ($$anchor, $$slotProps) => {
											Settings($$anchor, {});
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}),
				($$value) => formRef = $$value,
				() => formRef
			);

			var node_4 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					CreateMember($$anchor, {
						get showCreate() {
							$.mark_store_binding();

							return $newMemberModal();
						},

						set showCreate($$value) {
							$.store_set(newMemberModal, $$value);
						}
					});
				};

				$.if(node_4, ($$render) => {
					if ($newMemberModal()) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			aside: ($$anchor, $$slotProps) => {
				var fragment_7 = $.comment();
				var node_5 = $.first_child(fragment_7);

				$.component(node_5, () => Card.Base, ($$anchor, Card_Base) => {
					Card_Base($$anchor, {
						padding: 's',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_6 = $.first_child(fragment_8);

							$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
								Layout_Stack_1($$anchor, {
									gap: 's',
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root();
										var node_7 = $.first_child(fragment_9);

										$.component(node_7, () => Typography.Text, ($$anchor, Typography_Text) => {
											Typography_Text($$anchor, {
												variant: 'm-500',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Need a hand?');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => ActionList.Root, ($$anchor, ActionList_Root) => {
											ActionList_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = root_2();
													var node_9 = $.first_child(fragment_10);

													{
														var consequent_1 = ($$anchor) => {
															const needAHand = $.derived(() => providers[$providerType()].providers[$provider()].needAHand);
															var fragment_11 = $.comment();
															var node_10 = $.first_child(fragment_11);

															{
																let $0 = $.derived(() => `How to enable ${getProviderText($provider())} ${$providerType() === MessagingProviderType.Push || $providerType() === MessagingProviderType.Sms
																	? `${getProviderDisplayNameAndIcon($provider()).displayName} notifications`
																	: getProviderText($provider())}?`);

																$.component(node_10, () => ActionList.Item.Accordion, ($$anchor, ActionList_Item_Accordion) => {
																	ActionList_Item_Accordion($$anchor, {
																		hasDivider: true,
																		get title() {
																			return $.get($0);
																		},

																		get icon() {
																			return IconInfo;
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_12 = $.comment();
																			var node_11 = $.first_child(fragment_12);

																			$.component(node_11, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
																				Layout_Stack_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_13 = $.comment();
																						var node_12 = $.first_child(fragment_13);

																						$.each(node_12, 17, () => $.get(needAHand), $.index, ($$anchor, p) => {
																							var p_1 = root_1();

																							$.html(p_1, () => $.get(p), true);
																							$.reset(p_1);
																							$.append($$anchor, p_1);
																						});

																						$.append($$anchor, fragment_13);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_12);
																		},
																		$$slots: { default: true }
																	});
																});
															}

															$.append($$anchor, fragment_11);
														};

														$.if(node_9, ($$render) => {
															if (providers[$providerType()].providers[$provider()].needAHand) $$render(consequent_1);
														});
													}

													var node_13 = $.sibling(node_9, 2);

													{
														let $0 = $.derived(() => `https://appwrite.io/docs/products/messaging/${$provider()}`);

														$.component(node_13, () => ActionList.Item.Anchor, ($$anchor, ActionList_Item_Anchor) => {
															ActionList_Item_Anchor($$anchor, {
																hasDivider: true,
																get href() {
																	return $.get($0);
																},
																title: 'Read the guide in the docs',
																get icon() {
																	return IconBookOpen;
																},
																target: '_blank',
																rel: 'noreferrer'
															});
														});
													}

													var node_14 = $.sibling(node_13, 2);

													$.component(node_14, () => ActionList.Item.Button, ($$anchor, ActionList_Item_Button) => {
														ActionList_Item_Button($$anchor, {
															title: 'Invite a team member',
															get icon() {
																return IconUserGroup;
															},

															$$events: {
																click: () => {
																	$.store_set(newMemberModal, true);
																}
															}
														});
													});

													$.append($$anchor, fragment_10);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},

			footer: ($$anchor, $$slotProps) => {
				var fragment_14 = $.comment();
				var node_15 = $.first_child(fragment_14);

				$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
					Layout_Stack_3($$anchor, {
						justifyContent: 'flex-end',
						direction: 'row',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								$$events: { click: () => formRef.triggerSubmit() },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Create');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_14);
			}
		}
	});

	$.pop();
	$$cleanup();
}
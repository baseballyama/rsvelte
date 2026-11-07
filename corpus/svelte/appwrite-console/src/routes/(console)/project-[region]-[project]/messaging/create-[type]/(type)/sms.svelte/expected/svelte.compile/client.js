import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Wizard } from '$lib/layout';
import { Fieldset, Icon, Layout, Tag } from '@appwrite.io/pink-svelte';
import Button from '$lib/elements/forms/button.svelte';
import Form from '$lib/elements/forms/form.svelte';
import { sdk } from '$lib/stores/sdk';
import { goto } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { addNotification } from '$lib/stores/notifications';
import { writable } from 'svelte/store';
import { ID, MessagingProviderType } from '@appwrite.io/console';
import CustomId from '$lib/components/customId.svelte';
import { IconPencil } from '@appwrite.io/pink-icons-svelte';
import InputTextarea from '$lib/elements/forms/inputTextarea.svelte';
import Targets from './(components)/targets.svelte';
import Schedule from './(components)/schedule.svelte';
import SmsPhone from '../../smsPhone.svelte';

var root = $.from_html(`<!> Message ID`, 1);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Sms($$anchor, $$props) {
	$.push($$props, true);

	const $isSubmitting = () => $.store_get(isSubmitting, '$isSubmitting', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showExitModal = false;
	let formComponent;
	let isSubmitting = writable(false);
	let showCustomId = false;
	let id = null;
	let content;
	let topics;
	let users;
	let targets;
	let draft;
	let scheduledAt;

	async function create() {
		try {
			const messageId = id || ID.unique();

			const response = await sdk.forProject(page.params.region, page.params.project).messaging.createSMS({
				messageId,
				content,
				topics,
				users,
				targets,
				draft,
				scheduledAt
			});

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
			trackEvent(Submit.MessagingMessageCreate, { providerType: 'email', status: response.status });
			await goto(`${base}/project-${page.params.region}-${page.params.project}/messaging/message-${response.$id}`);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.MessagingMessageCreate);
		}
	}

	function saveAsDraft() {
		draft = true;
		formComponent.triggerSubmit();
	}

	{
		let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/messaging/`);

		Wizard($$anchor, {
			title: 'Create SMS message',
			get href() {
				return $.get($0);
			},
			confirmExit: true,
			get showExitModal() {
				return showExitModal;
			},

			set showExitModal($$value) {
				showExitModal = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				$.bind_this(
					Form($$anchor, {
						onSubmit: create,
						get isSubmitting() {
							return isSubmitting;
						},

						set isSubmitting($$value) {
							isSubmitting = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node = $.first_child(fragment_2);

							$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
								Layout_Stack($$anchor, {
									gap: 'xxl',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_3();
										var node_1 = $.first_child(fragment_3);

										Fieldset(node_1, {
											legend: 'Message',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_2 = $.first_child(fragment_4);

												$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
													Layout_Stack_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root_2();
															var node_3 = $.first_child(fragment_5);

															InputTextarea(node_3, {
																id: 'message',
																label: 'Message',
																required: true,
																autofocus: true,
																maxlength: 900,
																placeholder: 'Type here...',
																get value() {
																	return content;
																},

																set value($$value) {
																	content = $$value;
																}
															});

															var node_4 = $.sibling(node_3, 2);

															{
																var consequent = ($$anchor) => {
																	var div = root_1();
																	var node_5 = $.child(div);

																	Tag(node_5, {
																		size: 's',
																		$$events: { click: () => showCustomId = !showCustomId },
																		children: ($$anchor, $$slotProps) => {
																			var fragment_6 = root();
																			var node_6 = $.first_child(fragment_6);

																			Icon(node_6, {
																				get icon() {
																					return IconPencil;
																				}
																			});

																			$.next();
																			$.append($$anchor, fragment_6);
																		},
																		$$slots: { default: true }
																	});

																	$.reset(div);
																	$.append($$anchor, div);
																};

																var alternate = ($$anchor) => {
																	CustomId($$anchor, {
																		autofocus: true,
																		name: 'Message',
																		get show() {
																			return showCustomId;
																		},

																		set show($$value) {
																			showCustomId = $$value;
																		},

																		get id() {
																			return id;
																		},

																		set id($$value) {
																			id = $$value;
																		}
																	});
																};

																$.if(node_4, ($$render) => {
																	if (!showCustomId) $$render(consequent); else $$render(alternate, -1);
																});
															}

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});

										var node_7 = $.sibling(node_1, 2);

										Fieldset(node_7, {
											legend: 'Targets',
											children: ($$anchor, $$slotProps) => {
												Targets($$anchor, {
													get type() {
														return MessagingProviderType.Sms;
													},

													get topics() {
														return topics;
													},

													set topics($$value) {
														topics = $$value;
													},

													get targets() {
														return targets;
													},

													set targets($$value) {
														targets = $$value;
													}
												});
											},
											$$slots: { default: true }
										});

										var node_8 = $.sibling(node_7, 2);

										Fieldset(node_8, {
											legend: 'Settings',
											children: ($$anchor, $$slotProps) => {
												Schedule($$anchor, {
													get targets() {
														return targets;
													},

													get scheduledAt() {
														return scheduledAt;
													},

													set scheduledAt($$value) {
														scheduledAt = $$value;
													}
												});
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
					($$value) => formComponent = $$value,
					() => formComponent
				);
			},

			$$slots: {
				default: true,
				aside: ($$anchor, $$slotProps) => {
					SmsPhone($$anchor, {
						get content() {
							return content;
						},
						slot: 'aside'
					});
				},

				footer: ($$anchor, $$slotProps) => {
					var fragment_11 = root_3();
					var node_9 = $.first_child(fragment_11);

					Button(node_9, {
						fullWidthMobile: true,
						secondary: true,
						$$events: { click: () => showExitModal = true },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Cancel');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Button(node_10, {
						fullWidthMobile: true,
						secondary: true,
						$$events: { click: saveAsDraft },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Save as draft');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Button(node_11, {
						fullWidthMobile: true,
						get disabled() {
							return $isSubmitting();
						},
						$$events: { click: () => formComponent.triggerSubmit() },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Create');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_11);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}
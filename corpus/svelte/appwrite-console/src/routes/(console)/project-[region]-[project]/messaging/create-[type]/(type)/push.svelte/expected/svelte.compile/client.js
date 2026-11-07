import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Wizard } from '$lib/layout';
import { Fieldset, Icon, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
import Button from '$lib/elements/forms/button.svelte';
import Form from '$lib/elements/forms/form.svelte';
import { sdk } from '$lib/stores/sdk';
import { goto } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { addNotification } from '$lib/stores/notifications';
import { writable } from 'svelte/store';
import { ID, MessagingProviderType } from '@appwrite.io/console';
import PushPhone from '../../pushPhone.svelte';
import CustomId from '$lib/components/customId.svelte';
import { IconPencil, IconPlus } from '@appwrite.io/pink-icons-svelte';
import InputText from '$lib/elements/forms/inputText.svelte';
import InputTextarea from '$lib/elements/forms/inputTextarea.svelte';
import InputFilePicker from '$lib/elements/forms/inputFilePicker.svelte';
import Targets from './(components)/targets.svelte';
import Schedule from './(components)/schedule.svelte';

var root = $.from_html(`<!> Message ID`, 1);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<span class="icon-x" aria-hidden="true"></span>`);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<!> <div><!></div>`, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);

export default function Push($$anchor, $$props) {
	$.push($$props, true);

	const $data = () => $.store_get(data, '$data', $$stores);
	const $isSubmitting = () => $.store_get(isSubmitting, '$isSubmitting', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showExitModal = false;
	let formComponent;
	let isSubmitting = writable(false);
	let showCustomId = false;
	let id = null;
	let file;
	let data = writable([['', '']]);
	let title;
	let body;
	let topics;
	let users;
	let targets;
	let draft;
	let scheduledAt;

	async function create() {
		try {
			const messageId = id || ID.unique();
			const fileCompoundId = file ? `${file.bucketId}:${file.$id}` : undefined;
			const customData = {};

			for (const item of $data()) {
				if (item[0] === '') continue;

				customData[item[0]] = item[1];
			}

			const response = await sdk.forProject(page.params.region, page.params.project).messaging.createPush({
				messageId,
				title,
				body,
				topics,
				users,
				targets,
				data: customData,
				image: fileCompoundId,
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
			trackEvent(Submit.MessagingMessageCreate, { providerType: 'push', status: response.status });
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
			title: 'Create push message',
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
										var fragment_3 = root_2();
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

															InputText(node_3, {
																id: 'title',
																label: 'Title',
																required: true,
																autofocus: true,
																placeholder: 'Enter title',
																get value() {
																	return title;
																},

																set value($$value) {
																	title = $$value;
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

															var node_7 = $.sibling(node_4, 2);

															InputTextarea(node_7, {
																id: 'message',
																label: 'Message',
																placeholder: 'Type here...',
																required: true,
																maxlength: 1000,
																get value() {
																	return body;
																},

																set value($$value) {
																	body = $$value;
																}
															});

															var node_8 = $.sibling(node_7, 2);

															InputFilePicker(node_8, {
																label: 'Media',
																get value() {
																	return file;
																},

																set value($$value) {
																	file = $$value;
																}
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});

										var node_9 = $.sibling(node_1, 2);

										Fieldset(node_9, {
											legend: 'Custom data',
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = $.comment();
												var node_10 = $.first_child(fragment_8);

												$.component(node_10, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
													Layout_Stack_2($$anchor, {
														gap: 'l',
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_4();
															var node_11 = $.first_child(fragment_9);

															$.component(node_11, () => Typography.Text, ($$anchor, Typography_Text) => {
																Typography_Text($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('A key/value payload of additional metadata that\'s hidden from users. Use\n                        this to include information to support logic such as redirection and\n                        routing.');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var node_12 = $.sibling(node_11, 2);

															$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																Layout_Stack_3($$anchor, {
																	gap: 's',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = root_5();
																		var node_13 = $.first_child(fragment_10);

																		$.each(node_13, 1, $data, $.index, ($$anchor, _, index) => {
																			var fragment_11 = $.comment();
																			var node_14 = $.first_child(fragment_11);

																			$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																				Layout_Stack_4($$anchor, {
																					direction: 'row',
																					alignItems: 'flex-end',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_12 = root_4();
																						var node_15 = $.first_child(fragment_12);

																						InputText(node_15, {
																							id: `key-${index}`,
																							placeholder: 'Enter key',
																							label: index === 0 ? 'Key' : undefined,
																							get value() {
																								return $data()[index][0];
																							},

																							set value($$value) {
																								$.store_mutate(data, $.untrack($data)[index][0] = $$value, $.untrack($data));
																							}
																						});

																						var node_16 = $.sibling(node_15, 2);

																						$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
																							Layout_Stack_5($$anchor, {
																								direction: 'row',
																								alignItems: 'flex-end',
																								gap: 'xs',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_13 = root_4();
																									var node_17 = $.first_child(fragment_13);

																									InputText(node_17, {
																										id: `value-${index}`,
																										placeholder: 'Enter value',
																										label: index === 0 ? 'Value' : undefined,
																										get value() {
																											return $data()[index][1];
																										},

																										set value($$value) {
																											$.store_mutate(data, $.untrack($data)[index][1] = $$value, $.untrack($data));
																										}
																									});

																									var node_18 = $.sibling(node_17, 2);

																									{
																										let $0 = $.derived(() => (!$data()[index][0] || !$data()[index][1]) && index === 0);

																										Button(node_18, {
																											icon: true,
																											compact: true,
																											get disabled() {
																												return $.get($0);
																											},

																											$$events: {
																												click: () => {
																													if (index === 0 && $data()?.length === 1) {
																														$.store_set(data, [['', '']]);
																													} else {
																														$data().splice(index, 1);
																														$.store_set(data, $data());
																													}
																												}
																											},

																											children: ($$anchor, $$slotProps) => {
																												var span = root_3();

																												$.append($$anchor, span);
																											},
																											$$slots: { default: true }
																										});
																									}

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

																			$.append($$anchor, fragment_11);
																		});

																		var div_1 = $.sibling(node_13, 2);
																		var node_19 = $.child(div_1);

																		{
																			let $0 = $.derived(() => $data().length > 0 && $data()[$data().length - 1][0] === '');

																			Button(node_19, {
																				compact: true,
																				get disabled() {
																					return $.get($0);
																				},
																				$$events: { click: () => $.store_set(data, [...$data(), ['', '']]) },
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_1 = $.text('Add data');

																					$.append($$anchor, text_1);
																				},

																				$$slots: {
																					default: true,
																					start: ($$anchor, $$slotProps) => {
																						Icon($$anchor, {
																							get icon() {
																								return IconPlus;
																							},
																							slot: 'start',
																							size: 's'
																						});
																					}
																				}
																			});
																		}

																		$.reset(div_1);
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

										var node_20 = $.sibling(node_9, 2);

										Fieldset(node_20, {
											legend: 'Targets',
											children: ($$anchor, $$slotProps) => {
												Targets($$anchor, {
													get type() {
														return MessagingProviderType.Push;
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

										var node_21 = $.sibling(node_20, 2);

										Fieldset(node_21, {
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
					PushPhone($$anchor, {
						get title() {
							return title;
						},

						get body() {
							return body;
						},
						slot: 'aside'
					});
				},

				footer: ($$anchor, $$slotProps) => {
					var fragment_18 = root_6();
					var node_22 = $.first_child(fragment_18);

					Button(node_22, {
						fullWidthMobile: true,
						secondary: true,
						$$events: { click: () => showExitModal = true },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Cancel');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_23 = $.sibling(node_22, 2);

					Button(node_23, {
						fullWidthMobile: true,
						secondary: true,
						$$events: { click: saveAsDraft },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Save as draft');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_24 = $.sibling(node_23, 2);

					Button(node_24, {
						fullWidthMobile: true,
						get disabled() {
							return $isSubmitting();
						},
						$$events: { click: () => formComponent.triggerSubmit() },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Create');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_18);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}
import * as $ from 'svelte/internal/server';
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

export default function Push($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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

				for (const item of $.store_get($$store_subs ??= {}, '$data', data)) {
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				title: 'Create push message',
				href: `${base}/project-${page.params.region}-${page.params.project}/messaging/`,
				confirmExit: true,
				get showExitModal() {
					return showExitModal;
				},

				set showExitModal($$value) {
					showExitModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Form($$renderer, {
						onSubmit: create,
						get isSubmitting() {
							return isSubmitting;
						},

						set isSubmitting($$value) {
							isSubmitting = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xxl',
									children: ($$renderer) => {
										Fieldset($$renderer, {
											legend: 'Message',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														children: ($$renderer) => {
															InputText($$renderer, {
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
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----> `);

															if (!showCustomId) {
																$$renderer.push(`<!--[0--><div>`);

																Tag($$renderer, {
																	size: 's',
																	children: ($$renderer) => {
																		Icon($$renderer, { icon: IconPencil });
																		$$renderer.push(`<!----> Message ID`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----></div>`);
															} else {
																$$renderer.push('<!--[-1-->');

																CustomId($$renderer, {
																	autofocus: true,
																	name: 'Message',
																	get show() {
																		return showCustomId;
																	},

																	set show($$value) {
																		showCustomId = $$value;
																		$$settled = false;
																	},

																	get id() {
																		return id;
																	},

																	set id($$value) {
																		id = $$value;
																		$$settled = false;
																	}
																});
															}

															$$renderer.push(`<!--]--> `);

															InputTextarea($$renderer, {
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
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----> `);

															InputFilePicker($$renderer, {
																label: 'Media',
																get value() {
																	return file;
																},

																set value($$value) {
																	file = $$value;
																	$$settled = false;
																}
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

										Fieldset($$renderer, {
											legend: 'Custom data',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 'l',
														children: ($$renderer) => {
															if (Typography.Text) {
																$$renderer.push('<!--[-->');

																Typography.Text($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->A key/value payload of additional metadata that's hidden from users. Use
                        this to include information to support logic such as redirection and
                        routing.`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 's',
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$data', data));

																		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
																			let _ = each_array[index];

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					direction: 'row',
																					alignItems: 'flex-end',
																					children: ($$renderer) => {
																						InputText($$renderer, {
																							id: `key-${index}`,
																							placeholder: 'Enter key',
																							label: index === 0 ? 'Key' : undefined,
																							get value() {
																								return $.store_get($$store_subs ??= {}, '$data', data)[index][0];
																							},

																							set value($$value) {
																								$.store_mutate($$store_subs ??= {}, '$data', data, $.store_get($$store_subs ??= {}, '$data', data)[index][0] = $$value);
																								$$settled = false;
																							}
																						});

																						$$renderer.push(`<!----> `);

																						if (Layout.Stack) {
																							$$renderer.push('<!--[-->');

																							Layout.Stack($$renderer, {
																								direction: 'row',
																								alignItems: 'flex-end',
																								gap: 'xs',
																								children: ($$renderer) => {
																									InputText($$renderer, {
																										id: `value-${index}`,
																										placeholder: 'Enter value',
																										label: index === 0 ? 'Value' : undefined,
																										get value() {
																											return $.store_get($$store_subs ??= {}, '$data', data)[index][1];
																										},

																										set value($$value) {
																											$.store_mutate($$store_subs ??= {}, '$data', data, $.store_get($$store_subs ??= {}, '$data', data)[index][1] = $$value);
																											$$settled = false;
																										}
																									});

																									$$renderer.push(`<!----> `);

																									Button($$renderer, {
																										icon: true,
																										compact: true,
																										disabled: (!$.store_get($$store_subs ??= {}, '$data', data)[index][0] || !$.store_get($$store_subs ??= {}, '$data', data)[index][1]) && index === 0,
																										children: ($$renderer) => {
																											$$renderer.push(`<span class="icon-x" aria-hidden="true"></span>`);
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

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}

																		$$renderer.push(`<!--]--> <div>`);

																		Button($$renderer, {
																			compact: true,
																			disabled: $.store_get($$store_subs ??= {}, '$data', data).length > 0 && $.store_get($$store_subs ??= {}, '$data', data)[$.store_get($$store_subs ??= {}, '$data', data).length - 1][0] === '',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Add data`);
																			},

																			$$slots: {
																				default: true,
																				start: ($$renderer) => {
																					Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
																				}
																			}
																		});

																		$$renderer.push(`<!----></div>`);
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

										$$renderer.push(`<!----> `);

										Fieldset($$renderer, {
											legend: 'Targets',
											children: ($$renderer) => {
												Targets($$renderer, {
													type: MessagingProviderType.Push,
													get topics() {
														return topics;
													},

													set topics($$value) {
														topics = $$value;
														$$settled = false;
													},

													get targets() {
														return targets;
													},

													set targets($$value) {
														targets = $$value;
														$$settled = false;
													}
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Fieldset($$renderer, {
											legend: 'Settings',
											children: ($$renderer) => {
												Schedule($$renderer, {
													targets,
													get scheduledAt() {
														return scheduledAt;
													},

													set scheduledAt($$value) {
														scheduledAt = $$value;
														$$settled = false;
													}
												});
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
				},

				$$slots: {
					default: true,
					aside: ($$renderer) => {
						PushPhone($$renderer, { title, body, slot: 'aside' });
					},

					footer: ($$renderer) => {
						{
							Button($$renderer, {
								fullWidthMobile: true,
								secondary: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								fullWidthMobile: true,
								secondary: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Save as draft`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								fullWidthMobile: true,
								disabled: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Create`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
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
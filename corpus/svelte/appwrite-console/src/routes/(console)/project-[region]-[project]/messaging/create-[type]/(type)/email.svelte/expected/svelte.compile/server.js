import * as $ from 'svelte/internal/server';
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
import InputText from '$lib/elements/forms/inputText.svelte';
import InputTextarea from '$lib/elements/forms/inputTextarea.svelte';
import Targets from './(components)/targets.svelte';
import Schedule from './(components)/schedule.svelte';
import InputSwitch from '$lib/elements/forms/inputSwitch.svelte';

export default function Email($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let showExitModal = false;
		let formComponent;
		let isSubmitting = writable(false);
		let showCustomId = false;
		let id = null;
		let subject;
		let content;
		let topics;
		let users;
		let targets;
		let draft = false;
		let html = false;
		let scheduledAt = undefined;

		async function create() {
			try {
				const messageId = id || ID.unique();

				const response = await sdk.forProject(page.params.region, page.params.project).messaging.createEmail({
					messageId,
					subject,
					content,
					topics,
					users,
					targets,
					draft,
					html,
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				title: 'Create email message',
				columnSize: 's',
				href: `${base}/project-${page.params.region}-${page.params.project}/messaging/`,
				column: true,
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
																id: 'subject',
																label: 'Subject',
																required: true,
																autofocus: true,
																placeholder: 'Enter subject',
																get value() {
																	return subject;
																},

																set value($$value) {
																	subject = $$value;
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
																required: true,
																placeholder: 'Type here...',
																get value() {
																	return content;
																},

																set value($$value) {
																	content = $$value;
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----> `);

															InputSwitch($$renderer, {
																label: 'HTML mode',
																id: 'html',
																get value() {
																	return html;
																},

																set value($$value) {
																	html = $$value;
																	$$settled = false;
																},

																$$slots: {
																	description: ($$renderer) => {
																		{
																			$$renderer.push(`Enable the HTML mode if your message contains HTML tags.`);
																		}
																	}
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
											legend: 'Targets',
											children: ($$renderer) => {
												Targets($$renderer, {
													type: MessagingProviderType.Email,
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
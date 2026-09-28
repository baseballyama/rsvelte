import * as $ from 'svelte/internal/server';
import { Button, Form, InputEmail, InputText, InputTextarea } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { baseEmailTemplate, emailTemplate } from './store';
import deepEqual from 'deep-equal';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { ProjectEmailTemplateLocale } from '@appwrite.io/console';
import { Icon, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';
import { IconInfo } from '@appwrite.io/pink-icons-svelte';
import TemplateSkeleton from './templateSkeleton.svelte';

export default function EmailTemplate($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			loading = false,
			isUpdating = false,
			project,
			children = null
		} = $$props;

		let eventType = Submit.EmailUpdateInviteTemplate;
		let isResetting = false;
		const isSmtpEnabled = $.derived(() => project?.smtpEnabled);
		const isButtonDisabled = $.derived(() => deepEqual($.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate), $.store_get($$store_subs ??= {}, '$baseEmailTemplate', baseEmailTemplate)));

		async function saveEmailTemplate() {
			const locale = $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).locale || ProjectEmailTemplateLocale.En;

			// TODO: uncomment after SDK is updated
			// if (!isValueOfStringEnum(TemplateType, $emailTemplate.type)) {
			//     throw new Error(`Invalid template type: ${$emailTemplate.type}`);
			// }
			// if (!isValueOfStringEnum(TemplateLocale, $emailTemplate.locale)) {
			//     throw new Error(`Invalid template locale: ${$emailTemplate.locale}`);
			// }
			try {
				switch ($.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).type) {
					case 'invitation':
						eventType = Submit.EmailUpdateInviteTemplate;
						break;

					case 'magicSession':
						eventType = Submit.EmailUpdateMagicUrlTemplate;
						break;

					case 'recovery':
						eventType = Submit.EmailUpdateRecoveryTemplate;
						break;

					case 'verification':
						eventType = Submit.EmailUpdateVerificationTemplate;
						break;
				}

				await sdk.forProject(project.region, project.$id).project.updateEmailTemplate({
					templateId: $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).type,
					locale,
					subject: $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).subject ?? undefined,
					message: $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).message ?? undefined,
					senderName: $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).senderName ?? undefined,
					senderEmail: $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).senderEmail ?? undefined,
					replyToEmail: $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).replyToEmail ?? undefined,
					replyToName: $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).replyToName ?? undefined
				});

				$.store_set(baseEmailTemplate, {
					...$.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate)
				});

				addNotification({
					type: 'success',
					message: `Email ${$.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).type} template for ${$.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).locale} updated`
				});

				trackEvent(eventType, {
					locale: $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).locale
				});
			} catch(e) {
				trackError(e, eventType);
				addNotification({ type: 'error', message: e.message });
			}
		}

		async function resetToDefault() {
			const locale = $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).locale || ProjectEmailTemplateLocale.En;

			isResetting = true;

			try {
				const defaults = await sdk.forConsole.console.getEmailTemplate({
					templateId: $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).type,
					locale
				});

				$.store_set(emailTemplate, {
					...$.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate),
					subject: defaults.subject,
					message: defaults.message,
					senderName: defaults.senderName,
					senderEmail: defaults.senderEmail,
					replyToEmail: defaults.replyToEmail,
					replyToName: defaults.replyToName
				});

				await saveEmailTemplate();
			} catch(e) {
				addNotification({ type: 'error', message: e.message });
			} finally {
				isResetting = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_style(isUpdating ? 'pointer-events: none' : '')}${$.attr_class('', void 0, { 'u-opacity-0': isUpdating })}>`);

			Form($$renderer, {
				onSubmit: saveEmailTemplate,
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							children: ($$renderer) => {
								if (loading) {
									$$renderer.push('<!--[0-->');
									TemplateSkeleton($$renderer, { count: 3 });
								} else {
									$$renderer.push('<!--[-1-->');

									InputText($$renderer, {
										id: 'senderName',
										label: 'Sender name',
										placeholder: 'Enter sender name',
										disabled: !isSmtpEnabled(),
										get value() {
											return $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).senderName;
										},

										set value($$value) {
											$.store_mutate($$store_subs ??= {}, '$emailTemplate', emailTemplate, $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).senderName = $$value);
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									InputEmail($$renderer, {
										id: 'senderEmail',
										label: 'Sender email',
										placeholder: 'Enter sender email',
										disabled: !isSmtpEnabled(),
										get value() {
											return $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).senderEmail;
										},

										set value($$value) {
											$.store_mutate($$store_subs ??= {}, '$emailTemplate', emailTemplate, $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).senderEmail = $$value);
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									InputEmail($$renderer, {
										id: 'replyToEmail',
										label: 'Reply to email',
										placeholder: 'noreply@appwrite.io',
										disabled: !isSmtpEnabled(),
										get value() {
											return $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).replyToEmail;
										},

										set value($$value) {
											$.store_mutate($$store_subs ??= {}, '$emailTemplate', emailTemplate, $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).replyToEmail = $$value);
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									InputText($$renderer, {
										id: 'replyToName',
										label: 'Reply to name',
										placeholder: 'Enter reply to name',
										disabled: !isSmtpEnabled(),
										get value() {
											return $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).replyToName;
										},

										set value($$value) {
											$.store_mutate($$store_subs ??= {}, '$emailTemplate', emailTemplate, $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).replyToName = $$value);
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									if (children) {
										$$renderer.push(`<!--[0--><p class="text">Click to copy variables for the fields below. Learn more <a class="link" href="https://appwrite.io/docs/advanced/platform/message-templates">here</a>.</p> `);

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												wrap: 'wrap',
												children: ($$renderer) => {
													children($$renderer);
													$$renderer.push(`<!---->`);
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

									InputText($$renderer, {
										id: 'subject',
										label: 'Subject',
										placeholder: 'Enter subject',
										get value() {
											return $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).subject;
										},

										set value($$value) {
											$.store_mutate($$store_subs ??= {}, '$emailTemplate', emailTemplate, $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).subject = $$value);
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									InputTextarea($$renderer, {
										id: 'message',
										label: 'Message',
										placeholder: 'Enter your message',
										readonly: !isSmtpEnabled(),
										rows: 8,
										get value() {
											return $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).message;
										},

										set value($$value) {
											$.store_mutate($$store_subs ??= {}, '$emailTemplate', emailTemplate, $.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate).message = $$value);
											$$settled = false;
										},

										$$slots: {
											info: ($$renderer) => {
												Tooltip($$renderer, {
													slot: 'info',
													maxWidth: '15rem',
													children: ($$renderer) => {
														Icon($$renderer, { icon: IconInfo, size: 's' });
													},

													$$slots: {
														default: true,
														tooltip: ($$renderer) => {
															if (Typography.Caption) {
																$$renderer.push('<!--[-->');

																Typography.Caption($$renderer, {
																	variant: '400',
																	slot: 'tooltip',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Set up an SMTP server to edit the message body`);
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
												});
											}
										}
									});

									$$renderer.push(`<!---->`);
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

					$$renderer.push(` <div class="u-sep-block-start u-margin-block-start-24"></div> <div class="u-flex u-gap-16 u-main-end u-margin-block-start-24">`);

					Button($$renderer, {
						secondary: true,
						disabled: isResetting || !isSmtpEnabled(),
						children: ($$renderer) => {
							$$renderer.push(`<!---->Reset to default`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						submit: true,
						disabled: isButtonDisabled(),
						children: ($$renderer) => {
							$$renderer.push(`<!---->Update`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
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
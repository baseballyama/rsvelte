import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<p class="text">Click to copy variables for the fields below. Learn more <a class="link" href="https://appwrite.io/docs/advanced/platform/message-templates">here</a>.</p> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="u-sep-block-start u-margin-block-start-24"></div> <div class="u-flex u-gap-16 u-main-end u-margin-block-start-24"><!> <!></div>`, 1);
var root_3 = $.from_html(`<div><!></div>`);

export default function EmailTemplate($$anchor, $$props) {
	$.push($$props, true);

	const $emailTemplate = () => $.store_get(emailTemplate, '$emailTemplate', $$stores);
	const $baseEmailTemplate = () => $.store_get(baseEmailTemplate, '$baseEmailTemplate', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let loading = $.prop($$props, 'loading', 3, false),
		isUpdating = $.prop($$props, 'isUpdating', 3, false),
		children = $.prop($$props, 'children', 3, null);

	let eventType = $.state($.proxy(Submit.EmailUpdateInviteTemplate));
	let isResetting = $.state(false);
	const isSmtpEnabled = $.derived(() => $$props.project?.smtpEnabled);
	const isButtonDisabled = $.derived(() => deepEqual($emailTemplate(), $baseEmailTemplate()));

	async function saveEmailTemplate() {
		const locale = $emailTemplate().locale || ProjectEmailTemplateLocale.En;

		// TODO: uncomment after SDK is updated
		// if (!isValueOfStringEnum(TemplateType, $emailTemplate.type)) {
		//     throw new Error(`Invalid template type: ${$emailTemplate.type}`);
		// }
		// if (!isValueOfStringEnum(TemplateLocale, $emailTemplate.locale)) {
		//     throw new Error(`Invalid template locale: ${$emailTemplate.locale}`);
		// }
		try {
			switch ($emailTemplate().type) {
				case 'invitation':
					$.set(eventType, Submit.EmailUpdateInviteTemplate, true);
					break;

				case 'magicSession':
					$.set(eventType, Submit.EmailUpdateMagicUrlTemplate, true);
					break;

				case 'recovery':
					$.set(eventType, Submit.EmailUpdateRecoveryTemplate, true);
					break;

				case 'verification':
					$.set(eventType, Submit.EmailUpdateVerificationTemplate, true);
					break;
			}

			await sdk.forProject($$props.project.region, $$props.project.$id).project.updateEmailTemplate({
				templateId: $emailTemplate().type,
				locale,
				subject: $emailTemplate().subject ?? undefined,
				message: $emailTemplate().message ?? undefined,
				senderName: $emailTemplate().senderName ?? undefined,
				senderEmail: $emailTemplate().senderEmail ?? undefined,
				replyToEmail: $emailTemplate().replyToEmail ?? undefined,
				replyToName: $emailTemplate().replyToName ?? undefined
			});

			$.store_set(baseEmailTemplate, { ...$emailTemplate() });

			addNotification({
				type: 'success',
				message: `Email ${$emailTemplate().type} template for ${$emailTemplate().locale} updated`
			});

			trackEvent($.get(eventType), { locale: $emailTemplate().locale });
		} catch(e) {
			trackError(e, $.get(eventType));
			addNotification({ type: 'error', message: e.message });
		}
	}

	async function resetToDefault() {
		const locale = $emailTemplate().locale || ProjectEmailTemplateLocale.En;

		$.set(isResetting, true);

		try {
			const defaults = await sdk.forConsole.console.getEmailTemplate({ templateId: $emailTemplate().type, locale });

			$.store_set(emailTemplate, {
				...$emailTemplate(),
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
			$.set(isResetting, false);
		}
	}

	var div = root_3();
	let classes;
	var node = $.child(div);

	Form(node, {
		onSubmit: saveEmailTemplate,
		children: ($$anchor, $$slotProps) => {
			var fragment = root_2();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_2 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								TemplateSkeleton($$anchor, { count: 3 });
							};

							var alternate = ($$anchor) => {
								var fragment_3 = root_1();
								var node_3 = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => !$.get(isSmtpEnabled));

									InputText(node_3, {
										id: 'senderName',
										label: 'Sender name',
										placeholder: 'Enter sender name',
										get disabled() {
											return $.get($0);
										},

										get value() {
											return $emailTemplate().senderName;
										},

										set value($$value) {
											$.store_mutate(emailTemplate, $.untrack($emailTemplate).senderName = $$value, $.untrack($emailTemplate));
										}
									});
								}

								var node_4 = $.sibling(node_3, 2);

								{
									let $0 = $.derived(() => !$.get(isSmtpEnabled));

									InputEmail(node_4, {
										id: 'senderEmail',
										label: 'Sender email',
										placeholder: 'Enter sender email',
										get disabled() {
											return $.get($0);
										},

										get value() {
											return $emailTemplate().senderEmail;
										},

										set value($$value) {
											$.store_mutate(emailTemplate, $.untrack($emailTemplate).senderEmail = $$value, $.untrack($emailTemplate));
										}
									});
								}

								var node_5 = $.sibling(node_4, 2);

								{
									let $0 = $.derived(() => !$.get(isSmtpEnabled));

									InputEmail(node_5, {
										id: 'replyToEmail',
										label: 'Reply to email',
										placeholder: 'noreply@appwrite.io',
										get disabled() {
											return $.get($0);
										},

										get value() {
											return $emailTemplate().replyToEmail;
										},

										set value($$value) {
											$.store_mutate(emailTemplate, $.untrack($emailTemplate).replyToEmail = $$value, $.untrack($emailTemplate));
										}
									});
								}

								var node_6 = $.sibling(node_5, 2);

								{
									let $0 = $.derived(() => !$.get(isSmtpEnabled));

									InputText(node_6, {
										id: 'replyToName',
										label: 'Reply to name',
										placeholder: 'Enter reply to name',
										get disabled() {
											return $.get($0);
										},

										get value() {
											return $emailTemplate().replyToName;
										},

										set value($$value) {
											$.store_mutate(emailTemplate, $.untrack($emailTemplate).replyToName = $$value, $.untrack($emailTemplate));
										}
									});
								}

								var node_7 = $.sibling(node_6, 2);

								{
									var consequent_1 = ($$anchor) => {
										var fragment_4 = root();
										var node_8 = $.sibling($.first_child(fragment_4), 2);

										$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
											Layout_Stack_1($$anchor, {
												direction: 'row',
												wrap: 'wrap',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_9 = $.first_child(fragment_5);

													$.snippet(node_9, children);
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									};

									$.if(node_7, ($$render) => {
										if (children()) $$render(consequent_1);
									});
								}

								var node_10 = $.sibling(node_7, 2);

								InputText(node_10, {
									id: 'subject',
									label: 'Subject',
									placeholder: 'Enter subject',
									get value() {
										return $emailTemplate().subject;
									},

									set value($$value) {
										$.store_mutate(emailTemplate, $.untrack($emailTemplate).subject = $$value, $.untrack($emailTemplate));
									}
								});

								var node_11 = $.sibling(node_10, 2);

								{
									let $0 = $.derived(() => !$.get(isSmtpEnabled));

									InputTextarea(node_11, {
										id: 'message',
										label: 'Message',
										placeholder: 'Enter your message',
										get readonly() {
											return $.get($0);
										},
										rows: 8,
										get value() {
											return $emailTemplate().message;
										},

										set value($$value) {
											$.store_mutate(emailTemplate, $.untrack($emailTemplate).message = $$value, $.untrack($emailTemplate));
										},

										$$slots: {
											info: ($$anchor, $$slotProps) => {
												Tooltip($$anchor, {
													slot: 'info',
													maxWidth: '15rem',
													children: ($$anchor, $$slotProps) => {
														Icon($$anchor, {
															get icon() {
																return IconInfo;
															},
															size: 's'
														});
													},

													$$slots: {
														default: true,
														tooltip: ($$anchor, $$slotProps) => {
															var fragment_8 = $.comment();
															var node_12 = $.first_child(fragment_8);

															$.component(node_12, () => Typography.Caption, ($$anchor, Typography_Caption) => {
																Typography_Caption($$anchor, {
																	variant: '400',
																	slot: 'tooltip',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('Set up an SMTP server to edit the message body');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_8);
														}
													}
												});
											}
										}
									});
								}

								$.append($$anchor, fragment_3);
							};

							$.if(node_2, ($$render) => {
								if (loading()) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var div_1 = $.sibling(node_1, 4);
			var node_13 = $.child(div_1);

			{
				let $0 = $.derived(() => $.get(isResetting) || !$.get(isSmtpEnabled));

				Button(node_13, {
					secondary: true,
					get disabled() {
						return $.get($0);
					},
					$$events: { click: resetToDefault },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Reset to default');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			}

			var node_14 = $.sibling(node_13, 2);

			Button(node_14, {
				submit: true,
				get disabled() {
					return $.get(isButtonDisabled);
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Update');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_style(div, isUpdating() ? 'pointer-events: none' : '');
		classes = $.set_class(div, 1, '', null, classes, { 'u-opacity-0': isUpdating() });
	});

	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}
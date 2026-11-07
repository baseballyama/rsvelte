import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CardGrid } from '$lib/components';
import { Button, Form, InputText, InputEmail } from '$lib/elements/forms';
import { Container } from '$lib/layout';
import InputPassword from '$lib/elements/forms/inputPassword.svelte';
import { sdk } from '$lib/stores/sdk';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
import InputNumber from '$lib/elements/forms/inputNumber.svelte';
import { resolve } from '$app/paths';
import deepEqual from 'deep-equal';
import { currentPlan } from '$lib/stores/organization';
import InputSelect from '$lib/elements/forms/inputSelect.svelte';
import { getChangePlanUrl } from '$lib/stores/billing';
import { Link, Selector, Alert } from '@appwrite.io/pink-svelte';
import { isCloud } from '$lib/system';

var root = $.from_html(`You can customize the email service by providing your own SMTP server. View your email templates <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $currentPlan = () => $.store_get(currentPlan, '$currentPlan', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const project = $.derived(() => $$props.data.project);
	let enabled = $.state(false);
	let replyToEmail = $.state('');
	let replyToName = $.state('');
	let senderName = $.state('');
	let senderEmail = $.state('');
	let host = $.state('');
	let port = $.state(null);
	let username = $.state('');
	let password = $.state('');
	let secure = $.state('');

	const options = [
		{ value: 'tls', label: 'TLS' },
		{ value: 'ssl', label: 'SSL' },
		{ value: '', label: 'None' }
	];

	function normalizeSecure(v) {
		return v === 'tls' || v === 'ssl' ? v : '';
	}

	const isButtonDisabled = $.derived(() => {
		return deepEqual(
			{
				enabled: $.get(enabled),
				senderName: $.get(senderName) ?? '',
				senderEmail: $.get(senderEmail) ?? '',
				replyToEmail: $.get(replyToEmail) ?? '',
				replyToName: $.get(replyToName) ?? '',
				host: $.get(host) ?? '',
				port: $.get(port) ?? null,
				username: $.get(username) ?? '',
				password: $.get(password) ?? '',
				secure: $.get(secure)
			},
			{
				enabled: $.get(project).smtpEnabled ?? false,
				senderName: $.get(project).smtpSenderName ?? '',
				senderEmail: $.get(project).smtpSenderEmail ?? '',
				replyToEmail: $.get(project).smtpReplyToEmail ?? '',
				replyToName: $.get(project).smtpReplyToName ?? '',
				host: $.get(project).smtpHost ?? '',
				port: $.get(project).smtpPort ?? null,
				username: $.get(project).smtpUsername ?? '',
				password: $.get(project).smtpPassword ?? '',
				secure: normalizeSecure($.get(project).smtpSecure ?? '')
			}
		);
	});

	async function updateSmtp() {
		try {
			await sdk.forProject($.get(project).region, $.get(project).$id).project.updateSMTP({
				enabled: $.get(enabled),
				senderName: $.get(senderName) ?? undefined,
				senderEmail: $.get(senderEmail) ?? undefined,
				replyToEmail: $.get(replyToEmail) ?? undefined,
				replyToName: $.get(replyToName) ?? undefined,
				host: $.get(host) ?? undefined,
				port: $.get(port) ?? undefined,
				username: $.get(username) ?? undefined,
				password: $.get(password) ?? undefined,
				secure: $.get(secure) ? $.get(secure) : undefined
			});

			invalidate(Dependencies.PROJECT);

			addNotification({
				type: 'success',
				message: `SMTP server has been ${$.get(enabled) ? 'enabled.' : 'disabled.'}`
			});

			trackEvent(Submit.ProjectUpdateSMTP);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.ProjectUpdateSMTP);
		}
	}

	$.user_effect(() => {
		$.set(enabled, $.get(project).smtpEnabled ?? false, true);
		$.set(senderName, $.get(project).smtpSenderName ?? '', true);
		$.set(senderEmail, $.get(project).smtpSenderEmail ?? '', true);
		$.set(replyToEmail, $.get(project).smtpReplyToEmail ?? '', true);
		$.set(replyToName, $.get(project).smtpReplyToName ?? '', true);
		$.set(host, $.get(project).smtpHost ?? '', true);
		$.set(port, $.get(project).smtpPort ?? null, true);
		$.set(username, $.get(project).smtpUsername ?? '', true);
		$.set(password, $.get(project).smtpPassword ?? '', true);
		$.set(secure, normalizeSecure($.get(project).smtpSecure ?? ''), true);
	});

	Container($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Form($$anchor, {
				onSubmit: updateSmtp,
				children: ($$anchor, $$slotProps) => {
					CardGrid($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_3 = root();
							var node = $.sibling($.first_child(fragment_3));

							{
								let $0 = $.derived(() => resolve('/(console)/project-[region]-[project]/auth/templates', { project: $.get(project).$id, region: $.get(project).region }));

								$.component(node, () => Link.Anchor, ($$anchor, Link_Anchor) => {
									Link_Anchor($$anchor, {
										get href() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('here');

											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});
							}

							$.append($$anchor, fragment_3);
						},

						$$slots: {
							default: true,
							title: ($$anchor, $$slotProps) => {
								var text_1 = $.text('SMTP server');

								$.append($$anchor, text_1);
							},

							aside: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_1 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										var fragment_5 = $.comment();
										var node_2 = $.first_child(fragment_5);

										$.component(node_2, () => Alert.Inline, ($$anchor, Alert_Inline) => {
											Alert_Inline($$anchor, {
												status: 'info',
												title: 'Custom SMTP is a paid plan feature. Upgrade to enable custom SMTP server.',
												$$slots: {
													actions: ($$anchor, $$slotProps) => {
														{
															let $0 = $.derived(() => getChangePlanUrl($.get(project).teamId));

															Button($$anchor, {
																compact: true,
																get href() {
																	return $.get($0);
																},

																$$events: {
																	click: () => {
																		trackEvent(Click.OrganizationClickUpgrade, { source: 'project_settings' });
																	}
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('Upgrade plan');

																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});
														}
													}
												}
											});
										});

										$.append($$anchor, fragment_5);
									};

									var alternate = ($$anchor) => {
										var fragment_7 = root_2();
										var node_3 = $.first_child(fragment_7);

										$.component(node_3, () => Selector.Switch, ($$anchor, Selector_Switch) => {
											Selector_Switch($$anchor, {
												id: 'enabled',
												label: 'Custom SMTP server',
												description: 'Enabling this option allows customizing email templates and prevents emails\n                from being labeled as spam.',
												get checked() {
													return $.get(enabled);
												},

												set checked($$value) {
													$.set(enabled, $$value, true);
												}
											});
										});

										var node_4 = $.sibling(node_3, 2);

										{
											var consequent_1 = ($$anchor) => {
												var fragment_8 = root_1();
												var node_5 = $.first_child(fragment_8);

												InputText(node_5, {
													id: 'senderName',
													label: 'Sender name',
													required: true,
													placeholder: 'Enter sender name',
													get value() {
														return $.get(senderName);
													},

													set value($$value) {
														$.set(senderName, $$value, true);
													}
												});

												var node_6 = $.sibling(node_5, 2);

												InputEmail(node_6, {
													id: 'senderEmail',
													label: 'Sender email',
													required: true,
													placeholder: 'user@example.io',
													get value() {
														return $.get(senderEmail);
													},

													set value($$value) {
														$.set(senderEmail, $$value, true);
													}
												});

												var node_7 = $.sibling(node_6, 2);

												InputEmail(node_7, {
													id: 'replyToEmail',
													label: 'Reply to email',
													placeholder: 'user@example.io',
													get value() {
														return $.get(replyToEmail);
													},

													set value($$value) {
														$.set(replyToEmail, $$value, true);
													}
												});

												var node_8 = $.sibling(node_7, 2);

												InputText(node_8, {
													id: 'replyToName',
													label: 'Reply to name',
													placeholder: 'Enter reply to name',
													get value() {
														return $.get(replyToName);
													},

													set value($$value) {
														$.set(replyToName, $$value, true);
													}
												});

												var node_9 = $.sibling(node_8, 2);

												InputText(node_9, {
													id: 'serverHost',
													label: 'Server host',
													required: true,
													placeholder: 'smtp.server.com',
													get value() {
														return $.get(host);
													},

													set value($$value) {
														$.set(host, $$value, true);
													}
												});

												var node_10 = $.sibling(node_9, 2);

												InputNumber(node_10, {
													id: 'serverPort',
													label: 'Server port',
													required: true,
													placeholder: '587',
													get value() {
														return $.get(port);
													},

													set value($$value) {
														$.set(port, $$value, true);
													}
												});

												var node_11 = $.sibling(node_10, 2);

												InputText(node_11, {
													id: 'username',
													label: 'Username',
													placeholder: 'Enter username',
													get value() {
														return $.get(username);
													},

													set value($$value) {
														$.set(username, $$value, true);
													}
												});

												var node_12 = $.sibling(node_11, 2);

												InputPassword(node_12, {
													id: 'passwort',
													label: 'Password',
													placeholder: 'Enter password',
													get value() {
														return $.get(password);
													},

													set value($$value) {
														$.set(password, $$value, true);
													}
												});

												var node_13 = $.sibling(node_12, 2);

												InputSelect(node_13, {
													id: 'tls',
													label: 'ProjectSMTPSecure protocol',
													placeholder: 'Select protocol',
													get options() {
														return options;
													},

													get value() {
														return $.get(secure);
													},

													set value($$value) {
														$.set(secure, $$value, true);
													}
												});

												$.append($$anchor, fragment_8);
											};

											$.if(node_4, ($$render) => {
												if ($.get(enabled)) $$render(consequent_1);
											});
										}

										$.append($$anchor, fragment_7);
									};

									$.if(node_1, ($$render) => {
										if (isCloud && !$currentPlan().customSmtp) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_4);
							},

							actions: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => $.get(isButtonDisabled) || isCloud && !$currentPlan().customSmtp);

									Button($$anchor, {
										submit: true,
										get disabled() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Update');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								}
							}
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}
import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
		const project = $.derived(() => data.project);
		let enabled = false;
		let replyToEmail = '';
		let replyToName = '';
		let senderName = '';
		let senderEmail = '';
		let host = '';
		let port = null;
		let username = '';
		let password = '';
		let secure = '';

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
					enabled,
					senderName: senderName ?? '',
					senderEmail: senderEmail ?? '',
					replyToEmail: replyToEmail ?? '',
					replyToName: replyToName ?? '',
					host: host ?? '',
					port: port ?? null,
					username: username ?? '',
					password: password ?? '',
					secure
				},
				{
					enabled: project().smtpEnabled ?? false,
					senderName: project().smtpSenderName ?? '',
					senderEmail: project().smtpSenderEmail ?? '',
					replyToEmail: project().smtpReplyToEmail ?? '',
					replyToName: project().smtpReplyToName ?? '',
					host: project().smtpHost ?? '',
					port: project().smtpPort ?? null,
					username: project().smtpUsername ?? '',
					password: project().smtpPassword ?? '',
					secure: normalizeSecure(project().smtpSecure ?? '')
				}
			);
		});

		async function updateSmtp() {
			try {
				await sdk.forProject(project().region, project().$id).project.updateSMTP({
					enabled,
					senderName: senderName ?? undefined,
					senderEmail: senderEmail ?? undefined,
					replyToEmail: replyToEmail ?? undefined,
					replyToName: replyToName ?? undefined,
					host: host ?? undefined,
					port: port ?? undefined,
					username: username ?? undefined,
					password: password ?? undefined,
					secure: secure ? secure : undefined
				});

				invalidate(Dependencies.PROJECT);

				addNotification({
					type: 'success',
					message: `SMTP server has been ${enabled ? 'enabled.' : 'disabled.'}`
				});

				trackEvent(Submit.ProjectUpdateSMTP);
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.ProjectUpdateSMTP);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					Form($$renderer, {
						onSubmit: updateSmtp,
						children: ($$renderer) => {
							CardGrid($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->You can customize the email service by providing your own SMTP server. View your email templates `);

									if (Link.Anchor) {
										$$renderer.push('<!--[-->');

										Link.Anchor($$renderer, {
											href: resolve('/(console)/project-[region]-[project]/auth/templates', { project: project().$id, region: project().region }),
											children: ($$renderer) => {
												$$renderer.push(`<!---->here`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},

								$$slots: {
									default: true,
									title: ($$renderer) => {
										{
											$$renderer.push(`SMTP server`);
										}
									},

									aside: ($$renderer) => {
										{
											if (isCloud && !$.store_get($$store_subs ??= {}, '$currentPlan', currentPlan).customSmtp) {
												$$renderer.push('<!--[0-->');

												if (Alert.Inline) {
													$$renderer.push('<!--[-->');

													Alert.Inline($$renderer, {
														status: 'info',
														title: 'Custom SMTP is a paid plan feature. Upgrade to enable custom SMTP server.',
														$$slots: {
															actions: ($$renderer) => {
																{
																	Button($$renderer, {
																		compact: true,
																		href: getChangePlanUrl(project().teamId),
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Upgrade plan`);
																		},
																		$$slots: { default: true }
																	});
																}
															}
														}
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											} else {
												$$renderer.push('<!--[-1-->');

												if (Selector.Switch) {
													$$renderer.push('<!--[-->');

													Selector.Switch($$renderer, {
														id: 'enabled',
														label: 'Custom SMTP server',
														description: 'Enabling this option allows customizing email templates and prevents emails\n                from being labeled as spam.',
														get checked() {
															return enabled;
														},

														set checked($$value) {
															enabled = $$value;
															$$settled = false;
														}
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (enabled) {
													$$renderer.push('<!--[0-->');

													InputText($$renderer, {
														id: 'senderName',
														label: 'Sender name',
														required: true,
														placeholder: 'Enter sender name',
														get value() {
															return senderName;
														},

														set value($$value) {
															senderName = $$value;
															$$settled = false;
														}
													});

													$$renderer.push(`<!----> `);

													InputEmail($$renderer, {
														id: 'senderEmail',
														label: 'Sender email',
														required: true,
														placeholder: 'user@example.io',
														get value() {
															return senderEmail;
														},

														set value($$value) {
															senderEmail = $$value;
															$$settled = false;
														}
													});

													$$renderer.push(`<!----> `);

													InputEmail($$renderer, {
														id: 'replyToEmail',
														label: 'Reply to email',
														placeholder: 'user@example.io',
														get value() {
															return replyToEmail;
														},

														set value($$value) {
															replyToEmail = $$value;
															$$settled = false;
														}
													});

													$$renderer.push(`<!----> `);

													InputText($$renderer, {
														id: 'replyToName',
														label: 'Reply to name',
														placeholder: 'Enter reply to name',
														get value() {
															return replyToName;
														},

														set value($$value) {
															replyToName = $$value;
															$$settled = false;
														}
													});

													$$renderer.push(`<!----> `);

													InputText($$renderer, {
														id: 'serverHost',
														label: 'Server host',
														required: true,
														placeholder: 'smtp.server.com',
														get value() {
															return host;
														},

														set value($$value) {
															host = $$value;
															$$settled = false;
														}
													});

													$$renderer.push(`<!----> `);

													InputNumber($$renderer, {
														id: 'serverPort',
														label: 'Server port',
														required: true,
														placeholder: '587',
														get value() {
															return port;
														},

														set value($$value) {
															port = $$value;
															$$settled = false;
														}
													});

													$$renderer.push(`<!----> `);

													InputText($$renderer, {
														id: 'username',
														label: 'Username',
														placeholder: 'Enter username',
														get value() {
															return username;
														},

														set value($$value) {
															username = $$value;
															$$settled = false;
														}
													});

													$$renderer.push(`<!----> `);

													InputPassword($$renderer, {
														id: 'passwort',
														label: 'Password',
														placeholder: 'Enter password',
														get value() {
															return password;
														},

														set value($$value) {
															password = $$value;
															$$settled = false;
														}
													});

													$$renderer.push(`<!----> `);

													InputSelect($$renderer, {
														id: 'tls',
														label: 'ProjectSMTPSecure protocol',
														placeholder: 'Select protocol',
														options,
														get value() {
															return secure;
														},

														set value($$value) {
															secure = $$value;
															$$settled = false;
														}
													});

													$$renderer.push(`<!---->`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
											}

											$$renderer.push(`<!--]-->`);
										}
									},

									actions: ($$renderer) => {
										{
											Button($$renderer, {
												submit: true,
												disabled: isButtonDisabled() || isCloud && !$.store_get($$store_subs ??= {}, '$currentPlan', currentPlan).customSmtp,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Update`);
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
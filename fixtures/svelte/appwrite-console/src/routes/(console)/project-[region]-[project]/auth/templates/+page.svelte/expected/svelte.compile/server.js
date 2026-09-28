import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';
import { CardGrid } from '$lib/components';
import { Container } from '$lib/layout';
import { baseEmailTemplate, emailTemplate, templates } from './store';
import { Button } from '$lib/elements/forms';
import { currentPlan } from '$lib/stores/organization';
import EmailSignature from './emailSignature.svelte';
import { isCloud } from '$lib/system';
import { Accordion, Alert, Badge, Layout, Link, Typography } from '@appwrite.io/pink-svelte';
import { page } from '$app/state';
import { ProjectEmailTemplateLocale, ProjectEmailTemplateId } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';

export async function loadEmailTemplate(
	region,
	projectId,
	type,
	locale = ProjectEmailTemplateLocale.En
) {
	try {
		const template = await sdk.forProject(region, projectId).project.getEmailTemplate({ templateId: type, locale });

		return normalizeEmailTemplate(template, type, locale);
	} catch(e) {
		addNotification({ type: 'error', message: e.message });
	}
}

function normalizeEmailTemplate(template, type, locale = ProjectEmailTemplateLocale.En) {
	return {
		...template,
		type,
		templateId: template.templateId ?? type,
		locale: template.locale ?? locale
	};
}

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let templateType = null;
		let isTemplateLoading = false;
		let openStates = Object.fromEntries(templates.map(({ key }) => [key, false]));

		loadTemplateFor(ProjectEmailTemplateId.Verification);

		async function loadTemplateFor(type) {
			// return, already loaded!
			if (templateType === type) return;

			templateType = type;
			isTemplateLoading = true;
			$.store_set(emailTemplate, await loadEmailTemplate(page.params.region, page.params.project, type, ProjectEmailTemplateLocale.En));

			$.store_set(baseEmailTemplate, {
				...$.store_get($$store_subs ??= {}, '$emailTemplate', emailTemplate)
			});

			isTemplateLoading = false;
		}

		function toggleAccordion(type) {
			for (const key in openStates) {
				openStates[key] = false;
			}

			openStates[type] = true;
			loadTemplateFor(type);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					if (!data.project.smtpEnabled) {
						$$renderer.push('<!--[0-->');

						if (Alert.Inline) {
							$$renderer.push('<!--[-->');

							Alert.Inline($$renderer, {
								dismissible: false,
								status: 'info',
								title: 'Custom SMTP server is required for customizing emails',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Configure a custom SMTP server to enable custom email templates and prevent emails from
            being labeled as spam.`);
								},

								$$slots: {
									default: true,
									actions: ($$renderer) => {
										Button($$renderer, {
											compact: true,
											slot: 'actions',
											href: `${base}/project-${page.params.region}-${page.params.project}/settings/smtp`,
											children: ($$renderer) => {
												$$renderer.push(`<!---->SMTP settings`);
											},
											$$slots: { default: true }
										});
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
					}

					$$renderer.push(`<!--]--> `);

					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Use templates to send and process account management emails. `);

							if (Link.Anchor) {
								$$renderer.push('<!--[-->');

								Link.Anchor($$renderer, {
									target: '_blank',
									href: 'https://appwrite.io/docs/advanced/platform/message-templates',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Learn more`);
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
									$$renderer.push(`Email templates `);
									Badge($$renderer, { variant: 'secondary', content: 'Experimental' });
									$$renderer.push(`<!---->`);
								}
							},

							aside: ($$renderer) => {
								{
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 's',
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(templates);

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let section = each_array[$$index];

													Accordion($$renderer, {
														title: section.title,
														hideDivider: section.hideDivider,
														get open() {
															return openStates[section.key];
														},

														set open($$value) {
															openStates[section.key] = $$value;
															$$settled = false;
														},

														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	children: ($$renderer) => {
																		const SectionComponent = section.component;

																		if (Typography.Text) {
																			$$renderer.push('<!--[-->');

																			Typography.Text($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(section.description)}`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (SectionComponent) {
																			$$renderer.push('<!--[-->');

																			SectionComponent($$renderer, {
																				loading: isTemplateLoading,
																				project: data.project,
																				localeCodes: data.localeCodes
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
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										href: `${base}/project-${page.params.region}-${page.params.project}/settings/smtp`,
										secondary: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->SMTP settings`);
										},
										$$slots: { default: true }
									});
								}
							}
						}
					});

					$$renderer.push(`<!----> `);

					if (isCloud && $.store_get($$store_subs ??= {}, '$currentPlan', currentPlan).emailBranding) {
						$$renderer.push('<!--[0-->');
						EmailSignature($$renderer, { project: data.project });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
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
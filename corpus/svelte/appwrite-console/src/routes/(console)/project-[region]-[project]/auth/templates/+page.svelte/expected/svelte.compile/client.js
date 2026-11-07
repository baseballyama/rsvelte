import 'svelte/internal/disclose-version';
import { ProjectEmailTemplateLocale, ProjectEmailTemplateId } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`Use templates to send and process account management emails. <!>`, 1);
var root_1 = $.from_html(`Email templates <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $emailTemplate = () => $.store_get(emailTemplate, '$emailTemplate', $$stores);
	const $baseEmailTemplate = () => $.store_get(baseEmailTemplate, '$baseEmailTemplate', $$stores);
	const $currentPlan = () => $.store_get(currentPlan, '$currentPlan', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let templateType = $.state(null);
	let isTemplateLoading = $.state(false);
	let openStates = $.proxy(Object.fromEntries(templates.map(({ key }) => [key, false])));

	loadTemplateFor(ProjectEmailTemplateId.Verification);

	async function loadTemplateFor(type) {
		// return, already loaded!
		if ($.get(templateType) === type) return;

		$.set(templateType, type, true);
		$.set(isTemplateLoading, true);
		$.store_set(emailTemplate, await loadEmailTemplate(page.params.region, page.params.project, type, ProjectEmailTemplateLocale.En));
		$.store_set(baseEmailTemplate, { ...$emailTemplate() });
		$.set(isTemplateLoading, false);
	}

	function toggleAccordion(type) {
		for (const key in openStates) {
			openStates[key] = false;
		}

		openStates[type] = true;
		loadTemplateFor(type);
	}

	Container($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Alert.Inline, ($$anchor, Alert_Inline) => {
						Alert_Inline($$anchor, {
							dismissible: false,
							status: 'info',
							title: 'Custom SMTP server is required for customizing emails',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Configure a custom SMTP server to enable custom email templates and prevent emails from\n            being labeled as spam.');

								$.append($$anchor, text);
							},

							$$slots: {
								default: true,
								actions: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/settings/smtp`);

										Button($$anchor, {
											compact: true,
											slot: 'actions',
											get href() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('SMTP settings');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									}
								}
							}
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node, ($$render) => {
					if (!$$props.data.project.smtpEnabled) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node, 2);

			CardGrid(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_4 = root();
					var node_3 = $.sibling($.first_child(fragment_4));

					$.component(node_3, () => Link.Anchor, ($$anchor, Link_Anchor) => {
						Link_Anchor($$anchor, {
							target: '_blank',
							href: 'https://appwrite.io/docs/advanced/platform/message-templates',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Learn more');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_4 = $.sibling($.first_child(fragment_5));

						Badge(node_4, { variant: 'secondary', content: 'Experimental' });
						$.append($$anchor, fragment_5);
					},

					aside: ($$anchor, $$slotProps) => {
						var fragment_6 = $.comment();
						var node_5 = $.first_child(fragment_6);

						$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								gap: 's',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_6 = $.first_child(fragment_7);

									$.each(node_6, 17, () => templates, (section) => section.key, ($$anchor, section) => {
										Accordion($$anchor, {
											get title() {
												return $.get(section).title;
											},

											get hideDivider() {
												return $.get(section).hideDivider;
											},

											get open() {
												return openStates[$.get(section).key];
											},

											set open($$value) {
												openStates[$.get(section).key] = $$value;
											},

											$$events: {
												toggle: (event) => event.detail && toggleAccordion($.get(section).key)
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_9 = $.comment();
												var node_7 = $.first_child(fragment_9);

												$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
													Layout_Stack_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															const SectionComponent = $.derived(() => $.get(section).component);
															var fragment_10 = root_2();
															var node_8 = $.first_child(fragment_10);

															$.component(node_8, () => Typography.Text, ($$anchor, Typography_Text) => {
																Typography_Text($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text();

																		$.template_effect(() => $.set_text(text_3, $.get(section).description));
																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_9 = $.sibling(node_8, 2);

															$.component(node_9, () => $.get(SectionComponent), ($$anchor, SectionComponent_1) => {
																SectionComponent_1($$anchor, {
																	get loading() {
																		return $.get(isTemplateLoading);
																	},

																	get project() {
																		return $$props.data.project;
																	},

																	get localeCodes() {
																		return $$props.data.localeCodes;
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

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_6);
					},

					actions: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/settings/smtp`);

							Button($$anchor, {
								get href() {
									return $.get($0);
								},
								secondary: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('SMTP settings');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});

			var node_10 = $.sibling(node_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					EmailSignature($$anchor, {
						get project() {
							return $$props.data.project;
						}
					});
				};

				$.if(node_10, ($$render) => {
					if (isCloud && $currentPlan().emailBranding) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}
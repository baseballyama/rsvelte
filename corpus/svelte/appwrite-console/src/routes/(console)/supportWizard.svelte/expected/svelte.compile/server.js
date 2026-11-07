import * as $ from 'svelte/internal/server';
import { Wizard } from '$lib/layout';
import { Icon, Input, Layout, Typography, Card, Upload } from '@appwrite.io/pink-svelte';
import { supportData, isSupportOnline } from './wizard/support/store';
import { onMount, onDestroy } from 'svelte';
import { sdk } from '$lib/stores/sdk';
import { Form, InputText, InputTextarea, Button } from '$lib/elements/forms/index.js';
import { Query } from '@appwrite.io/console';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

import {
	localeTimezoneName,
	utcHourToLocaleHour,
	utcWeekDayToLocaleWeekDay
} from '$lib/helpers/date';

import { addNotification } from '$lib/stores/notifications';
import { organization } from '$lib/stores/organization';
import { user } from '$lib/stores/user';
import { wizard } from '$lib/stores/wizard';
import { VARS } from '$lib/system';
import { IconCheckCircle, IconXCircle } from '@appwrite.io/pink-icons-svelte';
import { removeFile } from '$lib/helpers/files';

export default function SupportWizard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let projectOptions = [];
		let files = null;

		onMount(async () => {
			// Filter projects by organization ID using server-side queries
			const projectList = $.store_get($$store_subs ??= {}, '$organization', organization)?.$id
				? await sdk.forConsole.organization($.store_get($$store_subs ??= {}, '$organization', organization).$id).listProjects({
					queries: [
						Query.equal('teamId', $.store_get($$store_subs ??= {}, '$organization', organization).$id),
						Query.select(['$id', 'name'])
					]
				})
				: { projects: [] };

			projectOptions = projectList.projects.map((project) => ({ value: project.$id, label: project.name }));
		});

		// Cleanup on component destroy
		onDestroy(() => {
			$.store_set(supportData, { message: null, subject: null, file: null });
		});

		async function handleSubmit() {
			const formData = new FormData();

			formData.append('email', $.store_get($$store_subs ??= {}, '$user', user).email);
			formData.append('subject', $.store_get($$store_subs ??= {}, '$supportData', supportData).subject ?? '');
			formData.append('firstName', ($.store_get($$store_subs ??= {}, '$user', user)?.name || 'Unknown').slice(0, 40));
			formData.append('message', $.store_get($$store_subs ??= {}, '$supportData', supportData).message ?? '');
			formData.append('tags[]', 'cloud');

			formData.append('metaFields', JSON.stringify({
				orgId: $.store_get($$store_subs ??= {}, '$organization', organization)?.$id ?? '',
				projectId: $.store_get($$store_subs ??= {}, '$supportData', supportData)?.project ?? '',
				billingPlan: $.store_get($$store_subs ??= {}, '$organization', organization)?.billingPlanId ?? ''
			}));

			if (files && files.length > 0) {
				formData.append('attachment', files[0]);
			}

			const response = await fetch(`${VARS.GROWTH_ENDPOINT}/support`, { method: 'POST', body: formData });

			trackEvent(Submit.SupportTicket);

			if (response.status !== 200) {
				trackError(new Error(response.status.toString()), Submit.SupportTicket);

				addNotification({
					message: 'There was an error submitting your support ticket. Please try again later.',
					type: 'error'
				});
			} else {
				addNotification({
					message: 'Your support ticket was submitted successfully. The Appwrite team will get back to you shortly.',
					type: 'success'
				});
			}

			resetData();
			wizard.hide();
		}

		function resetData() {
			$.store_set(supportData, { message: null, subject: null, file: null, project: null });
		}

		$.store_mutate($$store_subs ??= {}, '$wizard', wizard, $.store_get($$store_subs ??= {}, '$wizard', wizard).finalAction = handleSubmit);

		function handleInvalid(_e) {
			addNotification({ type: 'error', message: 'Invalid file' });
		}

		const workTimings = {
			start: '04:00',
			end: '17:00',
			startDay: 'Monday',
			endDay: 'Friday'
		};

		const supportTimings = $.derived(() => `${utcHourToLocaleHour(workTimings.start)} - ${utcHourToLocaleHour(workTimings.end)} ${localeTimezoneName()}`);
		const supportWeekDays = $.derived(() => `${utcWeekDayToLocaleWeekDay(workTimings.startDay, workTimings.start)} - ${utcWeekDayToLocaleWeekDay(workTimings.endDay, workTimings.end)}`);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				title: 'Contact us',
				confirmExit: true,
				children: ($$renderer) => {
					Form($$renderer, {
						onSubmit: handleSubmit,
						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xl',
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												gap: 's',
												children: ($$renderer) => {
													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Please describe your request in detail. If applicable, include steps for
                    reproduction of any in-app issues.`);
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

										$$renderer.push(` `);

										if (Input.ComboBox) {
											$$renderer.push('<!--[-->');

											Input.ComboBox($$renderer, {
												id: 'project',
												label: 'Choose a project',
												options: projectOptions ?? [],
												placeholder: 'Select project',
												get value() {
													return $.store_get($$store_subs ??= {}, '$supportData', supportData).project;
												},

												set value($$value) {
													$.store_mutate($$store_subs ??= {}, '$supportData', supportData, $.store_get($$store_subs ??= {}, '$supportData', supportData).project = $$value);
													$$settled = false;
												}
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										InputText($$renderer, {
											id: 'subject',
											label: 'Subject',
											placeholder: 'What do you need help with?',
											maxlength: 128,
											required: true,
											get value() {
												return $.store_get($$store_subs ??= {}, '$supportData', supportData).subject;
											},

											set value($$value) {
												$.store_mutate($$store_subs ??= {}, '$supportData', supportData, $.store_get($$store_subs ??= {}, '$supportData', supportData).subject = $$value);
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										InputTextarea($$renderer, {
											id: 'message',
											placeholder: 'Type here...',
											label: 'Tell us a bit more',
											required: true,
											maxlength: 4096,
											get value() {
												return $.store_get($$store_subs ??= {}, '$supportData', supportData).message;
											},

											set value($$value) {
												$.store_mutate($$store_subs ??= {}, '$supportData', supportData, $.store_get($$store_subs ??= {}, '$supportData', supportData).message = $$value);
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										if (Upload.Dropzone) {
											$$renderer.push('<!--[-->');

											Upload.Dropzone($$renderer, {
												maxSize: 5 * 1024 * 1024,
												get files() {
													return files;
												},

												set files($$value) {
													files = $$value;
													$$settled = false;
												},

												children: ($$renderer) => {
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															alignItems: 'center',
															gap: 's',
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		variant: 'l-500',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Drag and drop a file here or click to upload`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Typography.Caption) {
																	$$renderer.push('<!--[-->');

																	Typography.Caption($$renderer, {
																		variant: '400',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Max file size: 5MB`);
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

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (files) {
											$$renderer.push('<!--[0-->');

											if (Upload.List) {
												$$renderer.push('<!--[-->');

												Upload.List($$renderer, {
													files: Array.from(files).map((f) => {
														return {
															...f,
															name: f.name,
															size: f.size,
															extension: f.type,
															removable: true
														};
													})
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

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												justifyContent: 'flex-end',
												gap: 's',
												children: ($$renderer) => {
													Button($$renderer, {
														size: 's',
														secondary: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Button($$renderer, {
														submit: true,
														size: 's',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Submit`);
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
						},
						$$slots: { default: true }
					});
				},

				$$slots: {
					default: true,
					aside: ($$renderer) => {
						{
							if (Card.Base) {
								$$renderer.push('<!--[-->');

								Card.Base($$renderer, {
									padding: 'm',
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												gap: 'xl',
												children: ($$renderer) => {
													if (Typography.Title) {
														$$renderer.push('<!--[-->');

														Typography.Title($$renderer, {
															size: 's',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Contact the Appwrite Team`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->If you found a bug or have questions, please reach out to the Appwrite team. We
                    try to respond to all messages within our office hours.`);
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
															direction: 'row',
															gap: 's',
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Available:`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		variant: 'm-500',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(supportWeekDays())}, ${$.escape(supportTimings())}`);
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

													$$renderer.push(` `);

													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															direction: 'row',
															gap: 's',
															children: ($$renderer) => {
																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Currently:`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (isSupportOnline()) {
																	$$renderer.push('<!--[0-->');

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			gap: 'xxxs',
																			alignItems: 'center',
																			children: ($$renderer) => {
																				Icon($$renderer, { icon: IconCheckCircle, color: '--fgcolor-success' });
																				$$renderer.push(`<!----> `);

																				if (Typography.Text) {
																					$$renderer.push('<!--[-->');

																					Typography.Text($$renderer, {
																						color: '--fgcolor-success',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Online`);
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
																} else {
																	$$renderer.push('<!--[-1-->');

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			gap: 'xxxs',
																			alignItems: 'center',
																			children: ($$renderer) => {
																				Icon($$renderer, { icon: IconXCircle });
																				$$renderer.push(`<!----> `);

																				if (Typography.Text) {
																					$$renderer.push('<!--[-->');

																					Typography.Text($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Offline`);
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

																$$renderer.push(`<!--]-->`);
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

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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
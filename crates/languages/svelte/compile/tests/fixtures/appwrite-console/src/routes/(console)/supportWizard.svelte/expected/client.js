import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function SupportWizard($$anchor, $$props) {
	$.push($$props, true);

	const $organization = () => $.store_get(organization, '$organization', $$stores);
	const $supportData = () => $.store_get(supportData, '$supportData', $$stores);
	const $user = () => $.store_get(user, '$user', $$stores);
	const $wizard = () => $.store_get(wizard, '$wizard', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let projectOptions = $.state($.proxy([]));
	let files = $.state(null);

	onMount(async () => {
		// Filter projects by organization ID using server-side queries
		const projectList = $organization()?.$id
			? await sdk.forConsole.organization($organization().$id).listProjects({
				queries: [
					Query.equal('teamId', $organization().$id),
					Query.select(['$id', 'name'])
				]
			})
			: { projects: [] };

		$.set(projectOptions, projectList.projects.map((project) => ({ value: project.$id, label: project.name })), true);
	});

	// Cleanup on component destroy
	onDestroy(() => {
		$.store_set(supportData, { message: null, subject: null, file: null });
	});

	async function handleSubmit() {
		const formData = new FormData();

		formData.append('email', $user().email);
		formData.append('subject', $supportData().subject ?? '');
		formData.append('firstName', ($user()?.name || 'Unknown').slice(0, 40));
		formData.append('message', $supportData().message ?? '');
		formData.append('tags[]', 'cloud');

		formData.append('metaFields', JSON.stringify({
			orgId: $organization()?.$id ?? '',
			projectId: $supportData()?.project ?? '',
			billingPlan: $organization()?.billingPlanId ?? ''
		}));

		if ($.get(files) && $.get(files).length > 0) {
			formData.append('attachment', $.get(files)[0]);
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

	$.store_mutate(wizard, $.untrack($wizard).finalAction = handleSubmit, $.untrack($wizard));

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

	Wizard($$anchor, {
		title: 'Contact us',
		confirmExit: true,
		children: ($$anchor, $$slotProps) => {
			Form($$anchor, {
				onSubmit: handleSubmit,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
						Layout_Stack($$anchor, {
							gap: 'xl',
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_1 = $.first_child(fragment_3);

								$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
									Layout_Stack_1($$anchor, {
										gap: 's',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_2 = $.first_child(fragment_4);

											$.component(node_2, () => Typography.Text, ($$anchor, Typography_Text) => {
												Typography_Text($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Please describe your request in detail. If applicable, include steps for\n                    reproduction of any in-app issues.');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								var node_3 = $.sibling(node_1, 2);

								{
									let $0 = $.derived(() => $.get(projectOptions) ?? []);

									$.component(node_3, () => Input.ComboBox, ($$anchor, Input_ComboBox) => {
										Input_ComboBox($$anchor, {
											id: 'project',
											label: 'Choose a project',
											get options() {
												return $.get($0);
											},
											placeholder: 'Select project',
											get value() {
												return $supportData().project;
											},

											set value($$value) {
												$.store_mutate(supportData, $.untrack($supportData).project = $$value, $.untrack($supportData));
											}
										});
									});
								}

								var node_4 = $.sibling(node_3, 2);

								InputText(node_4, {
									id: 'subject',
									label: 'Subject',
									placeholder: 'What do you need help with?',
									maxlength: 128,
									required: true,
									get value() {
										return $supportData().subject;
									},

									set value($$value) {
										$.store_mutate(supportData, $.untrack($supportData).subject = $$value, $.untrack($supportData));
									}
								});

								var node_5 = $.sibling(node_4, 2);

								InputTextarea(node_5, {
									id: 'message',
									placeholder: 'Type here...',
									label: 'Tell us a bit more',
									required: true,
									maxlength: 4096,
									get value() {
										return $supportData().message;
									},

									set value($$value) {
										$.store_mutate(supportData, $.untrack($supportData).message = $$value, $.untrack($supportData));
									}
								});

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => Upload.Dropzone, ($$anchor, Upload_Dropzone) => {
									Upload_Dropzone($$anchor, {
										maxSize: 5 * 1024 * 1024,
										get files() {
											return $.get(files);
										},

										set files($$value) {
											$.set(files, $$value, true);
										},
										$$events: { invalid: handleInvalid },
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_7 = $.first_child(fragment_5);

											$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
												Layout_Stack_2($$anchor, {
													alignItems: 'center',
													gap: 's',
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root();
														var node_8 = $.first_child(fragment_6);

														$.component(node_8, () => Typography.Text, ($$anchor, Typography_Text_1) => {
															Typography_Text_1($$anchor, {
																variant: 'l-500',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text('Drag and drop a file here or click to upload');

																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														var node_9 = $.sibling(node_8, 2);

														$.component(node_9, () => Typography.Caption, ($$anchor, Typography_Caption) => {
															Typography_Caption($$anchor, {
																variant: '400',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('Max file size: 5MB');

																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								var node_10 = $.sibling(node_6, 2);

								{
									var consequent = ($$anchor) => {
										var fragment_7 = $.comment();
										var node_11 = $.first_child(fragment_7);

										{
											let $0 = $.derived(() => Array.from($.get(files)).map((f) => {
												return {
													...f,
													name: f.name,
													size: f.size,
													extension: f.type,
													removable: true
												};
											}));

											$.component(node_11, () => Upload.List, ($$anchor, Upload_List) => {
												Upload_List($$anchor, {
													get files() {
														return $.get($0);
													},

													$$events: {
														remove: (e) => $.set(files, removeFile(e.detail, $.get(files)), true)
													}
												});
											});
										}

										$.append($$anchor, fragment_7);
									};

									$.if(node_10, ($$render) => {
										if ($.get(files)) $$render(consequent);
									});
								}

								var node_12 = $.sibling(node_10, 2);

								$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
									Layout_Stack_3($$anchor, {
										direction: 'row',
										justifyContent: 'flex-end',
										gap: 's',
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = root();
											var node_13 = $.first_child(fragment_8);

											Button(node_13, {
												size: 's',
												secondary: true,
												$$events: {
													click: () => {
														wizard.hide();
													}
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Cancel');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});

											var node_14 = $.sibling(node_13, 2);

											Button(node_14, {
												submit: true,
												size: 's',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Submit');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},

		$$slots: {
			default: true,
			aside: ($$anchor, $$slotProps) => {
				var fragment_9 = $.comment();
				var node_15 = $.first_child(fragment_9);

				$.component(node_15, () => Card.Base, ($$anchor, Card_Base) => {
					Card_Base($$anchor, {
						padding: 'm',
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = $.comment();
							var node_16 = $.first_child(fragment_10);

							$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
								Layout_Stack_4($$anchor, {
									gap: 'xl',
									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root_2();
										var node_17 = $.first_child(fragment_11);

										$.component(node_17, () => Typography.Title, ($$anchor, Typography_Title) => {
											Typography_Title($$anchor, {
												size: 's',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Contact the Appwrite Team');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_18 = $.sibling(node_17, 2);

										$.component(node_18, () => Typography.Text, ($$anchor, Typography_Text_2) => {
											Typography_Text_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('If you found a bug or have questions, please reach out to the Appwrite team. We\n                    try to respond to all messages within our office hours.');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_19 = $.sibling(node_18, 2);

										$.component(node_19, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
											Layout_Stack_5($$anchor, {
												direction: 'row',
												gap: 's',
												children: ($$anchor, $$slotProps) => {
													var fragment_12 = root();
													var node_20 = $.first_child(fragment_12);

													$.component(node_20, () => Typography.Text, ($$anchor, Typography_Text_3) => {
														Typography_Text_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('Available:');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_21 = $.sibling(node_20, 2);

													$.component(node_21, () => Typography.Text, ($$anchor, Typography_Text_4) => {
														Typography_Text_4($$anchor, {
															variant: 'm-500',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text();

																$.template_effect(() => $.set_text(text_8, `${$.get(supportWeekDays) ?? ''}, ${$.get(supportTimings) ?? ''}`));
																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_12);
												},
												$$slots: { default: true }
											});
										});

										var node_22 = $.sibling(node_19, 2);

										$.component(node_22, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
											Layout_Stack_6($$anchor, {
												direction: 'row',
												gap: 's',
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = root();
													var node_23 = $.first_child(fragment_14);

													$.component(node_23, () => Typography.Text, ($$anchor, Typography_Text_5) => {
														Typography_Text_5($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_9 = $.text('Currently:');

																$.append($$anchor, text_9);
															},
															$$slots: { default: true }
														});
													});

													var node_24 = $.sibling(node_23, 2);

													{
														var consequent_1 = ($$anchor) => {
															var fragment_15 = $.comment();
															var node_25 = $.first_child(fragment_15);

															$.component(node_25, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
																Layout_Stack_7($$anchor, {
																	direction: 'row',
																	gap: 'xxxs',
																	alignItems: 'center',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_16 = root();
																		var node_26 = $.first_child(fragment_16);

																		Icon(node_26, {
																			get icon() {
																				return IconCheckCircle;
																			},
																			color: '--fgcolor-success'
																		});

																		var node_27 = $.sibling(node_26, 2);

																		$.component(node_27, () => Typography.Text, ($$anchor, Typography_Text_6) => {
																			Typography_Text_6($$anchor, {
																				color: '--fgcolor-success',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_10 = $.text('Online');

																					$.append($$anchor, text_10);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_16);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_15);
														};

														var d = $.derived(() => isSupportOnline());

														var alternate = ($$anchor) => {
															var fragment_17 = $.comment();
															var node_28 = $.first_child(fragment_17);

															$.component(node_28, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
																Layout_Stack_8($$anchor, {
																	direction: 'row',
																	gap: 'xxxs',
																	alignItems: 'center',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_18 = root();
																		var node_29 = $.first_child(fragment_18);

																		Icon(node_29, {
																			get icon() {
																				return IconXCircle;
																			}
																		});

																		var node_30 = $.sibling(node_29, 2);

																		$.component(node_30, () => Typography.Text, ($$anchor, Typography_Text_7) => {
																			Typography_Text_7($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_11 = $.text('Offline');

																					$.append($$anchor, text_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_18);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_17);
														};

														$.if(node_24, ($$render) => {
															if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_14);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_9);
			}
		}
	});

	$.pop();
	$$cleanup();
}
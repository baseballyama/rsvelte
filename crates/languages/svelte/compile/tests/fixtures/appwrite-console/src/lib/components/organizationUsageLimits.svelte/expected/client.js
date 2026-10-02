import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, InputText } from '$lib/elements/forms';
import { getBasePlanFromGroup, getServiceLimit } from '$lib/stores/billing';
import { Click, trackEvent } from '$lib/actions/analytics';
import { Badge, Icon, Layout, Table, Typography, Tooltip } from '@appwrite.io/pink-svelte';
import { IconArrowUp, IconInfo } from '@appwrite.io/pink-icons-svelte';
import { formatNumberWithCommas } from '$lib/helpers/numbers';
import { Modal } from '$lib/components';
import { Alert } from '@appwrite.io/pink-svelte';
import { toLocaleDateTime } from '$lib/helpers/date';
import { BillingPlanGroup } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';

var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<span slot="tooltip">Usage beyond the Free plan limits.</span>`);
var root_6 = $.from_html(`<!> <div class="responsive-table svelte-15t2ozq"><!></div>`, 1);
var root_7 = $.from_html(`<!> <div class="controlled-selection svelte-15t2ozq"><!></div>`, 1);

export default function OrganizationUsageLimits($$anchor, $$props) {
	$.push($$props, true);

	let members = $.prop($$props, 'members', 19, () => []),
		storageUsage = $.prop($$props, 'storageUsage', 3, 0),
		projects = $.prop($$props, 'projects', 31, () => $.proxy([]));

	let showSelectProject = $.state(false);
	let error = $.state(null);
	let showSelectionReminder = $.state(false);
	let confirmationInput = $.state('');
	let isDeletingProjects = $.state(false);
	let selectedProjectsToDelete = $.state($.proxy([]));
	const baseFreePlan = getBasePlanFromGroup(BillingPlanGroup.Starter);

	// Derived state using runes
	const freePlanLimits = $.derived(() => ({
		projects: baseFreePlan?.projects,
		members: getServiceLimit('members', null, baseFreePlan),
		storage: getServiceLimit('storage', null, baseFreePlan)
	}));

	// When preparing to downgrade to Free, enforce Free plan limit locally (2)
	const allowedProjectsToKeep = $.derived(() => $.get(freePlanLimits).projects);

	const currentUsage = $.derived(() => ({
		projects: projects()?.length || 0,
		members: members()?.length || 0,
		storage: storageUsage() || 0
	}));

	const storageUsageGB = $.derived(() => storageUsage() / (1024 * 1024 * 1024));

	const isLimitExceeded = $.derived(() => ({
		projects: $.get(currentUsage).projects > $.get(freePlanLimits).projects,
		members: $.get(currentUsage).members > $.get(freePlanLimits).members,
		storage: $.get(storageUsageGB) > $.get(freePlanLimits).storage
	}));

	const excessUsage = $.derived(() => ({
		projects: Math.max(0, $.get(currentUsage).projects),
		members: Math.max(0, $.get(currentUsage).members - $.get(freePlanLimits).members),
		storage: Math.max(0, $.get(storageUsageGB) - $.get(freePlanLimits).storage)
	}));

	const isConfirmationValid = $.derived(() => $.get(confirmationInput).trim() === 'I understand');

	function formatNumber(num) {
		return formatNumberWithCommas(num);
	}

	function handleManageProjects() {
		$.set(showSelectProject, true);
		$.set(showSelectionReminder, false);
		trackEvent(Click.OrganizationClickUpgrade, { source: 'usage_limits_manage_projects' });
	}

	async function deleteSelected() {
		$.set(error, null);
		$.set(isDeletingProjects, true);

		const excessBy = $.get(isLimitExceeded).projects ? projects().length - $.get(allowedProjectsToKeep) : 0;
		const isUnderLimitPostSelection = $.get(selectedProjectsToDelete).length >= excessBy;

		if (!isUnderLimitPostSelection) {
			$.set(error, `You can keep a maximum ${$.get(allowedProjectsToKeep)} projects on the selected plan.`);

			return;
		}

		if ($.get(selectedProjectsToDelete)?.length) {
			const projectsDeletionPromises = $.get(selectedProjectsToDelete).map((projectId) => {
				const projectToDelete = projects().find((project) => project.$id === projectId);

				return {
					projectId,
					promise: sdk.forProject(projectToDelete.region, projectId).project.delete()
				};
			});

			try {
				const results = await Promise.allSettled(projectsDeletionPromises.map((p) => p.promise));
				const failed = [];
				const successfullyDeleted = [];

				results.forEach((result, index) => {
					const projectId = projectsDeletionPromises[index].projectId;

					if (result.status === 'fulfilled') {
						successfullyDeleted.push(projectId);
					} else {
						failed.push(projectId);
					}
				});

				if (successfullyDeleted.length > 0) {
					await invalidate(Dependencies.ORGANIZATION);

					addNotification({
						type: 'success',
						message: `${successfullyDeleted.length} project${successfullyDeleted.length !== 1 ? 's' : ''} deleted successfully`
					});
				}

				if (failed.length > 0) {
					$.set(error, `Failed to delete ${failed.length} project${failed.length !== 1 ? 's' : ''}`);
				} else {
					$.set(confirmationInput, '');
					$.set(showSelectProject, false);
					$.set(selectedProjectsToDelete, [], true);
					$.set(showSelectionReminder, false);

					if (successfullyDeleted.length > 0) {
						projects(projects().filter((p) => !successfullyDeleted.includes(p.$id)));
					}
				}
			} catch(exception) {
				$.set(error, exception.message, true);
			} finally {
				$.set(isDeletingProjects, false);
			}
		}
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 'l',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_6();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Alert.Inline, ($$anchor, Alert_Inline) => {
							Alert_Inline($$anchor, {
								status: 'warning',
								title: 'Choose projects to keep',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var fragment_3 = root_1();
									var text = $.first_child(fragment_3);
									var node_3 = $.sibling(text);

									$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
										Layout_Stack_1($$anchor, {
											direction: 'row',
											justifyContent: 'flex-start',
											gap: 'xs',
											style: 'position: relative; z-index: 10; pointer-events: auto;',
											children: ($$anchor, $$slotProps) => {
												Button($$anchor, {
													compact: true,
													$$events: { click: handleManageProjects },
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Manage projects');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});
									});

									$.template_effect(() => $.set_text(text, `The Free plan lets you keep ${$.get(allowedProjectsToKeep) ?? ''} projects. Select them before continuing. `));
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					};

					$.if(node_1, ($$render) => {
						if ($.get(showSelectionReminder)) $$render(consequent);
					});
				}

				var div = $.sibling(node_1, 2);
				var node_4 = $.child(div);

				$.component(node_4, () => Table.Root, ($$anchor, Table_Root) => {
					Table_Root($$anchor, {
						columns: [
							{ id: 'resource', width: { min: 215 } },
							{ id: 'freeLimit', width: { min: 100 } },
							{ id: 'excessUsage', width: { min: 120 } },
							{ id: 'manage', width: { min: 110 } }
						],
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const root = $.derived(() => $$slotProps.root);
								var fragment_5 = root_4();
								var node_5 = $.first_child(fragment_5);

								$.component(node_5, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
									Table_Row_Base($$anchor, {
										get root() {
											return $.get(root);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root_3();
											var node_6 = $.first_child(fragment_6);

											$.component(node_6, () => Table.Cell, ($$anchor, Table_Cell) => {
												Table_Cell($$anchor, {
													column: 'resource',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_7 = $.comment();
														var node_7 = $.first_child(fragment_7);

														$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
															Layout_Stack_2($$anchor, {
																direction: 'row',
																alignItems: 'center',
																gap: 'xs',
																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = root_2();
																	var node_8 = $.first_child(fragment_8);

																	$.component(node_8, () => Typography.Text, ($$anchor, Typography_Text) => {
																		Typography_Text($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_2 = $.text('Projects');

																				$.append($$anchor, text_2);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_9 = $.sibling(node_8, 2);

																	{
																		var consequent_1 = ($$anchor) => {
																			Badge($$anchor, {
																				size: 'xs',
																				content: 'Action required',
																				variant: 'secondary',
																				type: 'warning'
																			});
																		};

																		$.if(node_9, ($$render) => {
																			if ($.get(isLimitExceeded).projects) $$render(consequent_1);
																		});
																	}

																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											});

											var node_10 = $.sibling(node_6, 2);

											$.component(node_10, () => Table.Cell, ($$anchor, Table_Cell_1) => {
												Table_Cell_1($$anchor, {
													column: 'freeLimit',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_10 = $.comment();
														var node_11 = $.first_child(fragment_10);

														$.component(node_11, () => Typography.Text, ($$anchor, Typography_Text_1) => {
															Typography_Text_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_3 = $.text();

																	$.template_effect(($0) => $.set_text(text_3, `${$0 ?? ''} projects`), [() => formatNumber($.get(allowedProjectsToKeep))]);
																	$.append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_10);
													},
													$$slots: { default: true }
												});
											});

											var node_12 = $.sibling(node_10, 2);

											$.component(node_12, () => Table.Cell, ($$anchor, Table_Cell_2) => {
												Table_Cell_2($$anchor, {
													column: 'excessUsage',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_12 = $.comment();
														var node_13 = $.first_child(fragment_12);

														{
															var consequent_2 = ($$anchor) => {
																var fragment_13 = $.comment();
																var node_14 = $.first_child(fragment_13);

																$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																	Layout_Stack_3($$anchor, {
																		direction: 'row',
																		alignItems: 'center',
																		gap: 'xs',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_14 = root_2();
																			var node_15 = $.first_child(fragment_14);

																			Icon(node_15, {
																				get icon() {
																					return IconArrowUp;
																				},
																				size: 's',
																				color: '--fgcolor-error'
																			});

																			var node_16 = $.sibling(node_15, 2);

																			$.component(node_16, () => Typography.Text, ($$anchor, Typography_Text_2) => {
																				Typography_Text_2($$anchor, {
																					color: '--fgcolor-error',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_4 = $.text();

																						$.template_effect(($0) => $.set_text(text_4, `${$0 ?? ''} projects`), [() => formatNumber($.get(excessUsage).projects)]);
																						$.append($$anchor, text_4);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_14);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_13);
															};

															var alternate = ($$anchor) => {
																var fragment_16 = $.comment();
																var node_17 = $.first_child(fragment_16);

																$.component(node_17, () => Typography.Text, ($$anchor, Typography_Text_3) => {
																	Typography_Text_3($$anchor, {
																		color: '--fgcolor-neutral-secondary',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_5 = $.text();

																			$.template_effect(($0, $1) => $.set_text(text_5, `${$0 ?? ''} / ${$1 ?? ''}`), [
																				() => formatNumber($.get(currentUsage).projects),
																				() => formatNumber($.get(allowedProjectsToKeep))
																			]);

																			$.append($$anchor, text_5);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_16);
															};

															$.if(node_13, ($$render) => {
																if ($.get(isLimitExceeded).projects) $$render(consequent_2); else $$render(alternate, -1);
															});
														}

														$.append($$anchor, fragment_12);
													},
													$$slots: { default: true }
												});
											});

											var node_18 = $.sibling(node_12, 2);

											$.component(node_18, () => Table.Cell, ($$anchor, Table_Cell_3) => {
												Table_Cell_3($$anchor, {
													column: 'manage',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_18 = $.comment();
														var node_19 = $.first_child(fragment_18);

														{
															var consequent_3 = ($$anchor) => {
																var fragment_19 = $.comment();
																var node_20 = $.first_child(fragment_19);

																$.component(node_20, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																	Layout_Stack_4($$anchor, {
																		direction: 'row',
																		justifyContent: 'flex-end',
																		children: ($$anchor, $$slotProps) => {
																			Button($$anchor, {
																				size: 'xs',
																				secondary: true,
																				$$events: { click: handleManageProjects },
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_6 = $.text('Manage projects');

																					$.append($$anchor, text_6);
																				},
																				$$slots: { default: true }
																			});
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_19);
															};

															$.if(node_19, ($$render) => {
																if ($.get(isLimitExceeded).projects) $$render(consequent_3);
															});
														}

														$.append($$anchor, fragment_18);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								});

								var node_21 = $.sibling(node_5, 2);

								$.component(node_21, () => Table.Row.Base, ($$anchor, Table_Row_Base_1) => {
									Table_Row_Base_1($$anchor, {
										get root() {
											return $.get(root);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_21 = root_3();
											var node_22 = $.first_child(fragment_21);

											$.component(node_22, () => Table.Cell, ($$anchor, Table_Cell_4) => {
												Table_Cell_4($$anchor, {
													column: 'resource',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_22 = $.comment();
														var node_23 = $.first_child(fragment_22);

														$.component(node_23, () => Typography.Text, ($$anchor, Typography_Text_4) => {
															Typography_Text_4($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_7 = $.text('Organization members');

																	$.append($$anchor, text_7);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_22);
													},
													$$slots: { default: true }
												});
											});

											var node_24 = $.sibling(node_22, 2);

											$.component(node_24, () => Table.Cell, ($$anchor, Table_Cell_5) => {
												Table_Cell_5($$anchor, {
													column: 'freeLimit',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_23 = $.comment();
														var node_25 = $.first_child(fragment_23);

														$.component(node_25, () => Typography.Text, ($$anchor, Typography_Text_5) => {
															Typography_Text_5($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_8 = $.text();

																	$.template_effect(($0) => $.set_text(text_8, `${$0 ?? ''} member`), [() => formatNumber($.get(freePlanLimits).members)]);
																	$.append($$anchor, text_8);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_23);
													},
													$$slots: { default: true }
												});
											});

											var node_26 = $.sibling(node_24, 2);

											$.component(node_26, () => Table.Cell, ($$anchor, Table_Cell_6) => {
												Table_Cell_6($$anchor, {
													column: 'excessUsage',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_25 = $.comment();
														var node_27 = $.first_child(fragment_25);

														{
															var consequent_4 = ($$anchor) => {
																var fragment_26 = $.comment();
																var node_28 = $.first_child(fragment_26);

																$.component(node_28, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
																	Layout_Stack_5($$anchor, {
																		direction: 'row',
																		alignItems: 'center',
																		gap: 'xs',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_27 = root_2();
																			var node_29 = $.first_child(fragment_27);

																			Icon(node_29, {
																				get icon() {
																					return IconArrowUp;
																				},
																				size: 's',
																				color: '--fgcolor-error'
																			});

																			var node_30 = $.sibling(node_29, 2);

																			$.component(node_30, () => Typography.Text, ($$anchor, Typography_Text_6) => {
																				Typography_Text_6($$anchor, {
																					color: '--fgcolor-error',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_9 = $.text();

																						$.template_effect(($0) => $.set_text(text_9, `${$0 ?? ''} members`), [() => formatNumber($.get(excessUsage).members)]);
																						$.append($$anchor, text_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_27);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_26);
															};

															var alternate_1 = ($$anchor) => {
																var fragment_29 = $.comment();
																var node_31 = $.first_child(fragment_29);

																$.component(node_31, () => Typography.Text, ($$anchor, Typography_Text_7) => {
																	Typography_Text_7($$anchor, {
																		color: '--fgcolor-neutral-secondary',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_10 = $.text('N/A');

																			$.append($$anchor, text_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_29);
															};

															$.if(node_27, ($$render) => {
																if ($.get(isLimitExceeded).members) $$render(consequent_4); else $$render(alternate_1, -1);
															});
														}

														$.append($$anchor, fragment_25);
													},
													$$slots: { default: true }
												});
											});

											var node_32 = $.sibling(node_26, 2);

											$.component(node_32, () => Table.Cell, ($$anchor, Table_Cell_7) => {
												Table_Cell_7($$anchor, {
													column: 'manage',
													get root() {
														return $.get(root);
													}
												});
											});

											$.append($$anchor, fragment_21);
										},
										$$slots: { default: true }
									});
								});

								var node_33 = $.sibling(node_21, 2);

								$.component(node_33, () => Table.Row.Base, ($$anchor, Table_Row_Base_2) => {
									Table_Row_Base_2($$anchor, {
										get root() {
											return $.get(root);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_30 = root_3();
											var node_34 = $.first_child(fragment_30);

											$.component(node_34, () => Table.Cell, ($$anchor, Table_Cell_8) => {
												Table_Cell_8($$anchor, {
													column: 'resource',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_31 = $.comment();
														var node_35 = $.first_child(fragment_31);

														$.component(node_35, () => Typography.Text, ($$anchor, Typography_Text_8) => {
															Typography_Text_8($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_11 = $.text('Storage');

																	$.append($$anchor, text_11);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_31);
													},
													$$slots: { default: true }
												});
											});

											var node_36 = $.sibling(node_34, 2);

											$.component(node_36, () => Table.Cell, ($$anchor, Table_Cell_9) => {
												Table_Cell_9($$anchor, {
													column: 'freeLimit',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_32 = $.comment();
														var node_37 = $.first_child(fragment_32);

														$.component(node_37, () => Typography.Text, ($$anchor, Typography_Text_9) => {
															Typography_Text_9($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_12 = $.text();

																	$.template_effect(() => $.set_text(text_12, `${$.get(freePlanLimits).storage ?? ''} GB`));
																	$.append($$anchor, text_12);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_32);
													},
													$$slots: { default: true }
												});
											});

											var node_38 = $.sibling(node_36, 2);

											$.component(node_38, () => Table.Cell, ($$anchor, Table_Cell_10) => {
												Table_Cell_10($$anchor, {
													column: 'excessUsage',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_34 = $.comment();
														var node_39 = $.first_child(fragment_34);

														{
															var consequent_5 = ($$anchor) => {
																var fragment_35 = $.comment();
																var node_40 = $.first_child(fragment_35);

																$.component(node_40, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
																	Layout_Stack_6($$anchor, {
																		direction: 'row',
																		alignItems: 'center',
																		gap: 'xs',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_36 = root_2();
																			var node_41 = $.first_child(fragment_36);

																			Icon(node_41, {
																				get icon() {
																					return IconArrowUp;
																				},
																				size: 's',
																				color: '--fgcolor-error'
																			});

																			var node_42 = $.sibling(node_41, 2);

																			$.component(node_42, () => Typography.Text, ($$anchor, Typography_Text_10) => {
																				Typography_Text_10($$anchor, {
																					color: '--fgcolor-error',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_13 = $.text();

																						$.template_effect(($0) => $.set_text(text_13, `${$0 ?? ''} GB`), [() => $.get(excessUsage).storage.toFixed(2)]);
																						$.append($$anchor, text_13);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_36);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_35);
															};

															var alternate_2 = ($$anchor) => {
																var fragment_38 = $.comment();
																var node_43 = $.first_child(fragment_38);

																$.component(node_43, () => Typography.Text, ($$anchor, Typography_Text_11) => {
																	Typography_Text_11($$anchor, {
																		color: '--fgcolor-neutral-secondary',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_14 = $.text();

																			$.template_effect(($0) => $.set_text(text_14, `${$0 ?? ''} / ${$.get(freePlanLimits).storage ?? ''} GB`), [() => $.get(storageUsageGB).toFixed(2)]);
																			$.append($$anchor, text_14);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_38);
															};

															$.if(node_39, ($$render) => {
																if ($.get(isLimitExceeded).storage) $$render(consequent_5); else $$render(alternate_2, -1);
															});
														}

														$.append($$anchor, fragment_34);
													},
													$$slots: { default: true }
												});
											});

											var node_44 = $.sibling(node_38, 2);

											$.component(node_44, () => Table.Cell, ($$anchor, Table_Cell_11) => {
												Table_Cell_11($$anchor, {
													column: 'manage',
													get root() {
														return $.get(root);
													}
												});
											});

											$.append($$anchor, fragment_30);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_5);
							},

							header: ($$anchor, $$slotProps) => {
								const root = $.derived(() => $$slotProps.root);
								var fragment_40 = root_3();
								var node_45 = $.first_child(fragment_40);

								$.component(node_45, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
									Table_Header_Cell($$anchor, {
										column: 'resource',
										get root() {
											return $.get(root);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_15 = $.text('Resource');

											$.append($$anchor, text_15);
										},
										$$slots: { default: true }
									});
								});

								var node_46 = $.sibling(node_45, 2);

								$.component(node_46, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
									Table_Header_Cell_1($$anchor, {
										column: 'freeLimit',
										get root() {
											return $.get(root);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_16 = $.text('Free limit');

											$.append($$anchor, text_16);
										},
										$$slots: { default: true }
									});
								});

								var node_47 = $.sibling(node_46, 2);

								$.component(node_47, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_2) => {
									Table_Header_Cell_2($$anchor, {
										column: 'excessUsage',
										get root() {
											return $.get(root);
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_41 = $.comment();
											var node_48 = $.first_child(fragment_41);

											$.component(node_48, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
												Layout_Stack_7($$anchor, {
													direction: 'row',
													alignItems: 'center',
													gap: 'xs',
													children: ($$anchor, $$slotProps) => {
														var fragment_42 = root_2();
														var node_49 = $.first_child(fragment_42);

														$.component(node_49, () => Typography.Text, ($$anchor, Typography_Text_12) => {
															Typography_Text_12($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_17 = $.text('Excess usage');

																	$.append($$anchor, text_17);
																},
																$$slots: { default: true }
															});
														});

														var node_50 = $.sibling(node_49, 2);

														Tooltip(node_50, {
															placement: 'bottom',
															portal: true,
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
																	var span = root_5();

																	$.append($$anchor, span);
																}
															}
														});

														$.append($$anchor, fragment_42);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_41);
										},
										$$slots: { default: true }
									});
								});

								var node_51 = $.sibling(node_47, 2);

								$.component(node_51, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_3) => {
									Table_Header_Cell_3($$anchor, {
										column: 'manage',
										get root() {
											return $.get(root);
										}
									});
								});

								$.append($$anchor, fragment_40);
							}
						}
					});
				});

				$.reset(div);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_52 = $.sibling(node, 2);

	{
		var consequent_8 = ($$anchor) => {
			const requiredToDelete = $.derived(() => $.get(currentUsage).projects - $.get(allowedProjectsToKeep));

			Modal($$anchor, {
				title: 'Delete projects to downgrade',
				onSubmit: deleteSelected,
				dismissible: false,
				get show() {
					return $.get(showSelectProject);
				},

				set show($$value) {
					$.set(showSelectProject, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_45 = root_4();
					var node_53 = $.first_child(fragment_45);

					{
						var consequent_6 = ($$anchor) => {
							var fragment_46 = $.comment();
							var node_54 = $.first_child(fragment_46);

							$.component(node_54, () => Alert.Inline, ($$anchor, Alert_Inline_1) => {
								Alert_Inline_1($$anchor, {
									status: 'error',
									title: 'Error',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_18 = $.text();

										$.template_effect(() => $.set_text(text_18, $.get(error)));
										$.append($$anchor, text_18);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_46);
						};

						var alternate_3 = ($$anchor) => {
							var fragment_48 = $.comment();
							var node_55 = $.first_child(fragment_48);

							$.component(node_55, () => Alert.Inline, ($$anchor, Alert_Inline_2) => {
								Alert_Inline_2($$anchor, {
									status: 'warning',
									title: 'The selected projects will be permanently deleted',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_19 = $.text('The selected projects and all associated data will be permanently deleted and cannot\n                be recovered.');

										$.append($$anchor, text_19);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_48);
						};

						$.if(node_53, ($$render) => {
							if ($.get(error)) $$render(consequent_6); else $$render(alternate_3, -1);
						});
					}

					var node_56 = $.sibling(node_53, 2);

					$.component(node_56, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
						Layout_Stack_8($$anchor, {
							gap: 'm',
							children: ($$anchor, $$slotProps) => {
								var fragment_49 = root_7();
								var node_57 = $.first_child(fragment_49);

								$.component(node_57, () => Layout.Stack, ($$anchor, Layout_Stack_9) => {
									Layout_Stack_9($$anchor, {
										gap: 's',
										direction: 'row',
										children: ($$anchor, $$slotProps) => {
											var fragment_50 = root_2();
											var node_58 = $.first_child(fragment_50);

											$.component(node_58, () => Typography.Text, ($$anchor, Typography_Text_13) => {
												Typography_Text_13($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_20 = $.text();

														$.template_effect(() => $.set_text(text_20, `Select ${$.get(requiredToDelete) ?? ''} project${$.get(requiredToDelete) !== 1 ? 's' : ''} to delete`));
														$.append($$anchor, text_20);
													},
													$$slots: { default: true }
												});
											});

											var node_59 = $.sibling(node_58, 2);

											{
												let $0 = $.derived(() => `${$.get(selectedProjectsToDelete).length} selected`);

												Badge(node_59, {
													size: 'xs',
													variant: 'secondary',
													get content() {
														return $.get($0);
													}
												});
											}

											$.append($$anchor, fragment_50);
										},
										$$slots: { default: true }
									});
								});

								var div_1 = $.sibling(node_57, 2);
								var node_60 = $.child(div_1);

								$.component(node_60, () => Table.Root, ($$anchor, Table_Root_1) => {
									Table_Root_1($$anchor, {
										allowSelection: true,
										columns: [{ id: 'name' }, { id: 'created' }],
										get selectedRows() {
											return $.get(selectedProjectsToDelete);
										},

										set selectedRows($$value) {
											$.set(selectedProjectsToDelete, $$value, true);
										},
										children: $.invalid_default_snippet,
										$$slots: {
											default: ($$anchor, $$slotProps) => {
												const root = $.derived(() => $$slotProps.root);
												var fragment_52 = $.comment();
												var node_61 = $.first_child(fragment_52);

												$.each(node_61, 17, projects, $.index, ($$anchor, project) => {
													const isRowSelected = $.derived(() => $.get(selectedProjectsToDelete).includes($.get(project).$id));
													const shouldDisable = $.derived(() => !$.get(isRowSelected) && $.get(selectedProjectsToDelete).length >= $.get(requiredToDelete));
													var fragment_53 = $.comment();
													var node_62 = $.first_child(fragment_53);

													{
														let $0 = $.derived(() => $.get(shouldDisable) ? 'disabled' : undefined);

														$.component(node_62, () => Table.Row.Base, ($$anchor, Table_Row_Base_3) => {
															Table_Row_Base_3($$anchor, {
																get root() {
																	return $.get(root);
																},

																get id() {
																	return $.get(project).$id;
																},

																get select() {
																	return $.get($0);
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_54 = root_2();
																	var node_63 = $.first_child(fragment_54);

																	$.component(node_63, () => Table.Cell, ($$anchor, Table_Cell_12) => {
																		Table_Cell_12($$anchor, {
																			column: 'name',
																			get root() {
																				return $.get(root);
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_55 = $.comment();
																				var node_64 = $.first_child(fragment_55);

																				$.component(node_64, () => Typography.Text, ($$anchor, Typography_Text_14) => {
																					Typography_Text_14($$anchor, {
																						truncate: true,
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_21 = $.text();

																							$.template_effect(() => $.set_text(text_21, $.get(project).name));
																							$.append($$anchor, text_21);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_55);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_65 = $.sibling(node_63, 2);

																	$.component(node_65, () => Table.Cell, ($$anchor, Table_Cell_13) => {
																		Table_Cell_13($$anchor, {
																			column: 'created',
																			get root() {
																				return $.get(root);
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_22 = $.text();

																				$.template_effect(($0) => $.set_text(text_22, $0), [() => toLocaleDateTime($.get(project).$createdAt)]);
																				$.append($$anchor, text_22);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_54);
																},
																$$slots: { default: true }
															});
														});
													}

													$.append($$anchor, fragment_53);
												});

												$.append($$anchor, fragment_52);
											},

											header: ($$anchor, $$slotProps) => {
												const root = $.derived(() => $$slotProps.root);
												var fragment_58 = root_2();
												var node_66 = $.first_child(fragment_58);

												$.component(node_66, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_4) => {
													Table_Header_Cell_4($$anchor, {
														column: 'name',
														get root() {
															return $.get(root);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_23 = $.text('Project Name');

															$.append($$anchor, text_23);
														},
														$$slots: { default: true }
													});
												});

												var node_67 = $.sibling(node_66, 2);

												$.component(node_67, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_5) => {
													Table_Header_Cell_5($$anchor, {
														column: 'created',
														get root() {
															return $.get(root);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_24 = $.text('Created');

															$.append($$anchor, text_24);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_58);
											}
										}
									});
								});

								$.reset(div_1);
								$.append($$anchor, fragment_49);
							},
							$$slots: { default: true }
						});
					});

					var node_68 = $.sibling(node_56, 2);

					{
						var consequent_7 = ($$anchor) => {
							var fragment_59 = $.comment();
							var node_69 = $.first_child(fragment_59);

							$.component(node_69, () => Layout.Stack, ($$anchor, Layout_Stack_10) => {
								Layout_Stack_10($$anchor, {
									gap: 'xs',
									children: ($$anchor, $$slotProps) => {
										InputText($$anchor, {
											required: true,
											id: 'confirmation',
											placeholder: 'I understand',
											get disabled() {
												return $.get(isDeletingProjects);
											},
											label: `Type "I understand" to confirm permanent deletion of the selected projects`,
											get value() {
												return $.get(confirmationInput);
											},

											set value($$value) {
												$.set(confirmationInput, $$value, true);
											}
										});
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_59);
						};

						$.if(node_68, ($$render) => {
							if ($.get(selectedProjectsToDelete).length >= $.get(requiredToDelete)) $$render(consequent_7);
						});
					}

					$.append($$anchor, fragment_45);
				},

				$$slots: {
					default: true,
					description: ($$anchor, $$slotProps) => {
						var fragment_61 = $.comment();
						var node_70 = $.first_child(fragment_61);

						$.component(node_70, () => Typography.Text, ($$anchor, Typography_Text_15) => {
							Typography_Text_15($$anchor, {
								slot: 'description',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_25 = $.text();

									$.template_effect(() => $.set_text(text_25, `The Free plan lets you keep ${$.get(allowedProjectsToKeep) ?? ''} projects. Select projects you want to
            permanently delete.`));

									$.append($$anchor, text_25);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_61);
					},

					footer: ($$anchor, $$slotProps) => {
						var fragment_63 = root_2();
						var node_71 = $.first_child(fragment_63);

						Button(node_71, {
							secondary: true,
							$$events: { click: () => $.set(showSelectProject, false) },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_26 = $.text('Cancel');

								$.append($$anchor, text_26);
							},
							$$slots: { default: true }
						});

						var node_72 = $.sibling(node_71, 2);

						{
							let $0 = $.derived(() => $.get(selectedProjectsToDelete).length < $.get(requiredToDelete) || !$.get(isConfirmationValid));

							Button(node_72, {
								submit: true,
								danger: true,
								submissionLoader: true,
								get forceShowLoader() {
									return $.get(isDeletingProjects);
								},

								get disabled() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_27 = $.text('Delete projects');

									$.append($$anchor, text_27);
								},
								$$slots: { default: true }
							});
						}

						$.append($$anchor, fragment_63);
					}
				}
			});
		};

		$.if(node_52, ($$render) => {
			if ($.get(showSelectProject)) $$render(consequent_8);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}
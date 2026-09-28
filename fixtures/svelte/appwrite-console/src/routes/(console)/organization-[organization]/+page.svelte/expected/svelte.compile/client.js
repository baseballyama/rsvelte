import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { goto } from '$app/navigation';
import { Button } from '$lib/elements/forms';
import { Container } from '$lib/layout';
import CreateProject from './createProject.svelte';
import CreateOrganization from '../createOrganization.svelte';
import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
import { page } from '$app/state';
import { registerCommands } from '$lib/commandCenter';

import {
	CardContainer,
	Empty,
	EmptySearch,
	GridItem1,
	PaginationWithLimit,
	SearchQuery
} from '$lib/components';

import { trackEvent, Click } from '$lib/actions/analytics';
import { getServiceLimit, readOnly, getChangePlanUrl } from '$lib/stores/billing';
import { hideNotification, shouldShowNotification } from '$lib/helpers/notifications';
import { onMount } from 'svelte';
import { canWriteProjects } from '$lib/stores/roles';
import { checkPricingRefAndRedirect } from '$lib/helpers/pricingRedirect';
import { Alert, Badge, Icon, Layout, Tag, Tooltip, Typography } from '@appwrite.io/pink-svelte';

import {
	IconAndroid,
	IconApple,
	IconCode,
	IconExclamationCircle,
	IconFlutter,
	IconPlus,
	IconReact,
	IconUnity
} from '@appwrite.io/pink-icons-svelte';

import { getPlatformInfo } from '$lib/helpers/platform';
import { BODY_TOOLTIP_MAX_WIDTH, BODY_TOOLTIP_WRAPPER_STYLE } from '$lib/helpers/tooltipContent';
import CreateProjectCloud from './createProjectCloud.svelte';
import { regions as regionsStore } from '$lib/stores/organization';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div slot="tooltip"> </div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

var root_3 = $.from_html(
	`Education plan organizations can have up to 2 projects. To create a new project,
                please delete an existing one or <a style="text-decoration: underline;">upgrade your plan</a>.`,
	1
);

var root_4 = $.from_html(`<p>Create a new project</p>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $readOnly = () => $.store_get(readOnly, '$readOnly', $$stores);
	const $canWriteProjects = () => $.store_get(canWriteProjects, '$canWriteProjects', $$stores);
	const $regionsStore = () => $.store_get(regionsStore, '$regionsStore', $$stores);
	const $registerCommands = () => $.store_get(registerCommands, '$registerCommands', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showCreate = $.state(false);
	let addOrganization = $.state(false);
	let showCreateProjectCloud = $.state(false);
	let educationPlanAlertDismissed = $.state(false);
	let freePlanAlertDismissed = $.state(false);
	let searchQuery = $.state(null);
	let handledCreateProjectQuery = $.state(false);
	const educationProgramId = 'github-student-developer';
	const isEducationProgram = $.derived(() => $$props.data.program?.$id === educationProgramId);
	const shouldShowEducationPlanAlert = $.derived(() => isCloud && $.get(isEducationProgram) && $$props.data.projects.total >= 2);

	const projectCreationDisabled = $.derived(() => {
		return isCloud && getServiceLimit('projects', null, $$props.data.currentPlan) <= $$props.data.projects.total || isCloud && $readOnly() && !GRACE_PERIOD_OVERRIDE || !$canWriteProjects();
	});

	const reachedProjectLimit = $.derived(() => {
		return isCloud && getServiceLimit('projects', null, $$props.data.currentPlan) <= $$props.data.projects.total;
	});

	const projectsLimit = $.derived(() => {
		return getServiceLimit('projects', null, $$props.data.currentPlan);
	});

	function filterPlatforms(platforms) {
		return platforms.filter((value, index, self) => index === self.findIndex((t) => t.name === value.name));
	}

	function handleCreateProject() {
		if ($.get(projectCreationDisabled)) return;
		if (isCloud) $.set(showCreateProjectCloud, true); else $.set(showCreate, true);
	}

	$.user_effect(() => {
		if ($.get(handledCreateProjectQuery) || !page.url.searchParams.has('create-project')) return;

		$.set(handledCreateProjectQuery, true);
		handleCreateProject();

		const url = new URL(page.url);

		url.searchParams.delete('create-project');
		void goto(`${url.pathname}${url.search}${url.hash}`, { replaceState: true, noScroll: true, keepFocus: true });
	});

	function getIconForPlatform(platform) {
		switch (platform) {
			case 'code':
				return IconCode;

			case 'flutter':
				return IconFlutter;

			case 'apple':
				return IconApple;

			case 'android':
				return IconAndroid;

			case 'react-native':
				return IconReact;

			case 'unity':
				return IconUnity;

			default:
				return null;
		}
	}

	function dismissFreePlanAlert() {
		$.set(freePlanAlertDismissed, true);

		const notificationId = `freePlanAlert_${$$props.data.organization.$id}`;

		hideNotification(notificationId, { coolOffPeriod: 24 });
		trackEvent(Click.OrganizationClickUpgrade, { from: 'button', source: 'free_plan_info_alert_dismiss' });
	}

	function dismissEducationPlanAlert() {
		$.set(educationPlanAlertDismissed, true);

		const notificationId = `educationPlanAlert_${$$props.data.organization.$id}`;

		hideNotification(notificationId, { coolOffPeriod: 24 });
	}

	onMount(async () => {
		checkPricingRefAndRedirect(page.url.searchParams);

		const educationNotificationId = `educationPlanAlert_${$$props.data.organization.$id}`;
		const notificationId = `freePlanAlert_${$$props.data.organization.$id}`;
		const shouldShowEducation = shouldShowNotification(educationNotificationId);
		const shouldShow = shouldShowNotification(notificationId);

		$.set(educationPlanAlertDismissed, !shouldShowEducation);
		$.set(freePlanAlertDismissed, !shouldShow);
	});

	function findRegion(project) {
		return $regionsStore().regions.find((region) => region.$id === project.region);
	}

	const activeProjectsTotal = $.derived(() => $$props.data?.projects.total);

	function clearSearch() {
		$.get(searchQuery)?.clearInput();
	}

	$.user_effect(() => {
		$registerCommands()([
			{
				label: 'Create project',
				callback: () => {
					$.set(showCreate, true);
				},
				keys: ['c'],
				disabled: $.get(projectCreationDisabled),
				group: 'projects',
				icon: IconPlus
			}
		]);
	});

	var fragment = root_6();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_5();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'row',
					justifyContent: 'space-between',
					class: 'common-section',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_2 = $.first_child(fragment_2);

						$.bind_this(SearchQuery(node_2, { placeholder: 'Search by name, label, or ID' }), ($$value) => $.set(searchQuery, $$value, true), () => $.get(searchQuery));

						var node_3 = $.sibling(node_2, 2);

						{
							var consequent_1 = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_4 = $.first_child(fragment_3);

								{
									var consequent = ($$anchor) => {
										Tooltip($$anchor, {
											placement: 'bottom',
											get maxWidth() {
												return BODY_TOOLTIP_MAX_WIDTH;
											},

											children: ($$anchor, $$slotProps) => {
												var div = root();
												var node_5 = $.child(div);

												Button(node_5, {
													event: 'create_project',
													disabled: true,
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Create project');

														$.append($$anchor, text);
													},

													$$slots: {
														default: true,
														start: ($$anchor, $$slotProps) => {
															Icon($$anchor, {
																get icon() {
																	return IconPlus;
																},
																slot: 'start',
																size: 's'
															});
														}
													}
												});

												$.reset(div);
												$.append($$anchor, div);
											},

											$$slots: {
												default: true,
												tooltip: ($$anchor, $$slotProps) => {
													var div_1 = root_1();
													var text_1 = $.only_child(div_1);

													$.template_effect(() => {
														$.set_style(div_1, BODY_TOOLTIP_WRAPPER_STYLE);
														$.set_text(text_1, `You have reached your limit of ${$.get(projectsLimit) ?? ''} projects.`);
													});

													$.append($$anchor, div_1);
												}
											}
										});
									};

									var alternate = ($$anchor) => {
										Button($$anchor, {
											event: 'create_project',
											get disabled() {
												return $.get(projectCreationDisabled);
											},
											$$events: { click: handleCreateProject },
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Create project');

												$.append($$anchor, text_2);
											},

											$$slots: {
												default: true,
												start: ($$anchor, $$slotProps) => {
													Icon($$anchor, {
														get icon() {
															return IconPlus;
														},
														slot: 'start',
														size: 's'
													});
												}
											}
										});
									};

									$.if(node_4, ($$render) => {
										if ($.get(projectCreationDisabled) && $.get(reachedProjectLimit)) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_3);
							};

							$.if(node_3, ($$render) => {
								if ($canWriteProjects()) $$render(consequent_1);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_1, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_8 = $.comment();
					var node_7 = $.first_child(fragment_8);

					$.component(node_7, () => Alert.Inline, ($$anchor, Alert_Inline) => {
						Alert_Inline($$anchor, {
							status: 'info',
							dismissible: true,
							$$events: { dismiss: dismissEducationPlanAlert },
							children: ($$anchor, $$slotProps) => {
								var fragment_9 = $.comment();
								var node_8 = $.first_child(fragment_9);

								$.component(node_8, () => Typography.Text, ($$anchor, Typography_Text) => {
									Typography_Text($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_10 = root_3();
											var a = $.sibling($.first_child(fragment_10));

											$.next();
											$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => getChangePlanUrl($$props.data.organization.$id)]);
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

					$.append($$anchor, fragment_8);
				};

				$.if(node_6, ($$render) => {
					if ($.get(shouldShowEducationPlanAlert) && !$.get(educationPlanAlertDismissed)) $$render(consequent_2);
				});
			}

			var node_9 = $.sibling(node_6, 2);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_11 = $.comment();
					var node_10 = $.first_child(fragment_11);

					$.component(node_10, () => Alert.Inline, ($$anchor, Alert_Inline_1) => {
						Alert_Inline_1($$anchor, {
							dismissible: true,
							$$events: { dismiss: dismissFreePlanAlert },
							children: ($$anchor, $$slotProps) => {
								var fragment_12 = $.comment();
								var node_11 = $.first_child(fragment_12);

								$.component(node_11, () => Typography.Text, ($$anchor, Typography_Text_1) => {
									Typography_Text_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text();

											$.template_effect(() => $.set_text(text_3, `Your Free plan includes up to ${$$props.data.currentPlan?.projects ?? ''} projects and limited resources.
                Upgrade to unlock more capacity and features.`));

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_12);
							},

							$$slots: {
								default: true,
								actions: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => getChangePlanUrl($$props.data.organization.$id));

										Button($$anchor, {
											compact: true,
											size: 's',
											get href() {
												return $.get($0);
											},

											$$events: {
												click: () => {
													trackEvent(Click.OrganizationClickUpgrade, { from: 'button', source: 'free_plan_info_alert' });
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Upgrade to Pro');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									}
								}
							}
						});
					});

					$.append($$anchor, fragment_11);
				};

				$.if(node_9, ($$render) => {
					if (isCloud && !$$props.data.program && $$props.data.currentPlan?.projects && $.get(activeProjectsTotal) <= $$props.data.currentPlan.projects && !$.get(freePlanAlertDismissed)) $$render(consequent_3);
				});
			}

			var node_12 = $.sibling(node_9, 2);

			{
				var consequent_7 = ($$anchor) => {
					{
						let $0 = $.derived(() => !$canWriteProjects());

						CardContainer($$anchor, {
							get disableEmpty() {
								return $.get($0);
							},

							get total() {
								return $.get(activeProjectsTotal);
							},

							get offset() {
								return $$props.data.offset;
							},
							$$events: { click: handleCreateProject },
							children: ($$anchor, $$slotProps) => {
								var fragment_16 = $.comment();
								var node_13 = $.first_child(fragment_16);

								$.each(node_13, 17, () => $$props.data.projects.projects, $.index, ($$anchor, project) => {
									const projectPlatforms = $.derived(() => $.get(project).platforms);
									const platformsTotal = $.derived(() => $.get(project).platformsTotal);
									const platforms = $.derived(() => filterPlatforms($.get(projectPlatforms).map((platform) => getPlatformInfo(platform.type))));

									{
										let $0 = $.derived(() => `${base}/project-${$.get(project).region}-${$.get(project).$id}/overview/platforms`);

										GridItem1($$anchor, {
											get href() {
												return $.get($0);
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_18 = root_2();
												var node_14 = $.first_child(fragment_18);

												$.each(node_14, 17, () => $.get(platforms).slice(0, 2), $.index, ($$anchor, platform) => {
													const icon = $.derived(() => getIconForPlatform($.get(platform).icon));

													Badge($$anchor, {
														variant: 'secondary',
														get content() {
															return $.get(platform).name;
														},
														style: 'width: max-content;',
														$$slots: {
															start: ($$anchor, $$slotProps) => {
																Icon($$anchor, {
																	get icon() {
																		return $.get(icon);
																	},
																	size: 's',
																	slot: 'start'
																});
															}
														}
													});
												});

												var node_15 = $.sibling(node_14, 2);

												{
													var consequent_4 = ($$anchor) => {
														{
															let $0 = $.derived(() => `+${$.get(platformsTotal) - 2}`);

															Badge($$anchor, {
																variant: 'secondary',
																get content() {
																	return $.get($0);
																},
																style: 'width: max-content;'
															});
														}
													};

													$.if(node_15, ($$render) => {
														if ($.get(platformsTotal) > 2) $$render(consequent_4);
													});
												}

												$.append($$anchor, fragment_18);
											},

											$$slots: {
												default: true,
												eyebrow: ($$anchor, $$slotProps) => {
													var text_5 = $.text();

													$.template_effect(() => $.set_text(text_5, `${($.get(platformsTotal) ? $.get(platformsTotal) : 'No') ?? ''} apps`));
													$.append($$anchor, text_5);
												},

												title: ($$anchor, $$slotProps) => {
													var text_6 = $.text();

													$.template_effect(() => $.set_text(text_6, $.get(project).name));
													$.append($$anchor, text_6);
												},

												status: ($$anchor, $$slotProps) => {
													var fragment_24 = $.comment();
													var node_16 = $.first_child(fragment_24);

													{
														var consequent_5 = ($$anchor) => {
															Tag($$anchor, {
																size: 's',
																style: 'white-space: nowrap;',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_7 = $.text('Paused');

																	$.append($$anchor, text_7);
																},

																$$slots: {
																	default: true,
																	start: ($$anchor, $$slotProps) => {
																		Icon($$anchor, {
																			get icon() {
																				return IconExclamationCircle;
																			},
																			size: 's',
																			slot: 'start'
																		});
																	}
																}
															});
														};

														$.if(node_16, ($$render) => {
															if ($.get(project).status === 'paused') $$render(consequent_5);
														});
													}

													$.append($$anchor, fragment_24);
												},

												icons: ($$anchor, $$slotProps) => {
													var fragment_27 = $.comment();
													var node_17 = $.first_child(fragment_27);

													{
														var consequent_6 = ($$anchor) => {
															const region = $.derived(() => findRegion($.get(project)));
															var fragment_28 = $.comment();
															var node_18 = $.first_child(fragment_28);

															$.component(node_18, () => Typography.Text, ($$anchor, Typography_Text_2) => {
																Typography_Text_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_8 = $.text();

																		$.template_effect(() => $.set_text(text_8, $.get(region).name));
																		$.append($$anchor, text_8);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_28);
														};

														$.if(node_17, ($$render) => {
															if (isCloud && $regionsStore()?.regions) $$render(consequent_6);
														});
													}

													$.append($$anchor, fragment_27);
												}
											}
										});
									}
								});

								$.append($$anchor, fragment_16);
							},

							$$slots: {
								default: true,
								empty: ($$anchor, $$slotProps) => {
									var p = root_4();

									$.append($$anchor, p);
								}
							}
						});
					}
				};

				var consequent_8 = ($$anchor) => {
					EmptySearch($$anchor, {
						target: 'projects',
						hidePagination: true,
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								size: 's',
								secondary: true,
								$$events: { click: clearSearch },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Clear search');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				};

				var alternate_1 = ($$anchor) => {
					Empty($$anchor, {
						single: true,
						get allowCreate() {
							return $canWriteProjects();
						},
						target: 'project',
						href: 'https://appwrite.io/docs/quick-starts',
						$$events: { click: handleCreateProject }
					});
				};

				$.if(node_12, ($$render) => {
					if ($$props.data.projects.total > 0) $$render(consequent_7); else if ($$props.data.search) $$render(consequent_8, 1); else $$render(alternate_1, -1);
				});
			}

			var node_19 = $.sibling(node_12, 2);

			PaginationWithLimit(node_19, {
				name: 'Projects',
				get limit() {
					return $$props.data.limit;
				},

				get offset() {
					return $$props.data.offset;
				},

				get total() {
					return $.get(activeProjectsTotal);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node, 2);

	CreateOrganization(node_20, {
		get show() {
			return $.get(addOrganization);
		},

		set show($$value) {
			$.set(addOrganization, $$value, true);
		}
	});

	var node_21 = $.sibling(node_20, 2);

	CreateProject(node_21, {
		get teamId() {
			return page.params.organization;
		},

		get show() {
			return $.get(showCreate);
		},

		set show($$value) {
			$.set(showCreate, $$value, true);
		}
	});

	var node_22 = $.sibling(node_21, 2);

	CreateProjectCloud(node_22, {
		get projects() {
			return $$props.data.projects.total;
		},

		get regions() {
			return $regionsStore().regions;
		},

		get teamId() {
			return page.params.organization;
		},

		get currentPlan() {
			return $$props.data.currentPlan;
		},

		get showCreateProjectCloud() {
			return $.get(showCreateProjectCloud);
		},

		set showCreateProjectCloud($$value) {
			$.set(showCreateProjectCloud, $$value, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
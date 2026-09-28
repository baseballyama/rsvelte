import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let showCreate = false;
		let addOrganization = false;
		let showCreateProjectCloud = false;
		let educationPlanAlertDismissed = false;
		let freePlanAlertDismissed = false;
		let searchQuery = null;
		let handledCreateProjectQuery = false;
		const educationProgramId = 'github-student-developer';
		const isEducationProgram = $.derived(() => data.program?.$id === educationProgramId);
		const shouldShowEducationPlanAlert = $.derived(() => isCloud && isEducationProgram() && data.projects.total >= 2);

		const projectCreationDisabled = $.derived(() => {
			return isCloud && getServiceLimit('projects', null, data.currentPlan) <= data.projects.total || isCloud && $.store_get($$store_subs ??= {}, '$readOnly', readOnly) && !GRACE_PERIOD_OVERRIDE || !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects);
		});

		const reachedProjectLimit = $.derived(() => {
			return isCloud && getServiceLimit('projects', null, data.currentPlan) <= data.projects.total;
		});

		const projectsLimit = $.derived(() => {
			return getServiceLimit('projects', null, data.currentPlan);
		});

		function filterPlatforms(platforms) {
			return platforms.filter((value, index, self) => index === self.findIndex((t) => t.name === value.name));
		}

		function handleCreateProject() {
			if (projectCreationDisabled()) return;
			if (isCloud) showCreateProjectCloud = true; else showCreate = true;
		}

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
			freePlanAlertDismissed = true;

			const notificationId = `freePlanAlert_${data.organization.$id}`;

			hideNotification(notificationId, { coolOffPeriod: 24 });
			trackEvent(Click.OrganizationClickUpgrade, { from: 'button', source: 'free_plan_info_alert_dismiss' });
		}

		function dismissEducationPlanAlert() {
			educationPlanAlertDismissed = true;

			const notificationId = `educationPlanAlert_${data.organization.$id}`;

			hideNotification(notificationId, { coolOffPeriod: 24 });
		}

		onMount(async () => {
			checkPricingRefAndRedirect(page.url.searchParams);

			const educationNotificationId = `educationPlanAlert_${data.organization.$id}`;
			const notificationId = `freePlanAlert_${data.organization.$id}`;
			const shouldShowEducation = shouldShowNotification(educationNotificationId);
			const shouldShow = shouldShowNotification(notificationId);

			educationPlanAlertDismissed = !shouldShowEducation;
			freePlanAlertDismissed = !shouldShow;
		});

		function findRegion(project) {
			return $.store_get($$store_subs ??= {}, '$regionsStore', regionsStore).regions.find((region) => region.$id === project.region);
		}

		const activeProjectsTotal = $.derived(() => data?.projects.total);

		function clearSearch() {
			searchQuery?.clearInput();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							justifyContent: 'space-between',
							class: 'common-section',
							children: ($$renderer) => {
								SearchQuery($$renderer, { placeholder: 'Search by name, label, or ID' });
								$$renderer.push(`<!----> `);

								if ($.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects)) {
									$$renderer.push('<!--[0-->');

									if (projectCreationDisabled() && reachedProjectLimit()) {
										$$renderer.push('<!--[0-->');

										Tooltip($$renderer, {
											placement: 'bottom',
											maxWidth: BODY_TOOLTIP_MAX_WIDTH,
											children: ($$renderer) => {
												$$renderer.push(`<div>`);

												Button($$renderer, {
													event: 'create_project',
													disabled: true,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Create project`);
													},

													$$slots: {
														default: true,
														start: ($$renderer) => {
															Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
														}
													}
												});

												$$renderer.push(`<!----></div>`);
											},

											$$slots: {
												default: true,
												tooltip: ($$renderer) => {
													$$renderer.push(`<div slot="tooltip"${$.attr_style(BODY_TOOLTIP_WRAPPER_STYLE)}>You have reached your limit of ${$.escape(projectsLimit())} projects.</div>`);
												}
											}
										});
									} else {
										$$renderer.push('<!--[-1-->');

										Button($$renderer, {
											event: 'create_project',
											disabled: projectCreationDisabled(),
											children: ($$renderer) => {
												$$renderer.push(`<!---->Create project`);
											},

											$$slots: {
												default: true,
												start: ($$renderer) => {
													Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
												}
											}
										});
									}

									$$renderer.push(`<!--]-->`);
								} else {
									$$renderer.push('<!--[-1-->');
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

					$$renderer.push(` `);

					if (shouldShowEducationPlanAlert() && !educationPlanAlertDismissed) {
						$$renderer.push('<!--[0-->');

						if (Alert.Inline) {
							$$renderer.push('<!--[-->');

							Alert.Inline($$renderer, {
								status: 'info',
								dismissible: true,
								children: ($$renderer) => {
									if (Typography.Text) {
										$$renderer.push('<!--[-->');

										Typography.Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Education plan organizations can have up to 2 projects. To create a new project,
                please delete an existing one or <a${$.attr('href', getChangePlanUrl(data.organization.$id))} style="text-decoration: underline;">upgrade your plan</a>.`);
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
					}

					$$renderer.push(`<!--]--> `);

					if (isCloud && !data.program && data.currentPlan?.projects && activeProjectsTotal() <= data.currentPlan.projects && !freePlanAlertDismissed) {
						$$renderer.push('<!--[0-->');

						if (Alert.Inline) {
							$$renderer.push('<!--[-->');

							Alert.Inline($$renderer, {
								dismissible: true,
								children: ($$renderer) => {
									if (Typography.Text) {
										$$renderer.push('<!--[-->');

										Typography.Text($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Your Free plan includes up to ${$.escape(data.currentPlan?.projects)} projects and limited resources.
                Upgrade to unlock more capacity and features.`);
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
									actions: ($$renderer) => {
										{
											Button($$renderer, {
												compact: true,
												size: 's',
												href: getChangePlanUrl(data.organization.$id),
												children: ($$renderer) => {
													$$renderer.push(`<!---->Upgrade to Pro`);
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
					}

					$$renderer.push(`<!--]--> `);

					if (data.projects.total > 0) {
						$$renderer.push('<!--[0-->');

						CardContainer($$renderer, {
							disableEmpty: !$.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
							total: activeProjectsTotal(),
							offset: data.offset,
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(data.projects.projects);

								for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
									let project = each_array[$$index_1];
									const projectPlatforms = project.platforms;
									const platformsTotal = project.platformsTotal;
									const platforms = filterPlatforms(projectPlatforms.map((platform) => getPlatformInfo(platform.type)));

									GridItem1($$renderer, {
										href: `${base}/project-${project.region}-${project.$id}/overview/platforms`,
										children: ($$renderer) => {
											$$renderer.push(`<!--[-->`);

											const each_array_1 = $.ensure_array_like(platforms.slice(0, 2));

											for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
												let platform = each_array_1[$$index];
												const icon = getIconForPlatform(platform.icon);

												Badge($$renderer, {
													variant: 'secondary',
													content: platform.name,
													style: 'width: max-content;',
													$$slots: {
														start: ($$renderer) => {
															Icon($$renderer, { icon, size: 's', slot: 'start' });
														}
													}
												});
											}

											$$renderer.push(`<!--]--> `);

											if (platformsTotal > 2) {
												$$renderer.push('<!--[0-->');

												Badge($$renderer, {
													variant: 'secondary',
													content: `+${platformsTotal - 2}`,
													style: 'width: max-content;'
												});
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										},

										$$slots: {
											default: true,
											eyebrow: ($$renderer) => {
												{
													$$renderer.push(`${$.escape(platformsTotal ? platformsTotal : 'No')} apps`);
												}
											},

											title: ($$renderer) => {
												{
													$$renderer.push(`${$.escape(project.name)}`);
												}
											},

											status: ($$renderer) => {
												{
													if (project.status === 'paused') {
														$$renderer.push('<!--[0-->');

														Tag($$renderer, {
															size: 's',
															style: 'white-space: nowrap;',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Paused`);
															},

															$$slots: {
																default: true,
																start: ($$renderer) => {
																	Icon($$renderer, { icon: IconExclamationCircle, size: 's', slot: 'start' });
																}
															}
														});
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]-->`);
												}
											},

											icons: ($$renderer) => {
												{
													if (isCloud && $.store_get($$store_subs ??= {}, '$regionsStore', regionsStore)?.regions) {
														$$renderer.push('<!--[0-->');

														const region = findRegion(project);

														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(region.name)}`);
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

													$$renderer.push(`<!--]-->`);
												}
											}
										}
									});
								}

								$$renderer.push(`<!--]-->`);
							},

							$$slots: {
								default: true,
								empty: ($$renderer) => {
									{
										$$renderer.push(`<p>Create a new project</p>`);
									}
								}
							}
						});
					} else if (data.search) {
						$$renderer.push('<!--[1-->');

						EmptySearch($$renderer, {
							target: 'projects',
							hidePagination: true,
							children: ($$renderer) => {
								Button($$renderer, {
									size: 's',
									secondary: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Clear search`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');

						Empty($$renderer, {
							single: true,
							allowCreate: $.store_get($$store_subs ??= {}, '$canWriteProjects', canWriteProjects),
							target: 'project',
							href: 'https://appwrite.io/docs/quick-starts'
						});
					}

					$$renderer.push(`<!--]--> `);

					PaginationWithLimit($$renderer, {
						name: 'Projects',
						limit: data.limit,
						offset: data.offset,
						total: activeProjectsTotal()
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			CreateOrganization($$renderer, {
				get show() {
					return addOrganization;
				},

				set show($$value) {
					addOrganization = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			CreateProject($$renderer, {
				teamId: page.params.organization,
				get show() {
					return showCreate;
				},

				set show($$value) {
					showCreate = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			CreateProjectCloud($$renderer, {
				projects: data.projects.total,
				regions: $.store_get($$store_subs ??= {}, '$regionsStore', regionsStore).regions,
				teamId: page.params.organization,
				currentPlan: data.currentPlan,
				get showCreateProjectCloud() {
					return showCreateProjectCloud;
				},

				set showCreateProjectCloud($$value) {
					showCreateProjectCloud = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
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
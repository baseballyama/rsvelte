import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { app } from '$lib/stores/app';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import CustomId from '$lib/components/customId.svelte';
import { SvgIcon } from '$lib/components/index.js';
import { Button, Form, InputSelect } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { getFrameworkIcon } from '$lib/stores/sites.js';
import { isCloud } from '$lib/system';
import { ID, Query, Region } from '@appwrite.io/console';
import { IconGithub, IconPencil, IconPlus } from '@appwrite.io/pink-icons-svelte';

import {
	Badge,
	Card,
	Divider,
	Icon,
	Image,
	Tag,
	Input,
	Layout,
	Spinner,
	Typography
} from '@appwrite.io/pink-svelte';

import { filterRegions } from '$lib/helpers/regions';
import { loadAvailableRegions } from '$routes/(console)/regions';
import { regions as regionsStore } from '$lib/stores/organization';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div style="position: relative; aspect-ratio: 16/9;"><!> <!></div> <!>`, 1);
var root_2 = $.from_html(`<div style="margin: 1rem 0;"><!></div> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div><!></div>`);
var root_5 = $.from_html(`<span class="text">Continue</span>`);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<img width="120" height="22" alt="Appwrite Logo"/>`);
var root_8 = $.from_html(`<div class="auth-bg svelte-10d6qtw"><section class="console-container svelte-10d6qtw"><div><!></div></section> <footer class="svelte-10d6qtw"><!></footer></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $regionsStore = () => $.store_get(regionsStore, '$regionsStore', $$stores);
	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let projects = $.state(void 0);
	let selectedProject = $.state(void 0);
	let selectedOrg = $.state($.proxy($$props.data?.organizations?.total ? $$props.data.organizations.teams[0].$id : undefined));
	let projectName = $.state('');
	let showCustomId = $.state(false);
	let region = $.state(void 0);
	let id = $.state('');
	let screenshotOk = $.state(true);
	let imageLoading = $.state(true);
	let loadingProjects = $.state(false);

	async function fetchProjects() {
		$.set(loadingProjects, true);

		$.set(
			projects,
			await sdk.forConsole.organization($.get(selectedOrg)).listProjects({
				queries: [
					Query.equal('teamId', $.get(selectedOrg)),
					Query.orderDesc(''),
					Query.select(['$id', 'name'])
				]
			}),
			true
		);

		$.set(selectedProject, $.get(projects)?.total ? $.get(projects).projects[0].$id : null, true);
		$.set(loadingProjects, false);
	}

	async function handleSubmit() {
		if ($.get(selectedProject) === null) {
			try {
				$.set(loadingProjects, true);

				const project = await sdk.forConsole.organization($.get(selectedOrg)).createProject({
					projectId: $.get(id) ?? ID.unique(),
					name: $.get(projectName),
					region: isCloud ? $.get(region) : undefined
				});

				$.set(selectedProject, project.$id, true);

				trackEvent(Submit.ProjectCreate, {
					customId: !!$.get(id),
					selectedOrg: $.get(selectedOrg),
					teamId: $.get(selectedOrg),
					source: 'deploy-button'
				});

				const deployUrl = buildDeployUrl(project);

				await goto(deployUrl);
			} catch(e) {
				trackError(e, Submit.ProjectCreate);
				addNotification({ type: 'error', message: e.message });
			} finally {
				$.set(loadingProjects, false);
			}
		} else {
			const project = $.get(projects).projects.find((project) => project.$id === $.get(selectedProject));

			if (!project) {
				addNotification({ type: 'error', message: 'Selected project not found' });

				return;
			}

			await goto(buildDeployUrl(project));
		}
	}

	function buildDeployUrl(project) {
		// Use the selected region or default to 'default' if not available
		const projectRegion = isCloud ? $.get(region) : 'default';

		let url;

		if ($$props.data.deploymentData.type === 'template') {
			url = new URL(`${base}/project-${projectRegion}-${project.$id}/sites/create-site/templates/template-${$$props.data.deploymentData.template.key}`, window.location.origin);
		} else {
			url = new URL(`${base}/project-${projectRegion}-${project.$id}/sites/create-site/deploy`, window.location.origin);
			url.searchParams.set('repository', $$props.data.deploymentData.repository.url);

			// Pass through all the original URL params for repo deployments
			const currentUrl = new URL(window.location.href);

			const preset = currentUrl.searchParams.get('preset');
			const install = currentUrl.searchParams.get('install');
			const build = currentUrl.searchParams.get('build');
			const start = currentUrl.searchParams.get('start');
			const output = currentUrl.searchParams.get('output');

			if (preset) url.searchParams.set('preset', preset);
			if (install) url.searchParams.set('install', install);
			if (build) url.searchParams.set('build', build);
			if (start) url.searchParams.set('start', start);
			if (output) url.searchParams.set('output', output);
		}

		if ($$props.data.envKeys.length > 0) {
			url.searchParams.set('env', $$props.data.envKeys.join(','));
		}

		return url.toString();
	}

	$.user_effect(() => {
		if ($.get(selectedOrg) !== undefined) {
			fetchProjects();
		}
	});

	$.user_effect(() => {
		if (isCloud && $.get(selectedOrg)) {
			loadAvailableRegions($.get(selectedOrg));
		}
	});

	$.user_effect(() => {
		if (isCloud && $regionsStore().regions?.length > 0 && !$.get(region)) {
			$.set(region, $regionsStore().regions.find((r) => r.default)?.$id, true);
		}
	});

	var div = root_8();

	$.head('10d6qtw', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `Deploy ${$$props.data.deploymentData.name ?? ''} - Appwrite`;
		});
	});

	var section = $.child(div);
	var div_1 = $.child(section);

	$.set_style(div_1, '', {}, { 'max-width': '592px', width: '100%' });

	var node = $.child(div_1);

	$.component(node, () => Card.Base, ($$anchor, Card_Base) => {
		Card_Base($$anchor, {
			padding: 's',
			radius: 'l',
			style: 'width: 100%;',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						gap: 'xl',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
								Layout_Stack_1($$anchor, {
									gap: 'l',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_3();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => Typography.Title, ($$anchor, Typography_Title) => {
											Typography_Title($$anchor, {
												size: 'm',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Deploy site');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Card.Base, ($$anchor, Card_Base_1) => {
											Card_Base_1($$anchor, {
												variant: 'secondary',
												padding: 's',
												radius: 's',
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = $.comment();
													var node_5 = $.first_child(fragment_3);

													{
														var consequent_1 = ($$anchor) => {
															var fragment_4 = $.comment();
															var node_6 = $.first_child(fragment_4);

															$.component(node_6, () => Layout.GridFraction, ($$anchor, Layout_GridFraction) => {
																Layout_GridFraction($$anchor, {
																	start: 5,
																	end: 6,
																	children: ($$anchor, $$slotProps) => {
																		const framework = $.derived(() => $$props.data.deploymentData.template.frameworks[0]);
																		var fragment_5 = root();
																		var node_7 = $.first_child(fragment_5);

																		{
																			let $0 = $.derived(() => $app().themeInUse === 'dark'
																				? $$props.data.deploymentData.template.screenshotDark || `${base}/images/sites/screenshot-placeholder-dark.svg`
																				: $$props.data.deploymentData.template.screenshotLight || `${base}/images/sites/screenshot-placeholder-light.svg`);

																			Image(node_7, {
																				border: true,
																				radius: 'xs',
																				ratio: '16/9',
																				style: ' align-self: start',
																				get src() {
																					return $.get($0);
																				},
																				alt: 'Screenshot'
																			});
																		}

																		var node_8 = $.sibling(node_7, 2);

																		$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
																			Layout_Stack_2($$anchor, {
																				gap: 'xxl',
																				justifyContent: 'center',
																				children: ($$anchor, $$slotProps) => {
																					const frameworkIcon = $.derived(() => getFrameworkIcon($.get(framework).key));
																					var fragment_6 = root();
																					var node_9 = $.first_child(fragment_6);

																					$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																						Layout_Stack_3($$anchor, {
																							gap: 'xxs',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_7 = root();
																								var node_10 = $.first_child(fragment_7);

																								$.component(node_10, () => Typography.Text, ($$anchor, Typography_Text) => {
																									Typography_Text($$anchor, {
																										variant: 'm-500',
																										color: '--fgcolor-neutral-primary',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_1 = $.text();

																											$.template_effect(() => $.set_text(text_1, $$props.data.deploymentData.template.name));
																											$.append($$anchor, text_1);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_11 = $.sibling(node_10, 2);

																								$.component(node_11, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																									Typography_Text_1($$anchor, {
																										variant: 'm-500',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_2 = $.text();

																											$.template_effect(() => $.set_text(text_2, $$props.data.deploymentData.template.tagline));
																											$.append($$anchor, text_2);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_7);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_12 = $.sibling(node_9, 2);

																					$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																						Layout_Stack_4($$anchor, {
																							gap: 'xxs',
																							alignItems: 'center',
																							direction: 'row',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_10 = root();
																								var node_13 = $.first_child(fragment_10);

																								{
																									var consequent = ($$anchor) => {
																										SvgIcon($$anchor, {
																											iconSize: 'small',
																											size: 16,
																											get name() {
																												return $.get(frameworkIcon);
																											}
																										});
																									};

																									$.if(node_13, ($$render) => {
																										if ($.get(frameworkIcon)) $$render(consequent);
																									});
																								}

																								var node_14 = $.sibling(node_13, 2);

																								$.component(node_14, () => Typography.Text, ($$anchor, Typography_Text_2) => {
																									Typography_Text_2($$anchor, {
																										variant: 'm-500',
																										color: '--fgcolor-neutral-primary',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_3 = $.text();

																											$.template_effect(() => $.set_text(text_3, $.get(framework).name));
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

															$.append($$anchor, fragment_4);
														};

														var consequent_5 = ($$anchor) => {
															var fragment_13 = root();
															var node_15 = $.first_child(fragment_13);

															$.component(node_15, () => Layout.GridFraction, ($$anchor, Layout_GridFraction_1) => {
																Layout_GridFraction_1($$anchor, {
																	start: 5,
																	end: 6,
																	children: ($$anchor, $$slotProps) => {
																		var fragment_14 = root_1();
																		var div_2 = $.first_child(fragment_14);
																		var node_16 = $.child(div_2);

																		{
																			var consequent_2 = ($$anchor) => {
																				var fragment_15 = $.comment();
																				var node_17 = $.first_child(fragment_15);

																				$.component(node_17, () => Card.Base, ($$anchor, Card_Base_2) => {
																					Card_Base_2($$anchor, {
																						padding: 'none',
																						radius: 's',
																						style: 'position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;',
																						children: ($$anchor, $$slotProps) => {
																							Spinner($$anchor, { size: 'm', type: 'neutral' });
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_15);
																			};

																			$.if(node_16, ($$render) => {
																				if ($.get(imageLoading)) $$render(consequent_2);
																			});
																		}

																		var node_18 = $.sibling(node_16, 2);

																		{
																			let $0 = $.derived(() => $.get(imageLoading) ? 'opacity: 0;' : '');

																			let $1 = $.derived(() => $.get(screenshotOk)
																				? $$props.data.deploymentData.screenshot
																				: $app().themeInUse === 'dark'
																					? `${base}/images/sites/screenshot-placeholder-dark.svg`
																					: `${base}/images/sites/screenshot-placeholder-light.svg`);

																			Image(node_18, {
																				border: true,
																				radius: 'xs',
																				ratio: '16/9',
																				get style() {
																					return `align-self: start; ${$.get($0) ?? ''}`;
																				},

																				get src() {
																					return $.get($1);
																				},
																				alt: 'Screenshot',
																				onload: () => {
																					$.set(imageLoading, false);
																				},

																				onerror: () => {
																					$.set(screenshotOk, false);
																					$.set(imageLoading, false);
																				}
																			});
																		}

																		$.reset(div_2);

																		var node_19 = $.sibling(div_2, 2);

																		{
																			let $0 = $.derived(() => $$props.data.deploymentData.tagline ? 'space-between' : 'flex-start');

																			$.component(node_19, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
																				Layout_Stack_5($$anchor, {
																					gap: 's',
																					get justifyContent() {
																						return $.get($0);
																					},
																					style: 'flex: 1;',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_17 = $.comment();
																						var node_20 = $.first_child(fragment_17);

																						{
																							var consequent_3 = ($$anchor) => {
																								var fragment_18 = root();
																								var node_21 = $.first_child(fragment_18);

																								$.component(node_21, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
																									Layout_Stack_6($$anchor, {
																										gap: 'xxs',
																										style: 'margin: 0.8rem 0;',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_19 = root();
																											var node_22 = $.first_child(fragment_19);

																											$.component(node_22, () => Typography.Text, ($$anchor, Typography_Text_3) => {
																												Typography_Text_3($$anchor, {
																													variant: 'm-500',
																													color: '--fgcolor-neutral-primary',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_4 = $.text('Repository');

																														$.append($$anchor, text_4);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_23 = $.sibling(node_22, 2);

																											$.component(node_23, () => Typography.Text, ($$anchor, Typography_Text_4) => {
																												Typography_Text_4($$anchor, {
																													variant: 'm-500',
																													style: 'display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_5 = $.text();

																														$.template_effect(() => $.set_text(text_5, $$props.data.deploymentData.tagline));
																														$.append($$anchor, text_5);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_19);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_24 = $.sibling(node_21, 2);

																								$.component(node_24, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
																									Layout_Stack_7($$anchor, {
																										gap: 'xxs',
																										alignItems: 'center',
																										direction: 'row',
																										style: 'margin: 0.8rem 0;',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_21 = root();
																											var node_25 = $.first_child(fragment_21);

																											Icon(node_25, {
																												get icon() {
																													return IconGithub;
																												},
																												size: 'm'
																											});

																											var node_26 = $.sibling(node_25, 2);

																											$.component(node_26, () => Typography.Text, ($$anchor, Typography_Text_5) => {
																												Typography_Text_5($$anchor, {
																													variant: 'm-500',
																													color: '--fgcolor-neutral-primary',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_6 = $.text();

																														$.template_effect(() => $.set_text(text_6, `${$$props.data.deploymentData.repository.owner ?? ''}/${$$props.data.deploymentData.repository.name ?? ''}`));
																														$.append($$anchor, text_6);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_21);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_18);
																							};

																							var alternate = ($$anchor) => {
																								var fragment_23 = root();
																								var node_27 = $.first_child(fragment_23);

																								$.component(node_27, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
																									Layout_Stack_8($$anchor, {
																										gap: 'xxs',
																										style: 'margin-top: 0.8rem;',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_24 = $.comment();
																											var node_28 = $.first_child(fragment_24);

																											$.component(node_28, () => Typography.Text, ($$anchor, Typography_Text_6) => {
																												Typography_Text_6($$anchor, {
																													variant: 'm-500',
																													color: '--fgcolor-neutral-primary',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_7 = $.text('Repository');

																														$.append($$anchor, text_7);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_24);
																										},
																										$$slots: { default: true }
																									});
																								});

																								var node_29 = $.sibling(node_27, 2);

																								$.component(node_29, () => Layout.Stack, ($$anchor, Layout_Stack_9) => {
																									Layout_Stack_9($$anchor, {
																										gap: 'xxs',
																										alignItems: 'center',
																										direction: 'row',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_25 = root();
																											var node_30 = $.first_child(fragment_25);

																											Icon(node_30, {
																												get icon() {
																													return IconGithub;
																												},
																												size: 'm'
																											});

																											var node_31 = $.sibling(node_30, 2);

																											$.component(node_31, () => Typography.Text, ($$anchor, Typography_Text_7) => {
																												Typography_Text_7($$anchor, {
																													variant: 'm-500',
																													color: '--fgcolor-neutral-primary',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_8 = $.text();

																														$.template_effect(() => $.set_text(text_8, `${$$props.data.deploymentData.repository.owner ?? ''}/${$$props.data.deploymentData.repository.name ?? ''}`));
																														$.append($$anchor, text_8);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_25);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_23);
																							};

																							$.if(node_20, ($$render) => {
																								if ($$props.data.deploymentData.tagline) $$render(consequent_3); else $$render(alternate, -1);
																							});
																						}

																						$.append($$anchor, fragment_17);
																					},
																					$$slots: { default: true }
																				});
																			});
																		}

																		$.append($$anchor, fragment_14);
																	},
																	$$slots: { default: true }
																});
															});

															var node_32 = $.sibling(node_15, 2);

															{
																var consequent_4 = ($$anchor) => {
																	var fragment_27 = root_2();
																	var div_3 = $.first_child(fragment_27);
																	var node_33 = $.child(div_3);

																	Divider(node_33, {});
																	$.reset(div_3);

																	var node_34 = $.sibling(div_3, 2);

																	$.component(node_34, () => Layout.Stack, ($$anchor, Layout_Stack_10) => {
																		Layout_Stack_10($$anchor, {
																			gap: 'xs',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_28 = root();
																				var node_35 = $.first_child(fragment_28);

																				$.component(node_35, () => Typography.Text, ($$anchor, Typography_Text_8) => {
																					Typography_Text_8($$anchor, {
																						variant: 'm-500',
																						color: '--fgcolor-neutral-primary',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_9 = $.text('Environment variables required');

																							$.append($$anchor, text_9);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_36 = $.sibling(node_35, 2);

																				$.component(node_36, () => Layout.Stack, ($$anchor, Layout_Stack_11) => {
																					Layout_Stack_11($$anchor, {
																						direction: 'row',
																						gap: 'xs',
																						wrap: 'wrap',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_29 = $.comment();
																							var node_37 = $.first_child(fragment_29);

																							$.each(node_37, 17, () => $$props.data.envKeys, $.index, ($$anchor, envKey) => {
																								Badge($$anchor, {
																									variant: 'secondary',
																									get content() {
																										return $.get(envKey);
																									},
																									size: 's'
																								});
																							});

																							$.append($$anchor, fragment_29);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_28);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_27);
																};

																$.if(node_32, ($$render) => {
																	if ($$props.data.envKeys.length > 0) $$render(consequent_4);
																});
															}

															$.append($$anchor, fragment_13);
														};

														var alternate_1 = ($$anchor) => {
															var fragment_31 = $.comment();
															var node_38 = $.first_child(fragment_31);

															$.component(node_38, () => Layout.Stack, ($$anchor, Layout_Stack_12) => {
																Layout_Stack_12($$anchor, {
																	gap: 'm',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_32 = root_3();
																		var node_39 = $.first_child(fragment_32);

																		$.component(node_39, () => Typography.Text, ($$anchor, Typography_Text_9) => {
																			Typography_Text_9($$anchor, {
																				variant: 'm-500',
																				color: '--fgcolor-neutral-primary',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_10 = $.text('Repository');

																					$.append($$anchor, text_10);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_40 = $.sibling(node_39, 2);

																		$.component(node_40, () => Layout.Stack, ($$anchor, Layout_Stack_13) => {
																			Layout_Stack_13($$anchor, {
																				direction: 'row',
																				alignItems: 'center',
																				gap: 's',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_33 = root();
																					var node_41 = $.first_child(fragment_33);

																					Icon(node_41, {
																						get icon() {
																							return IconGithub;
																						},
																						size: 'm'
																					});

																					var node_42 = $.sibling(node_41, 2);

																					$.component(node_42, () => Typography.Text, ($$anchor, Typography_Text_10) => {
																						Typography_Text_10($$anchor, {
																							variant: 'm-400',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_11 = $.text();

																								$.template_effect(() => $.set_text(text_11, `${$$props.data.deploymentData.repository.owner ?? ''}/${$$props.data.deploymentData.repository.name ?? ''}`));
																								$.append($$anchor, text_11);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_33);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_43 = $.sibling(node_40, 2);

																		{
																			var consequent_6 = ($$anchor) => {
																				var fragment_35 = root();
																				var node_44 = $.first_child(fragment_35);

																				Divider(node_44, {});

																				var node_45 = $.sibling(node_44, 2);

																				$.component(node_45, () => Layout.Stack, ($$anchor, Layout_Stack_14) => {
																					Layout_Stack_14($$anchor, {
																						gap: 's',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_36 = root();
																							var node_46 = $.first_child(fragment_36);

																							$.component(node_46, () => Typography.Text, ($$anchor, Typography_Text_11) => {
																								Typography_Text_11($$anchor, {
																									variant: 'm-500',
																									color: '--fgcolor-neutral-primary',
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_12 = $.text('Environment variables required');

																										$.append($$anchor, text_12);
																									},
																									$$slots: { default: true }
																								});
																							});

																							var node_47 = $.sibling(node_46, 2);

																							$.component(node_47, () => Layout.Stack, ($$anchor, Layout_Stack_15) => {
																								Layout_Stack_15($$anchor, {
																									direction: 'row',
																									gap: 'xs',
																									wrap: 'wrap',
																									children: ($$anchor, $$slotProps) => {
																										var fragment_37 = $.comment();
																										var node_48 = $.first_child(fragment_37);

																										$.each(node_48, 17, () => $$props.data.envKeys, $.index, ($$anchor, envKey) => {
																											Badge($$anchor, {
																												variant: 'secondary',
																												get content() {
																													return $.get(envKey);
																												},
																												size: 's'
																											});
																										});

																										$.append($$anchor, fragment_37);
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

																			$.if(node_43, ($$render) => {
																				if ($$props.data.envKeys.length > 0) $$render(consequent_6);
																			});
																		}

																		$.append($$anchor, fragment_32);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_31);
														};

														$.if(node_5, ($$render) => {
															if ($$props.data.deploymentData.type === 'template') $$render(consequent_1); else if ($$props.data.deploymentData.type === 'repo' && $$props.data.deploymentData.screenshot) $$render(consequent_5, 1); else $$render(alternate_1, -1);
														});
													}

													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										});

										var node_49 = $.sibling(node_4, 2);

										Form(node_49, {
											onSubmit: handleSubmit,
											children: ($$anchor, $$slotProps) => {
												var fragment_39 = $.comment();
												var node_50 = $.first_child(fragment_39);

												$.component(node_50, () => Layout.Stack, ($$anchor, Layout_Stack_16) => {
													Layout_Stack_16($$anchor, {
														gap: 'xl',
														children: ($$anchor, $$slotProps) => {
															var fragment_40 = root_6();
															var node_51 = $.first_child(fragment_40);

															{
																let $0 = $.derived(() => $$props.data.organizations.teams.map((o) => ({ label: o.name, value: o.$id })));

																InputSelect(node_51, {
																	id: 'organization',
																	label: 'Organization',
																	required: true,
																	placeholder: 'Select an organization',
																	get options() {
																		return $.get($0);
																	},

																	get value() {
																		return $.get(selectedOrg);
																	},

																	set value($$value) {
																		$.set(selectedOrg, $$value, true);
																	}
																});
															}

															var node_52 = $.sibling(node_51, 2);

															{
																let $0 = $.derived(() => $.get(loadingProjects) ? 'Loading projects...' : undefined);

																let $1 = $.derived(() => [
																	...$.get(projects)?.projects?.map((project) => ({ label: project.name, value: project.$id })) ?? [],
																	{ label: 'Create project', leadingIcon: IconPlus, value: null }
																]);

																InputSelect(node_52, {
																	id: 'project',
																	label: 'Project',
																	required: true,
																	get placeholder() {
																		return $.get($0);
																	},

																	get disabled() {
																		return $.get(loadingProjects);
																	},

																	get options() {
																		return $.get($1);
																	},

																	get value() {
																		return $.get(selectedProject);
																	},

																	set value($$value) {
																		$.set(selectedProject, $$value, true);
																	}
																});
															}

															var node_53 = $.sibling(node_52, 2);

															{
																var consequent_9 = ($$anchor) => {
																	var fragment_41 = root();
																	var node_54 = $.first_child(fragment_41);

																	$.component(node_54, () => Layout.Stack, ($$anchor, Layout_Stack_17) => {
																		Layout_Stack_17($$anchor, {
																			direction: 'column',
																			gap: 's',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_42 = root_3();
																				var node_55 = $.first_child(fragment_42);

																				$.component(node_55, () => Input.Text, ($$anchor, Input_Text) => {
																					Input_Text($$anchor, {
																						label: 'Name',
																						placeholder: 'Project name',
																						required: true,
																						get value() {
																							return $.get(projectName);
																						},

																						set value($$value) {
																							$.set(projectName, $$value, true);
																						}
																					});
																				});

																				var node_56 = $.sibling(node_55, 2);

																				{
																					var consequent_7 = ($$anchor) => {
																						var div_4 = root_4();
																						var node_57 = $.child(div_4);

																						Tag(node_57, {
																							size: 's',
																							$$events: {
																								click: () => {
																									$.set(showCustomId, true);
																								}
																							},

																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_13 = $.text('Project ID');

																								$.append($$anchor, text_13);
																							},

																							$$slots: {
																								start: ($$anchor, $$slotProps) => {
																									Icon($$anchor, {
																										slot: 'start',
																										get icon() {
																											return IconPencil;
																										},
																										size: 's'
																									});
																								},
																								default: true
																							}
																						});

																						$.reset(div_4);
																						$.append($$anchor, div_4);
																					};

																					$.if(node_56, ($$render) => {
																						if (!$.get(showCustomId)) $$render(consequent_7);
																					});
																				}

																				var node_58 = $.sibling(node_56, 2);

																				CustomId(node_58, {
																					name: 'Project',
																					isProject: true,
																					get show() {
																						return $.get(showCustomId);
																					},

																					set show($$value) {
																						$.set(showCustomId, $$value, true);
																					},

																					get id() {
																						return $.get(id);
																					},

																					set id($$value) {
																						$.set(id, $$value, true);
																					}
																				});

																				$.append($$anchor, fragment_42);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_59 = $.sibling(node_54, 2);

																	{
																		var consequent_8 = ($$anchor) => {
																			var fragment_44 = $.comment();
																			var node_60 = $.first_child(fragment_44);

																			$.component(node_60, () => Layout.Stack, ($$anchor, Layout_Stack_18) => {
																				Layout_Stack_18($$anchor, {
																					gap: 'xs',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_45 = root();
																						var node_61 = $.first_child(fragment_45);

																						{
																							let $0 = $.derived(() => filterRegions($regionsStore().regions || []));

																							$.component(node_61, () => Input.Select, ($$anchor, Input_Select) => {
																								Input_Select($$anchor, {
																									required: true,
																									placeholder: 'Select a region',
																									get options() {
																										return $.get($0);
																									},
																									label: 'Region',
																									get value() {
																										return $.get(region);
																									},

																									set value($$value) {
																										$.set(region, $$value, true);
																									}
																								});
																							});
																						}

																						var node_62 = $.sibling(node_61, 2);

																						$.component(node_62, () => Typography.Text, ($$anchor, Typography_Text_12) => {
																							Typography_Text_12($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_14 = $.text('Region cannot be changed after creation');

																									$.append($$anchor, text_14);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_45);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_44);
																		};

																		$.if(node_59, ($$render) => {
																			if (isCloud) $$render(consequent_8);
																		});
																	}

																	$.append($$anchor, fragment_41);
																};

																$.if(node_53, ($$render) => {
																	if ($.get(selectedProject) === null) $$render(consequent_9);
																});
															}

															var node_63 = $.sibling(node_53, 2);

															Divider(node_63, {});

															var node_64 = $.sibling(node_63, 2);

															$.component(node_64, () => Layout.Stack, ($$anchor, Layout_Stack_19) => {
																Layout_Stack_19($$anchor, {
																	direction: 'row-reverse',
																	children: ($$anchor, $$slotProps) => {
																		var div_5 = root_4();
																		var node_65 = $.child(div_5);

																		{
																			let $0 = $.derived(() => !$.get(selectedOrg) || $.get(selectedProject) === 'create-new' && (!$.get(projectName) || isCloud && !$.get(region)));

																			Button(node_65, {
																				get disabled() {
																					return $.get($0);
																				},
																				submit: true,
																				children: ($$anchor, $$slotProps) => {
																					var span = root_5();

																					$.append($$anchor, span);
																				},
																				$$slots: { default: true }
																			});
																		}

																		$.reset(div_5);
																		$.append($$anchor, div_5);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_40);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_39);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.reset(section);

	var footer = $.sibling(section, 2);
	var node_66 = $.child(footer);

	{
		var consequent_10 = ($$anchor) => {
			var img = root_7();

			$.template_effect(() => $.set_attribute(img, 'src', `${base ?? ''}/images/appwrite-logo-dark.svg`));
			$.append($$anchor, img);
		};

		var alternate_2 = ($$anchor) => {
			var img_1 = root_7();

			$.template_effect(() => $.set_attribute(img_1, 'src', `${base ?? ''}/images/appwrite-logo-light.svg`));
			$.append($$anchor, img_1);
		};

		$.if(node_66, ($$render) => {
			if ($app().themeInUse === 'dark') $$render(consequent_10); else $$render(alternate_2, -1);
		});
	}

	$.reset(footer);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}
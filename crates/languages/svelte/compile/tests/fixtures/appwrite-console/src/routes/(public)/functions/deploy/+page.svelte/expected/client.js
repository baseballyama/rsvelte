import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { app } from '$lib/stores/app';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import CustomId from '$lib/components/customId.svelte';
import { Button, Form, InputSelect } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { ID, Query, Region } from '@appwrite.io/console';
import { IconGithub, IconPencil, IconPlus } from '@appwrite.io/pink-icons-svelte';
import { Badge, Card, Divider, Icon, Input, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
import { filterRegions } from '$lib/helpers/regions';
import { loadAvailableRegions } from '$routes/(console)/regions';
import { regions as regionsStore } from '$lib/stores/organization';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<span class="text">Continue</span>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<img width="120" height="22" alt="Appwrite Logo"/>`);
var root_6 = $.from_html(`<div class="auth-bg svelte-17rxij"><section class="console-container svelte-17rxij"><div><!></div></section> <footer class="svelte-17rxij"><!></footer></div>`);

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
					source: 'deploy-button-functions'
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
			const project = $.get(projects).projects.find((p) => p.$id === $.get(selectedProject));

			if (!project) {
				addNotification({ type: 'error', message: 'Selected project not found' });

				return;
			}

			await goto(buildDeployUrl(project));
		}
	}

	function buildDeployUrl(project) {
		let url;
		const projectRegion = isCloud ? $.get(region) : 'default';

		url = new URL(`${base}/project-${projectRegion}-${project.$id}/functions/create-function/deploy`, window.location.origin);
		url.searchParams.set('repo', $$props.data.deploymentData.repository.url);

		// Pass runtime if specified from original URL
		if ($$props.data.deploymentData.runtime) {
			url.searchParams.set('runtime', $$props.data.deploymentData.runtime);
		}

		// Pass through additional build configuration params if present
		const currentUrl = new URL(window.location.href);

		const entrypoint = currentUrl.searchParams.get('entrypoint');
		const install = currentUrl.searchParams.get('install');
		const build = currentUrl.searchParams.get('build');
		const rootDir = currentUrl.searchParams.get('rootDir');

		if (entrypoint) url.searchParams.set('entrypoint', entrypoint);
		if (install) url.searchParams.set('install', install);
		if (build) url.searchParams.set('build', build);
		if (rootDir) url.searchParams.set('rootDir', rootDir || $$props.data.deploymentData.repository.rootDirectory);

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

	var div = root_6();

	$.head('17rxij', ($$anchor) => {
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
										var fragment_2 = root_1();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => Typography.Title, ($$anchor, Typography_Title) => {
											Typography_Title($$anchor, {
												size: 'm',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Deploy function');

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

													$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
														Layout_Stack_2($$anchor, {
															gap: 'm',
															children: ($$anchor, $$slotProps) => {
																var fragment_4 = root_1();
																var node_6 = $.first_child(fragment_4);

																$.component(node_6, () => Typography.Text, ($$anchor, Typography_Text) => {
																	Typography_Text($$anchor, {
																		variant: 'm-500',
																		color: '--fgcolor-neutral-primary',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text('Repository');

																			$.append($$anchor, text_1);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_7 = $.sibling(node_6, 2);

																$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																	Layout_Stack_3($$anchor, {
																		direction: 'row',
																		alignItems: 'center',
																		gap: 's',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_5 = root();
																			var node_8 = $.first_child(fragment_5);

																			Icon(node_8, {
																				get icon() {
																					return IconGithub;
																				},
																				size: 'm'
																			});

																			var node_9 = $.sibling(node_8, 2);

																			$.component(node_9, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																				Typography_Text_1($$anchor, {
																					variant: 'm-400',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_2 = $.text();

																						$.template_effect(() => $.set_text(text_2, `${$$props.data.deploymentData.repository.owner ?? ''}/${$$props.data.deploymentData.repository.name ?? ''}`));
																						$.append($$anchor, text_2);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_5);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_10 = $.sibling(node_7, 2);

																{
																	var consequent = ($$anchor) => {
																		var fragment_7 = root();
																		var node_11 = $.first_child(fragment_7);

																		Divider(node_11, {});

																		var node_12 = $.sibling(node_11, 2);

																		$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																			Layout_Stack_4($$anchor, {
																				gap: 's',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_8 = root();
																					var node_13 = $.first_child(fragment_8);

																					$.component(node_13, () => Typography.Text, ($$anchor, Typography_Text_2) => {
																						Typography_Text_2($$anchor, {
																							variant: 'm-500',
																							color: '--fgcolor-neutral-primary',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_3 = $.text('Environment Variables Required');

																								$.append($$anchor, text_3);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_14 = $.sibling(node_13, 2);

																					$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
																						Layout_Stack_5($$anchor, {
																							direction: 'row',
																							gap: 'xs',
																							wrap: 'wrap',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_9 = $.comment();
																								var node_15 = $.first_child(fragment_9);

																								$.each(node_15, 17, () => $$props.data.envKeys, $.index, ($$anchor, envKey) => {
																									Badge($$anchor, {
																										get content() {
																											return $.get(envKey);
																										},
																										size: 's',
																										variant: 'secondary'
																									});
																								});

																								$.append($$anchor, fragment_9);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_8);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_7);
																	};

																	$.if(node_10, ($$render) => {
																		if ($$props.data.envKeys.length > 0) $$render(consequent);
																	});
																}

																$.append($$anchor, fragment_4);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_4, 2);

										Form(node_16, {
											onSubmit: handleSubmit,
											children: ($$anchor, $$slotProps) => {
												var fragment_11 = $.comment();
												var node_17 = $.first_child(fragment_11);

												$.component(node_17, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
													Layout_Stack_6($$anchor, {
														gap: 'xl',
														children: ($$anchor, $$slotProps) => {
															var fragment_12 = root_4();
															var node_18 = $.first_child(fragment_12);

															{
																let $0 = $.derived(() => $$props.data.organizations.teams.map((o) => ({ label: o.name, value: o.$id })));

																InputSelect(node_18, {
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

															var node_19 = $.sibling(node_18, 2);

															{
																let $0 = $.derived(() => $.get(loadingProjects) ? 'Loading projects...' : undefined);

																let $1 = $.derived(() => [
																	...$.get(projects)?.projects?.map((project) => ({ label: project.name, value: project.$id })) ?? [],
																	{ label: 'Create project', leadingIcon: IconPlus, value: null }
																]);

																InputSelect(node_19, {
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

															var node_20 = $.sibling(node_19, 2);

															{
																var consequent_3 = ($$anchor) => {
																	var fragment_13 = root();
																	var node_21 = $.first_child(fragment_13);

																	$.component(node_21, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
																		Layout_Stack_7($$anchor, {
																			direction: 'column',
																			gap: 's',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_14 = root_1();
																				var node_22 = $.first_child(fragment_14);

																				$.component(node_22, () => Input.Text, ($$anchor, Input_Text) => {
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

																				var node_23 = $.sibling(node_22, 2);

																				{
																					var consequent_1 = ($$anchor) => {
																						var div_2 = root_2();
																						var node_24 = $.child(div_2);

																						Tag(node_24, {
																							size: 's',
																							$$events: {
																								click: () => {
																									$.set(showCustomId, true);
																								}
																							},

																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_4 = $.text('Project ID');

																								$.append($$anchor, text_4);
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

																						$.reset(div_2);
																						$.append($$anchor, div_2);
																					};

																					$.if(node_23, ($$render) => {
																						if (!$.get(showCustomId)) $$render(consequent_1);
																					});
																				}

																				var node_25 = $.sibling(node_23, 2);

																				CustomId(node_25, {
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

																				$.append($$anchor, fragment_14);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_26 = $.sibling(node_21, 2);

																	{
																		var consequent_2 = ($$anchor) => {
																			var fragment_16 = $.comment();
																			var node_27 = $.first_child(fragment_16);

																			$.component(node_27, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
																				Layout_Stack_8($$anchor, {
																					gap: 'xs',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_17 = root();
																						var node_28 = $.first_child(fragment_17);

																						{
																							let $0 = $.derived(() => filterRegions($regionsStore().regions || []));

																							$.component(node_28, () => Input.Select, ($$anchor, Input_Select) => {
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

																						var node_29 = $.sibling(node_28, 2);

																						$.component(node_29, () => Typography.Text, ($$anchor, Typography_Text_3) => {
																							Typography_Text_3($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_5 = $.text('Region cannot be changed after creation');

																									$.append($$anchor, text_5);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_17);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_16);
																		};

																		$.if(node_26, ($$render) => {
																			if (isCloud) $$render(consequent_2);
																		});
																	}

																	$.append($$anchor, fragment_13);
																};

																$.if(node_20, ($$render) => {
																	if ($.get(selectedProject) === null) $$render(consequent_3);
																});
															}

															var node_30 = $.sibling(node_20, 2);

															Divider(node_30, {});

															var node_31 = $.sibling(node_30, 2);

															$.component(node_31, () => Layout.Stack, ($$anchor, Layout_Stack_9) => {
																Layout_Stack_9($$anchor, {
																	direction: 'row-reverse',
																	children: ($$anchor, $$slotProps) => {
																		var div_3 = root_2();
																		var node_32 = $.child(div_3);

																		{
																			let $0 = $.derived(() => !$.get(selectedOrg) || $.get(selectedProject) === 'create-new' && (!$.get(projectName) || isCloud && !$.get(region)));

																			Button(node_32, {
																				get disabled() {
																					return $.get($0);
																				},
																				submit: true,
																				children: ($$anchor, $$slotProps) => {
																					var span = root_3();

																					$.append($$anchor, span);
																				},
																				$$slots: { default: true }
																			});
																		}

																		$.reset(div_3);
																		$.append($$anchor, div_3);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_12);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_11);
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
	var node_33 = $.child(footer);

	{
		var consequent_4 = ($$anchor) => {
			var img = root_5();

			$.template_effect(() => $.set_attribute(img, 'src', `${base ?? ''}/images/appwrite-logo-dark.svg`));
			$.append($$anchor, img);
		};

		var alternate = ($$anchor) => {
			var img_1 = root_5();

			$.template_effect(() => $.set_attribute(img_1, 'src', `${base ?? ''}/images/appwrite-logo-light.svg`));
			$.append($$anchor, img_1);
		};

		$.if(node_33, ($$render) => {
			if ($app().themeInUse === 'dark') $$render(consequent_4); else $$render(alternate, -1);
		});
	}

	$.reset(footer);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}
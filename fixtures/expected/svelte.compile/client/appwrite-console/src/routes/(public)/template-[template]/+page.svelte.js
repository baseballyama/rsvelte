import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import CustomId from '$lib/components/customId.svelte';
import { SvgIcon } from '$lib/components/index.js';
import { Button, Form, InputSelect } from '$lib/elements/forms';
import { app } from '$lib/stores/app';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { getFrameworkIcon } from '$lib/stores/sites.js';
import { isCloud } from '$lib/system';
import { ID, OAuthProvider, Query, Region } from '@appwrite.io/console';
import { IconGithub, IconPencil, IconPlusSm } from '@appwrite.io/pink-icons-svelte';
import { Card, Divider, Icon, Image, Input, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
import { filterRegions } from '$lib/helpers/regions';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<span class="text">Continue</span>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<span class="text">Sign in with GitHub</span>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let projects = $.state(void 0);
	let selectedProject = $.state(void 0);
	let selectedOrg = $.state($.proxy($$props.data?.organizations?.total ? $$props.data.organizations.teams[0].$id : undefined));
	let projectName = $.state(void 0);
	let showCustomId = $.state(false);
	let region = $.state(void 0);
	let regions = $.proxy([]);
	let id = $.state(void 0);

	function isSiteTemplate(template, product) {
		return product === 'site' && 'frameworks' in template;
	}

	function onGithubLogin() {
		sdk.forConsole.account.createOAuth2Session({
			provider: OAuthProvider.Github,
			success: window.location.origin,
			failure: window.location.origin,
			scopes: ['read:user', 'user:email']
		});
	}

	async function fetchProjects() {
		$.set(
			projects,
			await sdk.forConsole.organization($.get(selectedOrg)).listProjects({
				queries: [
					Query.equal('teamId', $.get(selectedOrg)),
					Query.orderDesc(''),
					Query.select(['$id', 'name', 'region'])
				]
			}),
			true
		);

		$.set(selectedProject, $.get(projects)?.total ? $.get(projects).projects[0].$id : null, true);
	}

	function generateUrl(project) {
		if (isSiteTemplate($$props.data.template, $$props.data.product)) {
			return `${base}/project-${project.region}-${project.$id}/sites/create-site/templates/template-${$$props.data.template.key}`;
		} else {
			return `${base}/project-${project.region}-${project.$id}/functions/create-function/templates/template-${$$props.data.template.name}`;
		}
	}

	async function handleSubmit() {
		if ($.get(selectedProject) === null) {
			try {
				const p = await sdk.forConsole.organization($.get(selectedOrg)).createProject({
					projectId: $.get(id) ?? ID.unique(),
					name: $.get(projectName),
					region: isCloud ? $.get(region) : undefined
				});

				trackEvent(Submit.ProjectCreate, {
					customId: !!$.get(id),
					selectedOrg: $.get(selectedOrg),
					teamId: $.get(selectedOrg)
				});

				$.set(selectedProject, p.$id, true);
				window.location.href = generateUrl(p);
			} catch(e) {
				trackError(e, Submit.ProjectCreate);
				addNotification({ type: 'error', message: e.message });
			}
		} else {
			const project = $.get(projects).projects.find((p) => p.$id === $.get(selectedProject));

			window.location.href = generateUrl(project);
		}
	}

	$.user_effect(() => {
		if ($.get(selectedOrg) !== undefined) {
			fetchProjects();
		}
	});

	var div = root_1();

	$.head('rd76t1', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `Deploy ${$$props.data.template.name ?? ''} - Appwrite`;
		});
	});

	$.set_style(div, '', {}, { 'max-width': '592px', width: '100%' });

	var node = $.child(div);

	$.component(node, () => Card.Base, ($$anchor, Card_Base) => {
		Card_Base($$anchor, {
			padding: 's',
			radius: 'l',
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
										var fragment_2 = root_2();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => Typography.Title, ($$anchor, Typography_Title) => {
											Typography_Title($$anchor, {
												size: 'm',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, `Deploy ${$$props.data.product ?? ''}`));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Card.Base, ($$anchor, Card_Base_1) => {
											Card_Base_1($$anchor, {
												variant: 'secondary',
												padding: 'xxxs',
												radius: 's',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => Layout.GridFraction, ($$anchor, Layout_GridFraction) => {
														Layout_GridFraction($$anchor, {
															start: 5,
															end: 6,
															children: ($$anchor, $$slotProps) => {
																var fragment_5 = $.comment();
																var node_6 = $.first_child(fragment_5);

																{
																	var consequent_1 = ($$anchor) => {
																		const framework = $.derived(() => $$props.data.template.frameworks[0]);
																		var fragment_6 = root();
																		var node_7 = $.first_child(fragment_6);

																		{
																			let $0 = $.derived(() => $app().themeInUse === 'dark'
																				? $$props.data.template.screenshotDark || `${base}/images/sites/screenshot-placeholder-dark.svg`
																				: $$props.data.template.screenshotLight || `${base}/images/sites/screenshot-placeholder-light.svg`);

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
																					var fragment_7 = root();
																					var node_9 = $.first_child(fragment_7);

																					$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																						Layout_Stack_3($$anchor, {
																							gap: 'xxs',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_8 = root();
																								var node_10 = $.first_child(fragment_8);

																								$.component(node_10, () => Typography.Text, ($$anchor, Typography_Text) => {
																									Typography_Text($$anchor, {
																										variant: 'm-500',
																										color: '--fgcolor-neutral-primary',
																										children: ($$anchor, $$slotProps) => {
																											$.next();

																											var text_1 = $.text();

																											$.template_effect(() => $.set_text(text_1, $$props.data.template.name));
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

																											$.template_effect(() => $.set_text(text_2, $$props.data.template.tagline));
																											$.append($$anchor, text_2);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_8);
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
																								var fragment_11 = root();
																								var node_13 = $.first_child(fragment_11);

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

																								$.append($$anchor, fragment_11);
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
																	};

																	var d = $.derived(() => isSiteTemplate($$props.data.template, $$props.data.product));

																	$.if(node_6, ($$render) => {
																		if ($.get(d)) $$render(consequent_1);
																	});
																}

																$.append($$anchor, fragment_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_15 = $.sibling(node_4, 2);

										{
											var consequent_6 = ($$anchor) => {
												Form($$anchor, {
													onSubmit: handleSubmit,
													children: ($$anchor, $$slotProps) => {
														var fragment_15 = $.comment();
														var node_16 = $.first_child(fragment_15);

														$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
															Layout_Stack_5($$anchor, {
																gap: 'xl',
																children: ($$anchor, $$slotProps) => {
																	var fragment_16 = root_4();
																	var node_17 = $.first_child(fragment_16);

																	{
																		let $0 = $.derived(() => $$props.data.organizations.teams.map((o) => ({ label: o.name, value: o.$id })));

																		InputSelect(node_17, {
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

																	var node_18 = $.sibling(node_17, 2);

																	{
																		var consequent_2 = ($$anchor) => {
																			var fragment_17 = $.comment();
																			var node_19 = $.first_child(fragment_17);

																			$.key(node_19, () => $.get(selectedProject), ($$anchor) => {
																				{
																					let $0 = $.derived(() => [
																						...$.get(projects).projects.map((project) => ({ label: project.name, value: project.$id })),
																						{
																							label: 'Create project',
																							leadingIcon: IconPlusSm,
																							value: null
																						}
																					]);

																					InputSelect($$anchor, {
																						id: 'project',
																						label: 'Project',
																						required: true,
																						get options() {
																							return $.get($0);
																						},

																						get value() {
																							return $.get(selectedProject);
																						},

																						set value($$value) {
																							$.set(selectedProject, $$value, true);
																						}
																					});
																				}
																			});

																			$.append($$anchor, fragment_17);
																		};

																		$.if(node_18, ($$render) => {
																			if ($.get(projects)?.total) $$render(consequent_2);
																		});
																	}

																	var node_20 = $.sibling(node_18, 2);

																	{
																		var consequent_5 = ($$anchor) => {
																			var fragment_19 = root();
																			var node_21 = $.first_child(fragment_19);

																			$.component(node_21, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
																				Layout_Stack_6($$anchor, {
																					direction: 'column',
																					gap: 's',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_20 = root_2();
																						var node_22 = $.first_child(fragment_20);

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
																							var consequent_3 = ($$anchor) => {
																								var div_1 = root_1();
																								var node_24 = $.child(div_1);

																								Tag(node_24, {
																									size: 's',
																									$$events: {
																										click: () => {
																											$.set(showCustomId, true);
																										}
																									},

																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_4 = $.text('Project\n                                                ID');

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

																								$.reset(div_1);
																								$.append($$anchor, div_1);
																							};

																							$.if(node_23, ($$render) => {
																								if (!$.get(showCustomId)) $$render(consequent_3);
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

																						$.append($$anchor, fragment_20);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_26 = $.sibling(node_21, 2);

																			{
																				var consequent_4 = ($$anchor) => {
																					var fragment_22 = $.comment();
																					var node_27 = $.first_child(fragment_22);

																					$.component(node_27, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
																						Layout_Stack_7($$anchor, {
																							gap: 'xs',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_23 = root();
																								var node_28 = $.first_child(fragment_23);

																								{
																									let $0 = $.derived(() => filterRegions(regions));

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

																								$.append($$anchor, fragment_23);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_22);
																				};

																				$.if(node_26, ($$render) => {
																					if (isCloud) $$render(consequent_4);
																				});
																			}

																			$.append($$anchor, fragment_19);
																		};

																		$.if(node_20, ($$render) => {
																			if ($.get(selectedProject) === null) $$render(consequent_5);
																		});
																	}

																	var node_30 = $.sibling(node_20, 2);

																	Divider(node_30, {});

																	var node_31 = $.sibling(node_30, 2);

																	$.component(node_31, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
																		Layout_Stack_8($$anchor, {
																			direction: 'row-reverse',
																			children: ($$anchor, $$slotProps) => {
																				var div_2 = root_1();
																				var node_32 = $.child(div_2);

																				{
																					let $0 = $.derived(() => !$.get(selectedOrg) || !$.get(selectedProject) && !$.get(projectName) && !$.get(region));

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

																				$.reset(div_2);
																				$.append($$anchor, div_2);
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
													},
													$$slots: { default: true }
												});
											};

											var alternate = ($$anchor) => {
												var fragment_24 = root_2();
												var node_33 = $.first_child(fragment_24);

												$.component(node_33, () => Typography.Text, ($$anchor, Typography_Text_4) => {
													Typography_Text_4($$anchor, {
														variant: 'm-500',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Sign in to deploy a site from GitHub.');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_34 = $.sibling(node_33, 2);

												Divider(node_34, {});

												var node_35 = $.sibling(node_34, 2);

												Button(node_35, {
													secondary: true,
													fullWidth: true,
													$$events: { click: onGithubLogin },
													children: ($$anchor, $$slotProps) => {
														var span_1 = root_5();

														$.append($$anchor, span_1);
													},

													$$slots: {
														default: true,
														start: ($$anchor, $$slotProps) => {
															Icon($$anchor, {
																slot: 'start',
																get icon() {
																	return IconGithub;
																}
															});
														}
													}
												});

												$.append($$anchor, fragment_24);
											};

											$.if(node_15, ($$render) => {
												if ($$props.data.account) $$render(consequent_6); else $$render(alternate, -1);
											});
										}

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

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}
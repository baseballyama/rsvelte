import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let projects = void 0;
		let selectedProject = void 0;
		let selectedOrg = data?.organizations?.total ? data.organizations.teams[0].$id : undefined;
		let projectName = void 0;
		let showCustomId = false;
		let region = void 0;
		let regions = [];
		let id = void 0;

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
			projects = await sdk.forConsole.organization(selectedOrg).listProjects({
				queries: [
					Query.equal('teamId', selectedOrg),
					Query.orderDesc(''),
					Query.select(['$id', 'name', 'region'])
				]
			});

			selectedProject = projects?.total ? projects.projects[0].$id : null;
		}

		function generateUrl(project) {
			if (isSiteTemplate(data.template, data.product)) {
				return `${base}/project-${project.region}-${project.$id}/sites/create-site/templates/template-${data.template.key}`;
			} else {
				return `${base}/project-${project.region}-${project.$id}/functions/create-function/templates/template-${data.template.name}`;
			}
		}

		async function handleSubmit() {
			if (selectedProject === null) {
				try {
					const p = await sdk.forConsole.organization(selectedOrg).createProject({
						projectId: id ?? ID.unique(),
						name: projectName,
						region: isCloud ? region : undefined
					});

					trackEvent(Submit.ProjectCreate, { customId: !!id, selectedOrg, teamId: selectedOrg });
					selectedProject = p.$id;
					window.location.href = generateUrl(p);
				} catch(e) {
					trackError(e, Submit.ProjectCreate);
					addNotification({ type: 'error', message: e.message });
				}
			} else {
				const project = projects.projects.find((p) => p.$id === selectedProject);

				window.location.href = generateUrl(project);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('rd76t1', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Deploy ${$.escape(data.template.name)} - Appwrite</title>`);
				});
			});

			$$renderer.push(`<div${$.attr_style('', { 'max-width': '592px', width: '100%' })}>`);

			if (Card.Base) {
				$$renderer.push('<!--[-->');

				Card.Base($$renderer, {
					padding: 's',
					radius: 'l',
					children: ($$renderer) => {
						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								gap: 'xl',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'l',
											children: ($$renderer) => {
												if (Typography.Title) {
													$$renderer.push('<!--[-->');

													Typography.Title($$renderer, {
														size: 'm',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Deploy ${$.escape(data.product)}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Card.Base) {
													$$renderer.push('<!--[-->');

													Card.Base($$renderer, {
														variant: 'secondary',
														padding: 'xxxs',
														radius: 's',
														children: ($$renderer) => {
															if (Layout.GridFraction) {
																$$renderer.push('<!--[-->');

																Layout.GridFraction($$renderer, {
																	start: 5,
																	end: 6,
																	children: ($$renderer) => {
																		if (isSiteTemplate(data.template, data.product)) {
																			$$renderer.push('<!--[0-->');

																			const framework = data.template.frameworks[0];

																			Image($$renderer, {
																				border: true,
																				radius: 'xs',
																				ratio: '16/9',
																				style: ' align-self: start',
																				src: $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark'
																					? data.template.screenshotDark || `${base}/images/sites/screenshot-placeholder-dark.svg`
																					: data.template.screenshotLight || `${base}/images/sites/screenshot-placeholder-light.svg`,
																				alt: 'Screenshot'
																			});

																			$$renderer.push(`<!----> `);

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					gap: 'xxl',
																					justifyContent: 'center',
																					children: ($$renderer) => {
																						const frameworkIcon = getFrameworkIcon(framework.key);

																						if (Layout.Stack) {
																							$$renderer.push('<!--[-->');

																							Layout.Stack($$renderer, {
																								gap: 'xxs',
																								children: ($$renderer) => {
																									if (Typography.Text) {
																										$$renderer.push('<!--[-->');

																										Typography.Text($$renderer, {
																											variant: 'm-500',
																											color: '--fgcolor-neutral-primary',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->${$.escape(data.template.name)}`);
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
																												$$renderer.push(`<!---->${$.escape(data.template.tagline)}`);
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
																								gap: 'xxs',
																								alignItems: 'center',
																								direction: 'row',
																								children: ($$renderer) => {
																									if (frameworkIcon) {
																										$$renderer.push('<!--[0-->');
																										SvgIcon($$renderer, { iconSize: 'small', size: 16, name: frameworkIcon });
																									} else {
																										$$renderer.push('<!--[-1-->');
																									}

																									$$renderer.push(`<!--]--> `);

																									if (Typography.Text) {
																										$$renderer.push('<!--[-->');

																										Typography.Text($$renderer, {
																											variant: 'm-500',
																											color: '--fgcolor-neutral-primary',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->${$.escape(framework.name)}`);
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
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (data.account) {
													$$renderer.push('<!--[0-->');

													Form($$renderer, {
														onSubmit: handleSubmit,
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 'xl',
																	children: ($$renderer) => {
																		InputSelect($$renderer, {
																			id: 'organization',
																			label: 'Organization',
																			required: true,
																			placeholder: 'Select an organization',
																			options: data.organizations.teams.map((o) => ({ label: o.name, value: o.$id })),
																			get value() {
																				return selectedOrg;
																			},

																			set value($$value) {
																				selectedOrg = $$value;
																				$$settled = false;
																			}
																		});

																		$$renderer.push(`<!----> `);

																		if (projects?.total) {
																			$$renderer.push(`<!--[0--><!---->`);

																			{
																				InputSelect($$renderer, {
																					id: 'project',
																					label: 'Project',
																					required: true,
																					options: [
																						...projects.projects.map((project) => ({ label: project.name, value: project.$id })),
																						{
																							label: 'Create project',
																							leadingIcon: IconPlusSm,
																							value: null
																						}
																					],

																					get value() {
																						return selectedProject;
																					},

																					set value($$value) {
																						selectedProject = $$value;
																						$$settled = false;
																					}
																				});
																			}

																			$$renderer.push(`<!---->`);
																		} else {
																			$$renderer.push('<!--[-1-->');
																		}

																		$$renderer.push(`<!--]--> `);

																		if (selectedProject === null) {
																			$$renderer.push('<!--[0-->');

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					direction: 'column',
																					gap: 's',
																					children: ($$renderer) => {
																						if (Input.Text) {
																							$$renderer.push('<!--[-->');

																							Input.Text($$renderer, {
																								label: 'Name',
																								placeholder: 'Project name',
																								required: true,
																								get value() {
																									return projectName;
																								},

																								set value($$value) {
																									projectName = $$value;
																									$$settled = false;
																								}
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` `);

																						if (!showCustomId) {
																							$$renderer.push(`<!--[0--><div>`);

																							Tag($$renderer, {
																								size: 's',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Project
                                                ID`);
																								},

																								$$slots: {
																									start: ($$renderer) => {
																										Icon($$renderer, { slot: 'start', icon: IconPencil, size: 's' });
																									},
																									default: true
																								}
																							});

																							$$renderer.push(`<!----></div>`);
																						} else {
																							$$renderer.push('<!--[-1-->');
																						}

																						$$renderer.push(`<!--]--> `);

																						CustomId($$renderer, {
																							name: 'Project',
																							isProject: true,
																							get show() {
																								return showCustomId;
																							},

																							set show($$value) {
																								showCustomId = $$value;
																								$$settled = false;
																							},

																							get id() {
																								return id;
																							},

																							set id($$value) {
																								id = $$value;
																								$$settled = false;
																							}
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

																			$$renderer.push(` `);

																			if (isCloud) {
																				$$renderer.push('<!--[0-->');

																				if (Layout.Stack) {
																					$$renderer.push('<!--[-->');

																					Layout.Stack($$renderer, {
																						gap: 'xs',
																						children: ($$renderer) => {
																							if (Input.Select) {
																								$$renderer.push('<!--[-->');

																								Input.Select($$renderer, {
																									required: true,
																									placeholder: 'Select a region',
																									options: filterRegions(regions),
																									label: 'Region',
																									get value() {
																										return region;
																									},

																									set value($$value) {
																										region = $$value;
																										$$settled = false;
																									}
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
																										$$renderer.push(`<!---->Region cannot be changed after creation`);
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

																			$$renderer.push(`<!--]-->`);
																		} else {
																			$$renderer.push('<!--[-1-->');
																		}

																		$$renderer.push(`<!--]--> `);
																		Divider($$renderer, {});
																		$$renderer.push(`<!----> `);

																		if (Layout.Stack) {
																			$$renderer.push('<!--[-->');

																			Layout.Stack($$renderer, {
																				direction: 'row-reverse',
																				children: ($$renderer) => {
																					$$renderer.push(`<div>`);

																					Button($$renderer, {
																						disabled: !selectedOrg || !selectedProject && !projectName && !region,
																						submit: true,
																						children: ($$renderer) => {
																							$$renderer.push(`<span class="text">Continue</span>`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push(`<!----></div>`);
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
												} else {
													$$renderer.push('<!--[-1-->');

													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															variant: 'm-500',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Sign in to deploy a site from GitHub.`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);
													Divider($$renderer, {});
													$$renderer.push(`<!----> `);

													Button($$renderer, {
														secondary: true,
														fullWidth: true,
														children: ($$renderer) => {
															$$renderer.push(`<span class="text">Sign in with GitHub</span>`);
														},

														$$slots: {
															default: true,
															start: ($$renderer) => {
																Icon($$renderer, { slot: 'start', icon: IconGithub });
															}
														}
													});

													$$renderer.push(`<!---->`);
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

			$$renderer.push(`</div>`);
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
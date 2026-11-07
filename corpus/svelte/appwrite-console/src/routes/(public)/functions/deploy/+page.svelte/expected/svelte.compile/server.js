import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let projects = void 0;
		let selectedProject = void 0;
		let selectedOrg = data?.organizations?.total ? data.organizations.teams[0].$id : undefined;
		let projectName = '';
		let showCustomId = false;
		let region = void 0;
		let id = '';
		let loadingProjects = false;

		async function fetchProjects() {
			loadingProjects = true;

			projects = await sdk.forConsole.organization(selectedOrg).listProjects({
				queries: [
					Query.equal('teamId', selectedOrg),
					Query.orderDesc(''),
					Query.select(['$id', 'name'])
				]
			});

			selectedProject = projects?.total ? projects.projects[0].$id : null;
			loadingProjects = false;
		}

		async function handleSubmit() {
			if (selectedProject === null) {
				try {
					loadingProjects = true;

					const project = await sdk.forConsole.organization(selectedOrg).createProject({
						projectId: id ?? ID.unique(),
						name: projectName,
						region: isCloud ? region : undefined
					});

					selectedProject = project.$id;

					trackEvent(Submit.ProjectCreate, {
						customId: !!id,
						selectedOrg,
						teamId: selectedOrg,
						source: 'deploy-button-functions'
					});

					const deployUrl = buildDeployUrl(project);

					await goto(deployUrl);
				} catch(e) {
					trackError(e, Submit.ProjectCreate);
					addNotification({ type: 'error', message: e.message });
				} finally {
					loadingProjects = false;
				}
			} else {
				const project = projects.projects.find((p) => p.$id === selectedProject);

				if (!project) {
					addNotification({ type: 'error', message: 'Selected project not found' });

					return;
				}

				await goto(buildDeployUrl(project));
			}
		}

		function buildDeployUrl(project) {
			let url;
			const projectRegion = isCloud ? region : 'default';

			url = new URL(`${base}/project-${projectRegion}-${project.$id}/functions/create-function/deploy`, window.location.origin);
			url.searchParams.set('repo', data.deploymentData.repository.url);

			// Pass runtime if specified from original URL
			if (data.deploymentData.runtime) {
				url.searchParams.set('runtime', data.deploymentData.runtime);
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
			if (rootDir) url.searchParams.set('rootDir', rootDir || data.deploymentData.repository.rootDirectory);

			if (data.envKeys.length > 0) {
				url.searchParams.set('env', data.envKeys.join(','));
			}

			return url.toString();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('17rxij', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Deploy ${$.escape(data.deploymentData.name)} - Appwrite</title>`);
				});
			});

			$$renderer.push(`<div class="auth-bg svelte-17rxij"><section class="console-container svelte-17rxij"><div${$.attr_style('', { 'max-width': '592px', width: '100%' })}>`);

			if (Card.Base) {
				$$renderer.push('<!--[-->');

				Card.Base($$renderer, {
					padding: 's',
					radius: 'l',
					style: 'width: 100%;',
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
															$$renderer.push(`<!---->Deploy function`);
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
														padding: 's',
														radius: 's',
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 'm',
																	children: ($$renderer) => {
																		if (Typography.Text) {
																			$$renderer.push('<!--[-->');

																			Typography.Text($$renderer, {
																				variant: 'm-500',
																				color: '--fgcolor-neutral-primary',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Repository`);
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
																				alignItems: 'center',
																				gap: 's',
																				children: ($$renderer) => {
																					Icon($$renderer, { icon: IconGithub, size: 'm' });
																					$$renderer.push(`<!----> `);

																					if (Typography.Text) {
																						$$renderer.push('<!--[-->');

																						Typography.Text($$renderer, {
																							variant: 'm-400',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(data.deploymentData.repository.owner)}/${$.escape(data.deploymentData.repository.name)}`);
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

																		if (data.envKeys.length > 0) {
																			$$renderer.push('<!--[0-->');
																			Divider($$renderer, {});
																			$$renderer.push(`<!----> `);

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					gap: 's',
																					children: ($$renderer) => {
																						if (Typography.Text) {
																							$$renderer.push('<!--[-->');

																							Typography.Text($$renderer, {
																								variant: 'm-500',
																								color: '--fgcolor-neutral-primary',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Environment Variables Required`);
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
																								gap: 'xs',
																								wrap: 'wrap',
																								children: ($$renderer) => {
																									$$renderer.push(`<!--[-->`);

																									const each_array = $.ensure_array_like(data.envKeys);

																									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																										let envKey = each_array[$$index];

																										Badge($$renderer, { content: envKey, size: 's', variant: 'secondary' });
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

																	InputSelect($$renderer, {
																		id: 'project',
																		label: 'Project',
																		required: true,
																		placeholder: loadingProjects ? 'Loading projects...' : undefined,
																		disabled: loadingProjects,
																		options: [
																			...projects?.projects?.map((project) => ({ label: project.name, value: project.$id })) ?? [],
																			{ label: 'Create project', leadingIcon: IconPlus, value: null }
																		],

																		get value() {
																			return selectedProject;
																		},

																		set value($$value) {
																			selectedProject = $$value;
																			$$settled = false;
																		}
																	});

																	$$renderer.push(`<!----> `);

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
																								$$renderer.push(`<!---->Project ID`);
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
																								options: filterRegions($.store_get($$store_subs ??= {}, '$regionsStore', regionsStore).regions || []),
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
																					disabled: !selectedOrg || selectedProject === 'create-new' && (!projectName || isCloud && !region),
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div></section> <footer class="svelte-17rxij">`);

			if ($.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark') {
				$$renderer.push(`<!--[0--><img${$.attr('src', `${$.stringify(base)}/images/appwrite-logo-dark.svg`)} width="120" height="22" alt="Appwrite Logo"/>`);
			} else {
				$$renderer.push(`<!--[-1--><img${$.attr('src', `${$.stringify(base)}/images/appwrite-logo-light.svg`)} width="120" height="22" alt="Appwrite Logo"/>`);
			}

			$$renderer.push(`<!--]--></footer></div>`);
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
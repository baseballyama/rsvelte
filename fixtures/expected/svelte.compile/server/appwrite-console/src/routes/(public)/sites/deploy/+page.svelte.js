import * as $ from 'svelte/internal/server';
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
		let screenshotOk = true;
		let imageLoading = true;
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
						source: 'deploy-button'
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
				const project = projects.projects.find((project) => project.$id === selectedProject);

				if (!project) {
					addNotification({ type: 'error', message: 'Selected project not found' });

					return;
				}

				await goto(buildDeployUrl(project));
			}
		}

		function buildDeployUrl(project) {
			// Use the selected region or default to 'default' if not available
			const projectRegion = isCloud ? region : 'default';

			let url;

			if (data.deploymentData.type === 'template') {
				url = new URL(`${base}/project-${projectRegion}-${project.$id}/sites/create-site/templates/template-${data.deploymentData.template.key}`, window.location.origin);
			} else {
				url = new URL(`${base}/project-${projectRegion}-${project.$id}/sites/create-site/deploy`, window.location.origin);
				url.searchParams.set('repository', data.deploymentData.repository.url);

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

			if (data.envKeys.length > 0) {
				url.searchParams.set('env', data.envKeys.join(','));
			}

			return url.toString();
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('10d6qtw', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Deploy ${$.escape(data.deploymentData.name)} - Appwrite</title>`);
				});
			});

			$$renderer.push(`<div class="auth-bg svelte-10d6qtw"><section class="console-container svelte-10d6qtw"><div${$.attr_style('', { 'max-width': '592px', width: '100%' })}>`);

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
															$$renderer.push(`<!---->Deploy site`);
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
															if (data.deploymentData.type === 'template') {
																$$renderer.push('<!--[0-->');

																if (Layout.GridFraction) {
																	$$renderer.push('<!--[-->');

																	Layout.GridFraction($$renderer, {
																		start: 5,
																		end: 6,
																		children: ($$renderer) => {
																			const framework = data.deploymentData.template.frameworks[0];

																			Image($$renderer, {
																				border: true,
																				radius: 'xs',
																				ratio: '16/9',
																				style: ' align-self: start',
																				src: $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark'
																					? data.deploymentData.template.screenshotDark || `${base}/images/sites/screenshot-placeholder-dark.svg`
																					: data.deploymentData.template.screenshotLight || `${base}/images/sites/screenshot-placeholder-light.svg`,
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
																												$$renderer.push(`<!---->${$.escape(data.deploymentData.template.name)}`);
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
																												$$renderer.push(`<!---->${$.escape(data.deploymentData.template.tagline)}`);
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
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															} else if (data.deploymentData.type === 'repo' && data.deploymentData.screenshot) {
																$$renderer.push('<!--[1-->');

																if (Layout.GridFraction) {
																	$$renderer.push('<!--[-->');

																	Layout.GridFraction($$renderer, {
																		start: 5,
																		end: 6,
																		children: ($$renderer) => {
																			$$renderer.push(`<div style="position: relative; aspect-ratio: 16/9;">`);

																			if (imageLoading) {
																				$$renderer.push('<!--[0-->');

																				if (Card.Base) {
																					$$renderer.push('<!--[-->');

																					Card.Base($$renderer, {
																						padding: 'none',
																						radius: 's',
																						style: 'position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;',
																						children: ($$renderer) => {
																							Spinner($$renderer, { size: 'm', type: 'neutral' });
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

																			Image($$renderer, {
																				border: true,
																				radius: 'xs',
																				ratio: '16/9',
																				style: `align-self: start; ${imageLoading ? 'opacity: 0;' : ''}`,
																				src: screenshotOk
																					? data.deploymentData.screenshot
																					: $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark'
																						? `${base}/images/sites/screenshot-placeholder-dark.svg`
																						: `${base}/images/sites/screenshot-placeholder-light.svg`,
																				alt: 'Screenshot',
																				onload: () => {
																					imageLoading = false;
																				},

																				onerror: () => {
																					screenshotOk = false;
																					imageLoading = false;
																				}
																			});

																			$$renderer.push(`<!----></div> `);

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					gap: 's',
																					justifyContent: data.deploymentData.tagline ? 'space-between' : 'flex-start',
																					style: 'flex: 1;',
																					children: ($$renderer) => {
																						if (data.deploymentData.tagline) {
																							$$renderer.push('<!--[0-->');

																							if (Layout.Stack) {
																								$$renderer.push('<!--[-->');

																								Layout.Stack($$renderer, {
																									gap: 'xxs',
																									style: 'margin: 0.8rem 0;',
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

																										if (Typography.Text) {
																											$$renderer.push('<!--[-->');

																											Typography.Text($$renderer, {
																												variant: 'm-500',
																												style: 'display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->${$.escape(data.deploymentData.tagline)}`);
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
																									style: 'margin: 0.8rem 0;',
																									children: ($$renderer) => {
																										Icon($$renderer, { icon: IconGithub, size: 'm' });
																										$$renderer.push(`<!----> `);

																										if (Typography.Text) {
																											$$renderer.push('<!--[-->');

																											Typography.Text($$renderer, {
																												variant: 'm-500',
																												color: '--fgcolor-neutral-primary',
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
																						} else {
																							$$renderer.push('<!--[-1-->');

																							if (Layout.Stack) {
																								$$renderer.push('<!--[-->');

																								Layout.Stack($$renderer, {
																									gap: 'xxs',
																									style: 'margin-top: 0.8rem;',
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
																										Icon($$renderer, { icon: IconGithub, size: 'm' });
																										$$renderer.push(`<!----> `);

																										if (Typography.Text) {
																											$$renderer.push('<!--[-->');

																											Typography.Text($$renderer, {
																												variant: 'm-500',
																												color: '--fgcolor-neutral-primary',
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

																if (data.envKeys.length > 0) {
																	$$renderer.push(`<!--[0--><div style="margin: 1rem 0;">`);
																	Divider($$renderer, {});
																	$$renderer.push(`<!----></div> `);

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			gap: 'xs',
																			children: ($$renderer) => {
																				if (Typography.Text) {
																					$$renderer.push('<!--[-->');

																					Typography.Text($$renderer, {
																						variant: 'm-500',
																						color: '--fgcolor-neutral-primary',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Environment variables required`);
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

																								Badge($$renderer, { variant: 'secondary', content: envKey, size: 's' });
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
															} else {
																$$renderer.push('<!--[-1-->');

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
																										$$renderer.push(`<!---->Environment variables required`);
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

																										const each_array_1 = $.ensure_array_like(data.envKeys);

																										for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																											let envKey = each_array_1[$$index_1];

																											Badge($$renderer, { variant: 'secondary', content: envKey, size: 's' });
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

			$$renderer.push(`</div></section> <footer class="svelte-10d6qtw">`);

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
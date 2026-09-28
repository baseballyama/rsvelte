import * as $ from 'svelte/internal/server';
import { goto, invalidate } from '$app/navigation';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Card } from '$lib/components';
import { Button, Form } from '$lib/elements/forms';
import { Wizard } from '$lib/layout';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { installation, repository } from '$lib/stores/vcs';
import { Fieldset, Layout, Icon, Divider, Empty, Typography } from '@appwrite.io/pink-svelte';
import { IconGithub } from '@appwrite.io/pink-icons-svelte';
import { onMount, untrack } from 'svelte';
import { writable } from 'svelte/store';
import ProductionBranch from '$lib/components/git/productionBranchFieldset.svelte';
import Configuration from './configuration.svelte';
import { ID, Runtime, TemplateReferenceType } from '@appwrite.io/console';

import {
	ConnectBehaviour,
	NewRepository,
	Repositories,
	RepositoryBehaviour
} from '$lib/components/git';

import Details from '../(components)/details.svelte';
import Aside from '../(components)/aside.svelte';
import { iconPath } from '$lib/stores/app';
import Permissions from './permissions.svelte';
import { connectGitHub } from '$lib/stores/git';
import RepoCard from './repoCard.svelte';
import { Dependencies } from '$lib/constants';
import { getIconFromRuntime } from '$lib/stores/runtimes';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { validateVariables } from '$lib/helpers/variables';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;

		const specificationOptions = $.derived(() => (data.specificationsList?.specifications ?? []).map((size) => ({
			label: `${size.cpus} CPU, ${size.memory} MB RAM` + (!size.enabled ? ` (Upgrade to use this)` : ''),
			value: size.slug,
			disabled: !size.enabled
		})));

		let showExitModal = false;
		let isCreatingRepository = false;
		let formComponent = void 0;
		let isSubmitting = writable(false);
		let name = untrack(() => data.template.name);
		let id = null;
		let runtime = void 0;
		let branch = 'main';
		let rootDir = './';
		let connectBehaviour = 'now';
		let repositoryBehaviour = 'new';
		let repositoryName = void 0;
		let repositoryPrivate = true;
		let selectedInstallationId = '';
		let selectedRepository = '';
		let showConfig = false;
		let silentMode = false;
		let entrypoint = '';
		let selectedScopes = [];
		let execute = true;
		let variables = [];
		let specification = untrack(() => specificationOptions()[0]?.value || '');
		const availableRuntimes = $.derived(() => data.runtimesList.runtimes.filter((runtime) => data.template.runtimes.some((templateRuntime) => templateRuntime.name === runtime.$id)));

		function sortRuntimesByVersionDesc(a, b) {
			return b.version.localeCompare(a.version, undefined, { numeric: true });
		}

		function selectInitialRuntime() {
			const runtimeParam = page.url.searchParams.get('runtime');
			const requestedRuntime = availableRuntimes().find((runtime) => runtime.$id === runtimeParam);

			if (requestedRuntime) {
				return requestedRuntime.$id;
			}

			const runtimeById = new Map(data.runtimesList.runtimes.map((runtime) => [runtime.$id, runtime]));
			const preferredRuntime = data.template.runtimes.map((runtime) => runtimeById.get(runtime.name)).find(Boolean);

			const preferredRuntimes = preferredRuntime
				? availableRuntimes().filter((runtime) => runtime.key === preferredRuntime.key)
				: [];

			const runtimes = preferredRuntimes.length ? preferredRuntimes : availableRuntimes();

			return [...runtimes].sort(sortRuntimesByVersionDesc)[0]?.$id;
		}

		onMount(async () => {
			if (!$.store_get($$store_subs ??= {}, '$installation', installation)?.$id) {
				$.store_set(installation, data.installations.installations[0]);
			}

			selectedInstallationId = $.store_get($$store_subs ??= {}, '$installation', installation)?.$id;
			runtime = selectInitialRuntime();
		});

		async function createRepository() {
			try {
				isCreatingRepository = true;

				const repo = await sdk.forProject(page.params.region, page.params.project).vcs.createRepository({
					installationId: $.store_get($$store_subs ??= {}, '$installation', installation).$id,
					name: repositoryName,
					xprivate: repositoryPrivate
				});

				repository.set(repo);
				selectedRepository = repo.id;
				showConfig = true;
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
			} finally {
				isCreatingRepository = false;
			}
		}

		async function create() {
			if (connectBehaviour === 'now' && !selectedRepository) {
				addNotification({ type: 'error', message: 'Please select a repository' });

				return;
			} else {
				try {
					// Reject an unusable key before the resource is created, so a
					// rejected variable can't leave a half-configured resource behind.
					const validationError = validateVariables(variables.map((variable) => ({ key: variable.name, value: variable.value })));

					if (validationError) {
						throw new Error(validationError);
					}

					const rt = data.template.runtimes.find((r) => r.name === runtime);

					const func = await sdk.forProject(page.params.region, page.params.project).functions.create({
						functionId: id || ID.unique(),
						name,
						runtime,
						execute: execute && data.template.permissions?.length ? data.template.permissions : undefined,
						events: data.template.events?.length ? data.template.events : undefined,
						schedule: data.template.cron || undefined,
						timeout: data.template.timeout || undefined,
						entrypoint: entrypoint || rt?.entrypoint || undefined,
						commands: rt?.commands || undefined,
						scopes: selectedScopes?.length ? selectedScopes : undefined,
						installationId: connectBehaviour === 'later'
							? undefined
							: $.store_get($$store_subs ??= {}, '$installation', installation)?.$id,

						providerRepositoryId: connectBehaviour === 'later'
							? undefined
							: $.store_get($$store_subs ??= {}, '$repository', repository)?.id,
						providerBranch: branch,
						providerSilentMode: silentMode,
						providerRootDirectory: rootDir,
						buildSpecification: specification || undefined
					});

					// Add domain
					await sdk.forProject(page.params.region, page.params.project).proxy.createFunctionRule({
						domain: `${ID.unique()}.${$.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_FUNCTIONS}`,
						functionId: func.$id
					});

					// Add variables
					const promises = variables.map((variable) => sdk.forProject(page.params.region, page.params.project).functions.createVariable({
						functionId: func.$id,
						variableId: ID.unique(),
						key: variable.name,
						value: variable.value,
						secret: variable?.secret ?? false
					}));

					await Promise.all(promises);

					await sdk.forProject(page.params.region, page.params.project).functions.createTemplateDeployment({
						functionId: func.$id,
						repository: data.template.providerRepositoryId || undefined,
						owner: data.template.providerOwner || undefined,
						rootDirectory: rt?.providerRootDirectory || undefined,
						type: TemplateReferenceType.Tag,
						reference: data.template.providerVersion || undefined,
						activate: true
					});

					trackEvent(Submit.FunctionCreate, { runtime, source: 'template', framework: data.template.name });
					await goto(`${base}/project-${page.params.region}-${page.params.project}/functions/function-${func.$id}`);
					invalidate(Dependencies.FUNCTION);
				} catch(e) {
					addNotification({ type: 'error', message: e.message });
					trackError(e, Submit.FunctionCreate);
				}
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('vyqa6w', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Create function - Appwrite</title>`);
				});
			});

			Wizard($$renderer, {
				title: 'Create function',
				href: `${base}/project-${page.params.region}-${page.params.project}/functions`,
				confirmExit: true,
				get showExitModal() {
					return showExitModal;
				},

				set showExitModal($$value) {
					showExitModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Form($$renderer, {
						onSubmit: create,
						get isSubmitting() {
							return isSubmitting;
						},

						set isSubmitting($$value) {
							isSubmitting = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xl',
									children: ($$renderer) => {
										if (selectedRepository && showConfig) {
											$$renderer.push('<!--[0-->');

											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													gap: 'xxl',
													children: ($$renderer) => {
														RepoCard($$renderer, {
															get showConfig() {
																return showConfig;
															},

															set showConfig($$value) {
																showConfig = $$value;
																$$settled = false;
															}
														});

														$$renderer.push(`<!----> `);

														ProductionBranch($$renderer, {
															product: 'functions',
															installationId: selectedInstallationId,
															repositoryId: selectedRepository,
															get branch() {
																return branch;
															},

															set branch($$value) {
																branch = $$value;
																$$settled = false;
															},

															get rootDir() {
																return rootDir;
															},

															set rootDir($$value) {
																rootDir = $$value;
																$$settled = false;
															},

															get silentMode() {
																return silentMode;
															},

															set silentMode($$value) {
																silentMode = $$value;
																$$settled = false;
															}
														});

														$$renderer.push(`<!----> `);

														if (data.template.variables?.length) {
															$$renderer.push('<!--[0-->');

															Configuration($$renderer, {
																project: data.project,
																templateVariables: data.template.variables,
																get variables() {
																	return variables;
																},

																set variables($$value) {
																	variables = $$value;
																	$$settled = false;
																}
															});
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
										} else {
											$$renderer.push('<!--[-1-->');

											const options = availableRuntimes().map((runtime) => {
												return {
													value: runtime.$id,
													label: `${runtime.name} - ${runtime.version}`,
													leadingHtml: `<img src='${$.store_get($$store_subs ??= {}, '$iconPath', iconPath)(getIconFromRuntime(runtime.key) ?? 'empty', 'color')}' style='inline-size: var(--icon-size-m)' />`
												};
											});

											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													gap: 'xxl',
													children: ($$renderer) => {
														Details($$renderer, {
															specificationOptions: specificationOptions(),
															options,
															get name() {
																return name;
															},

															set name($$value) {
																name = $$value;
																$$settled = false;
															},

															get id() {
																return id;
															},

															set id($$value) {
																id = $$value;
																$$settled = false;
															},

															get runtime() {
																return runtime;
															},

															set runtime($$value) {
																runtime = $$value;
																$$settled = false;
															},

															get entrypoint() {
																return entrypoint;
															},

															set entrypoint($$value) {
																entrypoint = $$value;
																$$settled = false;
															},

															get specification() {
																return specification;
															},

															set specification($$value) {
																specification = $$value;
																$$settled = false;
															}
														});

														$$renderer.push(`<!----> `);

														Permissions($$renderer, {
															templateScopes: data.template.scopes,
															get selectedScopes() {
																return selectedScopes;
															},

															set selectedScopes($$value) {
																selectedScopes = $$value;
																$$settled = false;
															},

															get execute() {
																return execute;
															},

															set execute($$value) {
																execute = $$value;
																$$settled = false;
															}
														});

														$$renderer.push(`<!----> `);

														ConnectBehaviour($$renderer, {
															get connectBehaviour() {
																return connectBehaviour;
															},

															set connectBehaviour($$value) {
																connectBehaviour = $$value;
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

											if (connectBehaviour === 'now') {
												$$renderer.push('<!--[0-->');

												if (!!data?.installations?.total) {
													$$renderer.push('<!--[0-->');

													Fieldset($$renderer, {
														legend: 'Git repository',
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 'xl',
																	children: ($$renderer) => {
																		RepositoryBehaviour($$renderer, {
																			get repositoryBehaviour() {
																				return repositoryBehaviour;
																			},

																			set repositoryBehaviour($$value) {
																				repositoryBehaviour = $$value;
																				$$settled = false;
																			}
																		});

																		$$renderer.push(`<!----> `);

																		if (repositoryBehaviour === 'new') {
																			$$renderer.push('<!--[0-->');

																			NewRepository($$renderer, {
																				disableFields: isCreatingRepository,
																				installations: data.installations,
																				get selectedInstallationId() {
																					return selectedInstallationId;
																				},

																				set selectedInstallationId($$value) {
																					selectedInstallationId = $$value;
																					$$settled = false;
																				},

																				get repositoryName() {
																					return repositoryName;
																				},

																				set repositoryName($$value) {
																					repositoryName = $$value;
																					$$settled = false;
																				},

																				get repositoryPrivate() {
																					return repositoryPrivate;
																				},

																				set repositoryPrivate($$value) {
																					repositoryPrivate = $$value;
																					$$settled = false;
																				}
																			});

																			$$renderer.push(`<!----> `);

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					gap: 'xl',
																					alignItems: 'flex-end',
																					children: ($$renderer) => {
																						Divider($$renderer, {});
																						$$renderer.push(`<!----> `);

																						Button($$renderer, {
																							size: 's',
																							forceShowLoader: true,
																							submissionLoader: isCreatingRepository,
																							disabled: !repositoryName || !$.store_get($$store_subs ??= {}, '$installation', installation)?.$id || isCreatingRepository,
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Create`);
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
																		} else {
																			$$renderer.push('<!--[-1-->');

																			Repositories($$renderer, {
																				action: 'button',
																				connect: (e) => {
																					trackEvent(Click.ConnectRepositoryClick, { from: 'template-wizard' });
																					repository.set(e);
																					repositoryName = e.name;
																					selectedRepository = e.id;
																					showConfig = true;
																				},

																				get selectedRepository() {
																					return selectedRepository;
																				},

																				set selectedRepository($$value) {
																					selectedRepository = $$value;
																					$$settled = false;
																				}
																			});
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
												} else {
													$$renderer.push('<!--[-1-->');

													Card($$renderer, {
														isDashed: true,
														padding: 'none',
														children: ($$renderer) => {
															Empty($$renderer, {
																type: 'secondary',
																title: 'Connect Git repository',
																description: 'Create and deploy a Site with a connected git repository.',
																$$slots: {
																	actions: ($$renderer) => {
																		{
																			Button($$renderer, {
																				secondary: true,
																				href: connectGitHub().toString(),
																				size: 's',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Connect to GitHub`);
																				},

																				$$slots: {
																					default: true,
																					start: ($$renderer) => {
																						Icon($$renderer, { icon: IconGithub, slot: 'start' });
																					}
																				}
																			});
																		}
																	}
																}
															});
														},
														$$slots: { default: true }
													});
												}

												$$renderer.push(`<!--]-->`);
											} else if (data.template.variables?.length) {
												$$renderer.push('<!--[1-->');

												Configuration($$renderer, {
													project: data.project,
													templateVariables: data.template.variables,
													get variables() {
														return variables;
													},

													set variables($$value) {
														variables = $$value;
														$$settled = false;
													}
												});
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
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
				},

				$$slots: {
					default: true,
					aside: ($$renderer) => {
						{
							Aside($$renderer, {
								runtime,
								repositoryName,
								branch,
								rootDir,
								runtimes: data.runtimesList,
								get showGitData() {
									return showConfig;
								},

								set showGitData($$value) {
									showConfig = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'xxxs',
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
								},
								$$slots: { default: true }
							});
						}
					},

					footer: ($$renderer) => {
						{
							Button($$renderer, {
								fullWidthMobile: true,
								size: 's',
								secondary: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								fullWidthMobile: true,
								size: 's',
								disabled: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting) || connectBehaviour === 'now' && !selectedRepository,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Deploy`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				}
			});
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
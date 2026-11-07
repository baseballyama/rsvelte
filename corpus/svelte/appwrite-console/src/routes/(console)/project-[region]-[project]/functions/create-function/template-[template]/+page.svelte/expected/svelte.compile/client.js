import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $installation = () => $.store_get(installation, '$installation', $$stores);
	const $repository = () => $.store_get(repository, '$repository', $$stores);
	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const $iconPath = () => $.store_get(iconPath, '$iconPath', $$stores);
	const $isSubmitting = () => $.store_get($.get(isSubmitting), '$isSubmitting', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const specificationOptions = $.derived(() => ($$props.data.specificationsList?.specifications ?? []).map((size) => ({
		label: `${size.cpus} CPU, ${size.memory} MB RAM` + (!size.enabled ? ` (Upgrade to use this)` : ''),
		value: size.slug,
		disabled: !size.enabled
	})));

	let showExitModal = $.state(false);
	let isCreatingRepository = $.state(false);
	let formComponent = $.state(void 0);
	let isSubmitting = $.state($.proxy(writable(false)));
	let name = $.state($.proxy(untrack(() => $$props.data.template.name)));
	let id = $.state(null);
	let runtime = $.state(void 0);
	let branch = $.state('main');
	let rootDir = $.state('./');
	let connectBehaviour = $.state('now');
	let repositoryBehaviour = $.state('new');
	let repositoryName = $.state(void 0);
	let repositoryPrivate = $.state(true);
	let selectedInstallationId = $.state('');
	let selectedRepository = $.state('');
	let showConfig = $.state(false);
	let silentMode = $.state(false);
	let entrypoint = $.state('');
	let selectedScopes = $.state($.proxy([]));
	let execute = $.state(true);
	let variables = $.state($.proxy([]));
	let specification = $.state($.proxy(untrack(() => $.get(specificationOptions)[0]?.value || '')));
	const availableRuntimes = $.derived(() => $$props.data.runtimesList.runtimes.filter((runtime) => $$props.data.template.runtimes.some((templateRuntime) => templateRuntime.name === runtime.$id)));

	function sortRuntimesByVersionDesc(a, b) {
		return b.version.localeCompare(a.version, undefined, { numeric: true });
	}

	function selectInitialRuntime() {
		const runtimeParam = page.url.searchParams.get('runtime');
		const requestedRuntime = $.get(availableRuntimes).find((runtime) => runtime.$id === runtimeParam);

		if (requestedRuntime) {
			return requestedRuntime.$id;
		}

		const runtimeById = new Map($$props.data.runtimesList.runtimes.map((runtime) => [runtime.$id, runtime]));
		const preferredRuntime = $$props.data.template.runtimes.map((runtime) => runtimeById.get(runtime.name)).find(Boolean);

		const preferredRuntimes = preferredRuntime
			? $.get(availableRuntimes).filter((runtime) => runtime.key === preferredRuntime.key)
			: [];

		const runtimes = preferredRuntimes.length ? preferredRuntimes : $.get(availableRuntimes);

		return [...runtimes].sort(sortRuntimesByVersionDesc)[0]?.$id;
	}

	onMount(async () => {
		if (!$installation()?.$id) {
			$.store_set(installation, $$props.data.installations.installations[0]);
		}

		$.set(selectedInstallationId, $installation()?.$id, true);
		$.set(runtime, selectInitialRuntime(), true);
	});

	async function createRepository() {
		try {
			$.set(isCreatingRepository, true);

			const repo = await sdk.forProject(page.params.region, page.params.project).vcs.createRepository({
				installationId: $installation().$id,
				name: $.get(repositoryName),
				xprivate: $.get(repositoryPrivate)
			});

			repository.set(repo);
			$.set(selectedRepository, repo.id, true);
			$.set(showConfig, true);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
		} finally {
			$.set(isCreatingRepository, false);
		}
	}

	async function create() {
		if ($.get(connectBehaviour) === 'now' && !$.get(selectedRepository)) {
			addNotification({ type: 'error', message: 'Please select a repository' });

			return;
		} else {
			try {
				// Reject an unusable key before the resource is created, so a
				// rejected variable can't leave a half-configured resource behind.
				const validationError = validateVariables($.get(variables).map((variable) => ({ key: variable.name, value: variable.value })));

				if (validationError) {
					throw new Error(validationError);
				}

				const rt = $$props.data.template.runtimes.find((r) => r.name === $.get(runtime));

				const func = await sdk.forProject(page.params.region, page.params.project).functions.create({
					functionId: $.get(id) || ID.unique(),
					name: $.get(name),
					runtime: $.get(runtime),
					execute: $.get(execute) && $$props.data.template.permissions?.length ? $$props.data.template.permissions : undefined,
					events: $$props.data.template.events?.length ? $$props.data.template.events : undefined,
					schedule: $$props.data.template.cron || undefined,
					timeout: $$props.data.template.timeout || undefined,
					entrypoint: $.get(entrypoint) || rt?.entrypoint || undefined,
					commands: rt?.commands || undefined,
					scopes: $.get(selectedScopes)?.length ? $.get(selectedScopes) : undefined,
					installationId: $.get(connectBehaviour) === 'later' ? undefined : $installation()?.$id,
					providerRepositoryId: $.get(connectBehaviour) === 'later' ? undefined : $repository()?.id,
					providerBranch: $.get(branch),
					providerSilentMode: $.get(silentMode),
					providerRootDirectory: $.get(rootDir),
					buildSpecification: $.get(specification) || undefined
				});

				// Add domain
				await sdk.forProject(page.params.region, page.params.project).proxy.createFunctionRule({
					domain: `${ID.unique()}.${$regionalConsoleVariables()._APP_DOMAIN_FUNCTIONS}`,
					functionId: func.$id
				});

				// Add variables
				const promises = $.get(variables).map((variable) => sdk.forProject(page.params.region, page.params.project).functions.createVariable({
					functionId: func.$id,
					variableId: ID.unique(),
					key: variable.name,
					value: variable.value,
					secret: variable?.secret ?? false
				}));

				await Promise.all(promises);

				await sdk.forProject(page.params.region, page.params.project).functions.createTemplateDeployment({
					functionId: func.$id,
					repository: $$props.data.template.providerRepositoryId || undefined,
					owner: $$props.data.template.providerOwner || undefined,
					rootDirectory: rt?.providerRootDirectory || undefined,
					type: TemplateReferenceType.Tag,
					reference: $$props.data.template.providerVersion || undefined,
					activate: true
				});

				trackEvent(Submit.FunctionCreate, {
					runtime: $.get(runtime),
					source: 'template',
					framework: $$props.data.template.name
				});

				await goto(`${base}/project-${page.params.region}-${page.params.project}/functions/function-${func.$id}`);
				invalidate(Dependencies.FUNCTION);
			} catch(e) {
				addNotification({ type: 'error', message: e.message });
				trackError(e, Submit.FunctionCreate);
			}
		}
	}

	$.user_effect(() => {
		if ($.get(repositoryBehaviour) === 'new') {
			$.set(selectedInstallationId, $.get(selectedInstallationId) ?? $installation()?.$id, true);
			$.set(repositoryName, $.get(repositoryName) ?? $.get(name).split(' ').join('-').toLowerCase(), true);
		}
	});

	$.user_effect(() => {
		if ($.get(connectBehaviour) === 'later') {
			$.set(selectedRepository, null);
		}
	});

	$.head('vyqa6w', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Create function - Appwrite';
		});
	});

	{
		let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/functions`);

		Wizard($$anchor, {
			title: 'Create function',
			get href() {
				return $.get($0);
			},
			confirmExit: true,
			get showExitModal() {
				return $.get(showExitModal);
			},

			set showExitModal($$value) {
				$.set(showExitModal, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				$.bind_this(
					Form($$anchor, {
						onSubmit: create,
						get isSubmitting() {
							return $.get(isSubmitting);
						},

						set isSubmitting($$value) {
							$.store_unsub($.set(isSubmitting, $$value, true), '$isSubmitting', $$stores);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node = $.first_child(fragment_2);

							$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
								Layout_Stack($$anchor, {
									gap: 'xl',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_1 = $.first_child(fragment_3);

										{
											var consequent_1 = ($$anchor) => {
												var fragment_4 = $.comment();
												var node_2 = $.first_child(fragment_4);

												$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
													Layout_Stack_1($$anchor, {
														gap: 'xxl',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_3 = $.first_child(fragment_5);

															RepoCard(node_3, {
																get showConfig() {
																	return $.get(showConfig);
																},

																set showConfig($$value) {
																	$.set(showConfig, $$value, true);
																}
															});

															var node_4 = $.sibling(node_3, 2);

															ProductionBranch(node_4, {
																product: 'functions',
																get installationId() {
																	return $.get(selectedInstallationId);
																},

																get repositoryId() {
																	return $.get(selectedRepository);
																},

																get branch() {
																	return $.get(branch);
																},

																set branch($$value) {
																	$.set(branch, $$value, true);
																},

																get rootDir() {
																	return $.get(rootDir);
																},

																set rootDir($$value) {
																	$.set(rootDir, $$value, true);
																},

																get silentMode() {
																	return $.get(silentMode);
																},

																set silentMode($$value) {
																	$.set(silentMode, $$value, true);
																}
															});

															var node_5 = $.sibling(node_4, 2);

															{
																var consequent = ($$anchor) => {
																	Configuration($$anchor, {
																		get project() {
																			return $$props.data.project;
																		},

																		get templateVariables() {
																			return $$props.data.template.variables;
																		},

																		get variables() {
																			return $.get(variables);
																		},

																		set variables($$value) {
																			$.set(variables, $$value, true);
																		}
																	});
																};

																$.if(node_5, ($$render) => {
																	if ($$props.data.template.variables?.length) $$render(consequent);
																});
															}

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											};

											var alternate_2 = ($$anchor) => {
												const options = $.derived(() => $.get(availableRuntimes).map((runtime) => {
													return {
														value: runtime.$id,
														label: `${runtime.name} - ${runtime.version}`,
														leadingHtml: `<img src='${$iconPath()(getIconFromRuntime(runtime.key) ?? 'empty', 'color')}' style='inline-size: var(--icon-size-m)' />`
													};
												}));

												var fragment_7 = root_1();
												var node_6 = $.first_child(fragment_7);

												$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
													Layout_Stack_2($$anchor, {
														gap: 'xxl',
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root();
															var node_7 = $.first_child(fragment_8);

															Details(node_7, {
																get specificationOptions() {
																	return $.get(specificationOptions);
																},

																get options() {
																	return $.get(options);
																},

																get name() {
																	return $.get(name);
																},

																set name($$value) {
																	$.set(name, $$value, true);
																},

																get id() {
																	return $.get(id);
																},

																set id($$value) {
																	$.set(id, $$value, true);
																},

																get runtime() {
																	return $.get(runtime);
																},

																set runtime($$value) {
																	$.set(runtime, $$value, true);
																},

																get entrypoint() {
																	return $.get(entrypoint);
																},

																set entrypoint($$value) {
																	$.set(entrypoint, $$value, true);
																},

																get specification() {
																	return $.get(specification);
																},

																set specification($$value) {
																	$.set(specification, $$value, true);
																}
															});

															var node_8 = $.sibling(node_7, 2);

															Permissions(node_8, {
																get templateScopes() {
																	return $$props.data.template.scopes;
																},

																get selectedScopes() {
																	return $.get(selectedScopes);
																},

																set selectedScopes($$value) {
																	$.set(selectedScopes, $$value, true);
																},

																get execute() {
																	return $.get(execute);
																},

																set execute($$value) {
																	$.set(execute, $$value, true);
																}
															});

															var node_9 = $.sibling(node_8, 2);

															ConnectBehaviour(node_9, {
																get connectBehaviour() {
																	return $.get(connectBehaviour);
																},

																set connectBehaviour($$value) {
																	$.set(connectBehaviour, $$value, true);
																}
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_6, 2);

												{
													var consequent_4 = ($$anchor) => {
														var fragment_9 = $.comment();
														var node_11 = $.first_child(fragment_9);

														{
															var consequent_3 = ($$anchor) => {
																Fieldset($$anchor, {
																	legend: 'Git repository',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_11 = $.comment();
																		var node_12 = $.first_child(fragment_11);

																		$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																			Layout_Stack_3($$anchor, {
																				gap: 'xl',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_12 = root_1();
																					var node_13 = $.first_child(fragment_12);

																					RepositoryBehaviour(node_13, {
																						get repositoryBehaviour() {
																							return $.get(repositoryBehaviour);
																						},

																						set repositoryBehaviour($$value) {
																							$.set(repositoryBehaviour, $$value, true);
																						}
																					});

																					var node_14 = $.sibling(node_13, 2);

																					{
																						var consequent_2 = ($$anchor) => {
																							var fragment_13 = root_1();
																							var node_15 = $.first_child(fragment_13);

																							NewRepository(node_15, {
																								get disableFields() {
																									return $.get(isCreatingRepository);
																								},

																								get installations() {
																									return $$props.data.installations;
																								},

																								get selectedInstallationId() {
																									return $.get(selectedInstallationId);
																								},

																								set selectedInstallationId($$value) {
																									$.set(selectedInstallationId, $$value, true);
																								},

																								get repositoryName() {
																									return $.get(repositoryName);
																								},

																								set repositoryName($$value) {
																									$.set(repositoryName, $$value, true);
																								},

																								get repositoryPrivate() {
																									return $.get(repositoryPrivate);
																								},

																								set repositoryPrivate($$value) {
																									$.set(repositoryPrivate, $$value, true);
																								}
																							});

																							var node_16 = $.sibling(node_15, 2);

																							$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																								Layout_Stack_4($$anchor, {
																									gap: 'xl',
																									alignItems: 'flex-end',
																									children: ($$anchor, $$slotProps) => {
																										var fragment_14 = root_1();
																										var node_17 = $.first_child(fragment_14);

																										Divider(node_17, {});

																										var node_18 = $.sibling(node_17, 2);

																										{
																											let $0 = $.derived(() => !$.get(repositoryName) || !$installation()?.$id || $.get(isCreatingRepository));

																											Button(node_18, {
																												size: 's',
																												forceShowLoader: true,
																												get submissionLoader() {
																													return $.get(isCreatingRepository);
																												},

																												get disabled() {
																													return $.get($0);
																												},
																												$$events: { click: createRepository },
																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text = $.text('Create');

																													$.append($$anchor, text);
																												},
																												$$slots: { default: true }
																											});
																										}

																										$.append($$anchor, fragment_14);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_13);
																						};

																						var alternate = ($$anchor) => {
																							Repositories($$anchor, {
																								action: 'button',
																								connect: (e) => {
																									trackEvent(Click.ConnectRepositoryClick, { from: 'template-wizard' });
																									repository.set(e);
																									$.set(repositoryName, e.name, true);
																									$.set(selectedRepository, e.id, true);
																									$.set(showConfig, true);
																								},

																								get selectedRepository() {
																									return $.get(selectedRepository);
																								},

																								set selectedRepository($$value) {
																									$.set(selectedRepository, $$value, true);
																								}
																							});
																						};

																						$.if(node_14, ($$render) => {
																							if ($.get(repositoryBehaviour) === 'new') $$render(consequent_2); else $$render(alternate, -1);
																						});
																					}

																					$.append($$anchor, fragment_12);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_11);
																	},
																	$$slots: { default: true }
																});
															};

															var alternate_1 = ($$anchor) => {
																Card($$anchor, {
																	isDashed: true,
																	padding: 'none',
																	children: ($$anchor, $$slotProps) => {
																		Empty($$anchor, {
																			type: 'secondary',
																			title: 'Connect Git repository',
																			description: 'Create and deploy a Site with a connected git repository.',
																			$$slots: {
																				actions: ($$anchor, $$slotProps) => {
																					{
																						let $0 = $.derived(() => connectGitHub().toString());

																						Button($$anchor, {
																							secondary: true,
																							get href() {
																								return $.get($0);
																							},
																							size: 's',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_1 = $.text('Connect to GitHub');

																								$.append($$anchor, text_1);
																							},

																							$$slots: {
																								default: true,
																								start: ($$anchor, $$slotProps) => {
																									Icon($$anchor, {
																										get icon() {
																											return IconGithub;
																										},
																										slot: 'start'
																									});
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
															};

															$.if(node_11, ($$render) => {
																if (!!$$props.data?.installations?.total) $$render(consequent_3); else $$render(alternate_1, -1);
															});
														}

														$.append($$anchor, fragment_9);
													};

													var consequent_5 = ($$anchor) => {
														Configuration($$anchor, {
															get project() {
																return $$props.data.project;
															},

															get templateVariables() {
																return $$props.data.template.variables;
															},

															get variables() {
																return $.get(variables);
															},

															set variables($$value) {
																$.set(variables, $$value, true);
															}
														});
													};

													$.if(node_10, ($$render) => {
														if ($.get(connectBehaviour) === 'now') $$render(consequent_4); else if ($$props.data.template.variables?.length) $$render(consequent_5, 1);
													});
												}

												$.append($$anchor, fragment_7);
											};

											$.if(node_1, ($$render) => {
												if ($.get(selectedRepository) && $.get(showConfig)) $$render(consequent_1); else $$render(alternate_2, -1);
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					}),
					($$value) => $.set(formComponent, $$value, true),
					() => $.get(formComponent)
				);
			},

			$$slots: {
				default: true,
				aside: ($$anchor, $$slotProps) => {
					Aside($$anchor, {
						get runtime() {
							return $.get(runtime);
						},

						get repositoryName() {
							return $.get(repositoryName);
						},

						get branch() {
							return $.get(branch);
						},

						get rootDir() {
							return $.get(rootDir);
						},

						get runtimes() {
							return $$props.data.runtimesList;
						},

						get showGitData() {
							return $.get(showConfig);
						},

						set showGitData($$value) {
							$.set(showConfig, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_22 = $.comment();
							var node_19 = $.first_child(fragment_22);

							$.component(node_19, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
								Layout_Stack_5($$anchor, {
									gap: 'xxxs',
									children: ($$anchor, $$slotProps) => {
										var fragment_23 = root_1();
										var node_20 = $.first_child(fragment_23);

										$.component(node_20, () => Typography.Text, ($$anchor, Typography_Text) => {
											Typography_Text($$anchor, {
												variant: 'm-500',
												color: '--fgcolor-neutral-primary',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text();

													$.template_effect(() => $.set_text(text_2, $$props.data.template.name));
													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_21 = $.sibling(node_20, 2);

										$.component(node_21, () => Typography.Text, ($$anchor, Typography_Text_1) => {
											Typography_Text_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text();

													$.template_effect(() => $.set_text(text_3, $$props.data.template.tagline));
													$.append($$anchor, text_3);
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
						},
						$$slots: { default: true }
					});
				},

				footer: ($$anchor, $$slotProps) => {
					var fragment_26 = root_1();
					var node_22 = $.first_child(fragment_26);

					Button(node_22, {
						fullWidthMobile: true,
						size: 's',
						secondary: true,
						$$events: { click: () => $.set(showExitModal, true) },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Cancel');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_23 = $.sibling(node_22, 2);

					{
						let $0 = $.derived(() => $isSubmitting() || $.get(connectBehaviour) === 'now' && !$.get(selectedRepository));

						Button(node_23, {
							fullWidthMobile: true,
							size: 's',
							get disabled() {
								return $.get($0);
							},

							$$events: {
								click: () => {
									if ($.get(variables).filter((v) => v.required && !v.value).length) {
										addNotification({
											type: 'error',
											message: 'Missing required environment variables. Please update and try again.'
										});
									} else {
										$.get(formComponent).triggerSubmit();
									}
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Deploy');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_26);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}
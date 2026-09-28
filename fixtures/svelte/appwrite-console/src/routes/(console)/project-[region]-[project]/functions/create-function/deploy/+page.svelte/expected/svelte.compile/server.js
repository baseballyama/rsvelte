import * as $ from 'svelte/internal/server';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Card } from '$lib/components';
import { Button, Form } from '$lib/elements/forms';
import { Wizard } from '$lib/layout';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Fieldset, Layout, Icon, Input, Tag } from '@appwrite.io/pink-svelte';
import { IconGithub, IconPencil } from '@appwrite.io/pink-icons-svelte';
import { onMount } from 'svelte';
import { ID, Runtime, TemplateReferenceType } from '@appwrite.io/console';
import { CustomId } from '$lib/components';
import { getIconFromRuntime } from '$lib/stores/runtimes';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { iconPath } from '$lib/stores/app';
import { getLatestTag } from '$lib/helpers/github';
import { writable } from 'svelte/store';
import Link from '$lib/elements/link.svelte';
import { validateVariables } from '$lib/helpers/variables';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let showExitModal = false;
		let showCustomId = false;
		let isSubmitting = writable(false);
		let id = ID.unique();
		let name = data.repository.name;
		let execute = true;
		let entrypoint = '';
		let specification = '';
		let runtime = void 0;
		let installCommand = '';
		let selectedScopes = [];
		let rootDir = data.repository?.rootDirectory;
		let variables = [];
		let latestTag = null;

		const specificationOptions = $.derived(() => data.specificationsList?.specifications?.map((size) => ({
			label: `${size.cpus} CPU, ${size.memory} MB RAM` + (!size.enabled ? ` (Upgrade to use this)` : ''),
			value: size.slug,
			disabled: !size.enabled
		})) || []);

		const runtimeOptions = $.derived(() => data.runtimesList?.runtimes?.map((r) => ({
			value: r.$id,
			label: `${r.name} - ${r.version}`,
			leadingHtml: `<img src='${$.store_get($$store_subs ??= {}, '$iconPath', iconPath)(getIconFromRuntime(r.key) ?? 'empty', 'color')}' style='inline-size: var(--icon-size-m)' />`
		})) || []);

		onMount(() => {
			const runtimeParam = data.runtime || page.url.searchParams.get('runtime');
			const runtimeOption = data.runtimesList.runtimes.find((runtime) => runtime.$id === runtimeParam);

			runtime = runtimeOption?.$id ?? data.runtimesList.runtimes[0]?.$id;
			entrypoint = page.url.searchParams.get('entrypoint') || '';
			installCommand = page.url.searchParams.get('install') || '';
			rootDir = page.url.searchParams.get('rootDir') || data.repository?.rootDirectory || './';

			if (specificationOptions().length > 0) {
				specification = specificationOptions()[0].value;
			}

			if (data.envKeys.length > 0) {
				variables = data.envKeys.map((key) => ({ key, value: '', secret: false }));
			}

			getLatestTag(data.repository.owner, data.repository.name).then((tagName) => latestTag = tagName);
		});

		async function create() {
			$.store_set(isSubmitting, true);

			try {
				// Reject an unusable key before the resource is created, so a
				// rejected variable can't leave a half-configured resource behind.
				const validationError = validateVariables(variables);

				if (validationError) {
					throw new Error(validationError);
				}

				if (!latestTag) {
					latestTag = await getLatestTag(data.repository.owner, data.repository.name);
				}

				// Create function with configuration
				const func = await sdk.forProject(page.params.region, page.params.project).functions.create({
					functionId: id || ID.unique(),
					name,
					runtime,
					execute: execute ? ['any'] : undefined,
					entrypoint: entrypoint || undefined,
					commands: installCommand || undefined,
					scopes: selectedScopes?.length ? selectedScopes : undefined,
					providerSilentMode: false,
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
					key: variable.key,
					value: variable.value,
					secret: variable.secret
				}));

				await Promise.all(promises);

				// Create deployment from GitHub repository using the latest tag
				await sdk.forProject(page.params.region, page.params.project).functions.createTemplateDeployment({
					functionId: func.$id,
					repository: data.repository.name,
					owner: data.repository.owner,
					rootDirectory: rootDir || '.',
					type: TemplateReferenceType.Tag,
					reference: latestTag ?? '1.0.0',
					activate: true
				});

				trackEvent(Submit.FunctionCreate, {
					source: 'deploy-button',
					runtime,
					repository: data.repository.url
				});

				await goto(`${base}/project-${page.params.region}-${page.params.project}/functions/function-${func.$id}`);
			} catch(e) {
				addNotification({ type: 'error', message: e.message });
				trackError(e, Submit.FunctionCreate);
			} finally {
				$.store_set(isSubmitting, false);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('1mr211w', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Deploy ${$.escape(data.repository.name)} - Appwrite</title>`);
				});
			});

			Wizard($$renderer, {
				title: 'Deploy function',
				columnSize: 's',
				column: true,
				href: `${base}/project-${page.params.region}-${page.params.project}/functions/`,
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
						isSubmitting,
						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xl',
									children: ($$renderer) => {
										Card($$renderer, {
											padding: 's',
											radius: 's',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														alignItems: 'center',
														gap: 's',
														children: ($$renderer) => {
															Icon($$renderer, { icon: IconGithub });
															$$renderer.push(`<!----> `);

															Link($$renderer, {
																variant: 'quiet',
																href: data.repository.url,
																size: 'm',
																external: true,
																icon: true,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(data.repository.owner)}/${$.escape(data.repository.name)}`);
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

										$$renderer.push(`<!----> `);

										Fieldset($$renderer, {
											legend: 'Details',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 'l',
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 's',
																	children: ($$renderer) => {
																		if (Input.Text) {
																			$$renderer.push('<!--[-->');

																			Input.Text($$renderer, {
																				label: 'Name',
																				id: 'name',
																				name: 'name',
																				required: true,
																				placeholder: 'Enter name',
																				get value() {
																					return name;
																				},

																				set value($$value) {
																					name = $$value;
																					$$settled = false;
																				}
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (showCustomId) {
																			$$renderer.push('<!--[0-->');

																			CustomId($$renderer, {
																				name: 'Function',
																				get id() {
																					return id;
																				},

																				set id($$value) {
																					id = $$value;
																					$$settled = false;
																				},

																				get show() {
																					return showCustomId;
																				},

																				set show($$value) {
																					showCustomId = $$value;
																					$$settled = false;
																				}
																			});
																		} else {
																			$$renderer.push(`<!--[-1--><div>`);

																			Tag($$renderer, {
																				size: 's',
																				onclick: () => showCustomId = !showCustomId,
																				children: ($$renderer) => {
																					Icon($$renderer, { icon: IconPencil, size: 's' });
																					$$renderer.push(`<!----> Function ID`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!----></div>`);
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

															if (Input.Select) {
																$$renderer.push('<!--[-->');

																Input.Select($$renderer, {
																	id: 'runtime',
																	label: 'Runtime',
																	placeholder: 'Select runtime',
																	required: true,
																	options: runtimeOptions(),
																	get value() {
																		return runtime;
																	},

																	set value($$value) {
																		runtime = $$value;
																		$$settled = false;
																	}
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Input.Select) {
																$$renderer.push('<!--[-->');

																Input.Select($$renderer, {
																	id: 'specification',
																	label: 'Specification',
																	placeholder: 'Select specification',
																	required: true,
																	options: specificationOptions(),
																	get value() {
																		return specification;
																	},

																	set value($$value) {
																		specification = $$value;
																		$$settled = false;
																	}
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

										$$renderer.push(`<!----> `);

										Fieldset($$renderer, {
											legend: 'Build configuration',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 'm',
														children: ($$renderer) => {
															if (Input.Text) {
																$$renderer.push('<!--[-->');

																Input.Text($$renderer, {
																	label: 'Root directory',
																	id: 'rootDir',
																	name: 'rootDir',
																	placeholder: './',
																	get value() {
																		return rootDir;
																	},

																	set value($$value) {
																		rootDir = $$value;
																		$$settled = false;
																	}
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Input.Text) {
																$$renderer.push('<!--[-->');

																Input.Text($$renderer, {
																	label: 'Entrypoint',
																	id: 'entrypoint',
																	name: 'entrypoint',
																	placeholder: 'e.g., index.js, main.py',
																	get value() {
																		return entrypoint;
																	},

																	set value($$value) {
																		entrypoint = $$value;
																		$$settled = false;
																	}
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Input.Text) {
																$$renderer.push('<!--[-->');

																Input.Text($$renderer, {
																	label: 'Install command',
																	id: 'installCommand',
																	name: 'installCommand',
																	placeholder: 'e.g., npm install',
																	get value() {
																		return installCommand;
																	},

																	set value($$value) {
																		installCommand = $$value;
																		$$settled = false;
																	}
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

										$$renderer.push(`<!----> `);

										if (data.envKeys.length > 0) {
											$$renderer.push('<!--[0-->');

											Fieldset($$renderer, {
												legend: 'Environment variables',
												children: ($$renderer) => {
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 'm',
															children: ($$renderer) => {
																$$renderer.push(`<!--[-->`);

																const each_array = $.ensure_array_like(variables);

																for (let i = 0, $$length = each_array.length; i < $$length; i++) {
																	let variable = each_array[i];

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			gap: 's',
																			alignItems: 'flex-end',
																			children: ($$renderer) => {
																				if (Input.Text) {
																					$$renderer.push('<!--[-->');

																					Input.Text($$renderer, {
																						label: i === 0 ? 'Key' : null,
																						value: variable.key,
																						readonly: true,
																						style: 'flex: 1'
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Input.Text) {
																					$$renderer.push('<!--[-->');

																					Input.Text($$renderer, {
																						label: i === 0 ? 'Value' : null,
																						placeholder: 'Enter value',
																						required: true,
																						style: 'flex: 2',
																						get value() {
																							return variable.value;
																						},

																						set value($$value) {
																							variable.value = $$value;
																							$$settled = false;
																						}
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
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												justifyContent: 'space-between',
												children: ($$renderer) => {
													Button($$renderer, {
														secondary: true,
														href: `${base}/project-${page.params.region}-${page.params.project}/functions`,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Button($$renderer, {
														submit: true,
														fullWidthMobile: true,
														submissionLoader: true,
														forceShowLoader: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting),
														disabled: !name || !runtime || !specification || $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Deploy function`);
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
				},
				$$slots: { default: true }
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
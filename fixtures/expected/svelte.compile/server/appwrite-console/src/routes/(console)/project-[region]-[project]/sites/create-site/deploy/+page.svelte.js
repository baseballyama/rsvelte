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
import { Fieldset, Layout, Icon, Typography, Input, Tag } from '@appwrite.io/pink-svelte';
import { IconGithub, IconPencil } from '@appwrite.io/pink-icons-svelte';
import { onMount } from 'svelte';
import Domain from '../domain.svelte';
import { Adapter, BuildRuntime, Framework, ID, TemplateReferenceType } from '@appwrite.io/console';
import { CustomId } from '$lib/components';
import { getFrameworkIcon } from '$lib/stores/sites';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { iconPath } from '$lib/stores/app';
import { writable } from 'svelte/store';
import { getLatestTag } from '$lib/helpers/github';
import Link from '$lib/elements/link.svelte';
import { validateVariables } from '$lib/helpers/variables';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let showCustomId = false;
		let showExitModal = false;
		let formComponent = void 0;
		let isSubmitting = writable(false);
		let id = ID.unique();
		let name = data.repository?.name || '';
		let domain = '';
		let rootDir = data.repository?.rootDirectory || '';
		let buildCommand = '';
		let startCommand = '';
		let installCommand = '';
		let outputDirectory = '';
		let domainIsValid = false;
		let framework = Framework.Nextjs;
		let variables = [];

		// Track if we have custom commands from URL
		let hasCustomCommands = false;

		// Framework options - dynamically generate from enum
		const frameworkOptions = $.derived(() => Object.values(Framework).map((fw) => ({
			key: fw,
			name: fw === Framework.Nextjs
				? 'Next.js'
				: fw === Framework.Sveltekit
					? 'SvelteKit'
					: fw.charAt(0).toUpperCase() + fw.slice(1),
			buildRuntime: fw === Framework.Other ? BuildRuntime.Static1 : BuildRuntime.Node210
		})));

		const selectedFramework = $.derived(() => frameworkOptions().find((f) => f.key === framework) || frameworkOptions()[0]);

		const frameworkSelectOptions = $.derived(() => frameworkOptions().map((fw) => ({
			value: fw.key,
			label: fw.name,
			leadingHtml: `<img src='${$.store_get($$store_subs ??= {}, '$iconPath', iconPath)(getFrameworkIcon(fw.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
		})));

		const primaryAdapter = $.derived(() => data.frameworks.frameworks.find((f) => f.key === framework)?.adapters?.[0]);
		const shouldShowStartCommand = $.derived(() => primaryAdapter()?.key === Adapter.Ssr);

		onMount(() => {
			const preset = page.url.searchParams.get('preset') || 'nextjs';

			// Map preset string to Framework enum
			framework = Object.values(Framework).includes(preset.toLowerCase()) ? preset.toLowerCase() : Framework.Nextjs;

			// Build configuration - use from URL params or defaults
			installCommand = page.url.searchParams.get('install') || '';

			buildCommand = page.url.searchParams.get('build') || '';
			startCommand = page.url.searchParams.get('start') || '';
			outputDirectory = page.url.searchParams.get('output') || '';

			// Check if custom commands were provided via URL
			hasCustomCommands = !!(installCommand || buildCommand || startCommand || outputDirectory);

			// If no custom commands, auto-fill from framework defaults
			if (!hasCustomCommands && data.frameworks) {
				const fw = data.frameworks.frameworks.find((f) => f.key === framework);

				if (fw && fw.adapters && fw.adapters.length > 0) {
					const adapter = fw.adapters[0];

					installCommand = adapter.installCommand || '';
					buildCommand = adapter.buildCommand || '';
					outputDirectory = adapter.outputDirectory || '';
				}
			}

			// Initialize environment variables from query params
			if (data.envKeys.length > 0) {
				variables = data.envKeys.map((key) => ({ key, value: '', secret: false }));
			}
		});

		async function create() {
			if (!domainIsValid) {
				addNotification({ type: 'error', message: 'Domain is not valid' });

				return;
			}

			$.store_set(isSubmitting, true);

			try {
				// Reject an unusable key before the resource is created, so a
				// rejected variable can't leave a half-configured resource behind.
				const validationError = validateVariables(variables);

				if (validationError) {
					throw new Error(validationError);
				}

				// Create site with build configuration
				let site = await sdk.forProject(page.params.region, page.params.project).sites.create({
					siteId: id || ID.unique(),
					name,
					framework,
					buildRuntime: selectedFramework().buildRuntime,
					installCommand: installCommand || undefined,
					buildCommand: buildCommand || undefined,
					startCommand: shouldShowStartCommand() ? startCommand || undefined : undefined,
					outputDirectory: outputDirectory || undefined,
					adapter: framework === Framework.Other ? Adapter.Static : undefined,
					providerSilentMode: false
				});

				// Add domain
				await sdk.forProject(page.params.region, page.params.project).proxy.createSiteRule({
					domain: `${domain}.${$.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_SITES}`,
					siteId: site.$id
				});

				// Add variables
				const promises = variables.map((variable) => sdk.forProject(page.params.region, page.params.project).sites.createVariable({
					siteId: site.$id,
					variableId: ID.unique(),
					key: variable.key,
					value: variable.value,
					secret: variable.secret
				}));

				await Promise.all(promises);

				// Fetch latest tag from GitHub
				const latestTag = await getLatestTag(data.repository.owner, data.repository.name);

				// Create deployment from GitHub repository using the latest tag
				const deployment = await sdk.forProject(page.params.region, page.params.project).sites.createTemplateDeployment({
					siteId: site.$id,
					repository: data.repository.name,
					owner: data.repository.owner,
					rootDirectory: rootDir || '.',
					type: TemplateReferenceType.Tag,
					reference: latestTag ?? '1.0.0',
					activate: true
				});

				trackEvent(Submit.SiteCreate, {
					source: 'deploy-button',
					framework,
					repository: data.repository.url
				});

				await goto(`${base}/project-${page.params.region}-${page.params.project}/sites/create-site/deploying?site=${site.$id}&deployment=${deployment.$id}`);
			} catch(e) {
				addNotification({ type: 'error', message: e.message });
				trackError(e, Submit.SiteCreate);
			} finally {
				$.store_set(isSubmitting, false);
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('hlh7uq', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>Deploy ${$.escape(data.repository.name)} - Appwrite</title>`);
				});
			});

			Wizard($$renderer, {
				title: 'Deploy site',
				columnSize: 's',
				column: true,
				href: `${base}/project-${page.params.region}-${page.params.project}/sites/`,
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
																				name: 'Site',
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
																					$$renderer.push(`<!----> Site ID`);
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
																	id: 'framework',
																	label: 'Framework',
																	placeholder: 'Select framework',
																	options: frameworkSelectOptions(),
																	get value() {
																		return framework;
																	},

																	set value($$value) {
																		framework = $$value;
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
											legend: 'Git configuration',
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
																	label: 'Install command',
																	placeholder: installCommand || 'npm install',
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

															$$renderer.push(` `);

															if (Input.Text) {
																$$renderer.push('<!--[-->');

																Input.Text($$renderer, {
																	label: 'Build command',
																	placeholder: buildCommand || 'npm run build',
																	get value() {
																		return buildCommand;
																	},

																	set value($$value) {
																		buildCommand = $$value;
																		$$settled = false;
																	}
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (shouldShowStartCommand()) {
																$$renderer.push('<!--[0-->');

																if (Input.Text) {
																	$$renderer.push('<!--[-->');

																	Input.Text($$renderer, {
																		label: 'Start command',
																		placeholder: startCommand || 'npm run start',
																		get value() {
																			return startCommand;
																		},

																		set value($$value) {
																			startCommand = $$value;
																			$$settled = false;
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

															if (Input.Text) {
																$$renderer.push('<!--[-->');

																Input.Text($$renderer, {
																	label: 'Output directory',
																	placeholder: outputDirectory || 'dist',
																	get value() {
																		return outputDirectory;
																	},

																	set value($$value) {
																		outputDirectory = $$value;
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

										if (variables.length > 0) {
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

										Domain($$renderer, {
											get domain() {
												return domain;
											},

											set domain($$value) {
												domain = $$value;
												$$settled = false;
											},

											get domainIsValid() {
												return domainIsValid;
											},

											set domainIsValid($$value) {
												domainIsValid = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> `);

										if (!data.installations?.total) {
											$$renderer.push('<!--[0-->');

											Card($$renderer, {
												isDashed: true,
												padding: 'xs',
												children: ($$renderer) => {
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															direction: 'row',
															gap: 's',
															alignItems: 'center',
															children: ($$renderer) => {
																Icon($$renderer, { icon: IconGithub, size: 'm' });
																$$renderer.push(`<!----> `);

																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		variant: 'm-400',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Note: You can connect your GitHub account later to enable automatic
                            deployments`);
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
								size: 's',
								fullWidthMobile: true,
								submissionLoader: true,
								forceShowLoader: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting),
								disabled: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting) || !domainIsValid || !domain,
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
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> Site ID`, 1);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $iconPath = () => $.store_get(iconPath, '$iconPath', $$stores);
	const $isSubmitting = () => $.store_get(isSubmitting, '$isSubmitting', $$stores);
	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showCustomId = $.state(false);
	let showExitModal = $.state(false);
	let formComponent = $.state(void 0);
	let isSubmitting = $.proxy(writable(false));
	let id = $.state($.proxy(ID.unique()));
	let name = $.state($.proxy($$props.data.repository?.name || ''));
	let domain = $.state('');
	let rootDir = $.state($.proxy($$props.data.repository?.rootDirectory || ''));
	let buildCommand = $.state('');
	let startCommand = $.state('');
	let installCommand = $.state('');
	let outputDirectory = $.state('');
	let domainIsValid = $.state(false);
	let framework = $.state($.proxy(Framework.Nextjs));
	let variables = $.state($.proxy([]));

	// Track if we have custom commands from URL
	let hasCustomCommands = $.state(false);

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

	const selectedFramework = $.derived(() => $.get(frameworkOptions).find((f) => f.key === $.get(framework)) || $.get(frameworkOptions)[0]);

	const frameworkSelectOptions = $.derived(() => $.get(frameworkOptions).map((fw) => ({
		value: fw.key,
		label: fw.name,
		leadingHtml: `<img src='${$iconPath()(getFrameworkIcon(fw.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
	})));

	const primaryAdapter = $.derived(() => $$props.data.frameworks.frameworks.find((f) => f.key === $.get(framework))?.adapters?.[0]);
	const shouldShowStartCommand = $.derived(() => $.get(primaryAdapter)?.key === Adapter.Ssr);

	$.user_effect(() => {
		if ($.get(framework) && $$props.data.frameworks && !$.get(hasCustomCommands)) {
			const fw = $$props.data.frameworks.frameworks.find((f) => f.key === $.get(framework));

			if (fw && fw.adapters && fw.adapters.length > 0) {
				const adapter = fw.adapters[0];

				$.set(installCommand, adapter.installCommand || '', true);
				$.set(buildCommand, adapter.buildCommand || '', true);
				$.set(outputDirectory, adapter.outputDirectory || '', true);
			}
		}
	});

	onMount(() => {
		const preset = page.url.searchParams.get('preset') || 'nextjs';

		// Map preset string to Framework enum
		$.set(framework, Object.values(Framework).includes(preset.toLowerCase()) ? preset.toLowerCase() : Framework.Nextjs, true);

		// Build configuration - use from URL params or defaults
		$.set(installCommand, page.url.searchParams.get('install') || '', true);

		$.set(buildCommand, page.url.searchParams.get('build') || '', true);
		$.set(startCommand, page.url.searchParams.get('start') || '', true);
		$.set(outputDirectory, page.url.searchParams.get('output') || '', true);

		// Check if custom commands were provided via URL
		$.set(hasCustomCommands, !!($.get(installCommand) || $.get(buildCommand) || $.get(startCommand) || $.get(outputDirectory)));

		// If no custom commands, auto-fill from framework defaults
		if (!$.get(hasCustomCommands) && $$props.data.frameworks) {
			const fw = $$props.data.frameworks.frameworks.find((f) => f.key === $.get(framework));

			if (fw && fw.adapters && fw.adapters.length > 0) {
				const adapter = fw.adapters[0];

				$.set(installCommand, adapter.installCommand || '', true);
				$.set(buildCommand, adapter.buildCommand || '', true);
				$.set(outputDirectory, adapter.outputDirectory || '', true);
			}
		}

		// Initialize environment variables from query params
		if ($$props.data.envKeys.length > 0) {
			$.set(variables, $$props.data.envKeys.map((key) => ({ key, value: '', secret: false })), true);
		}
	});

	async function create() {
		if (!$.get(domainIsValid)) {
			addNotification({ type: 'error', message: 'Domain is not valid' });

			return;
		}

		$.store_set(isSubmitting, true);

		try {
			// Reject an unusable key before the resource is created, so a
			// rejected variable can't leave a half-configured resource behind.
			const validationError = validateVariables($.get(variables));

			if (validationError) {
				throw new Error(validationError);
			}

			// Create site with build configuration
			let site = await sdk.forProject(page.params.region, page.params.project).sites.create({
				siteId: $.get(id) || ID.unique(),
				name: $.get(name),
				framework: $.get(framework),
				buildRuntime: $.get(selectedFramework).buildRuntime,
				installCommand: $.get(installCommand) || undefined,
				buildCommand: $.get(buildCommand) || undefined,
				startCommand: $.get(shouldShowStartCommand) ? $.get(startCommand) || undefined : undefined,
				outputDirectory: $.get(outputDirectory) || undefined,
				adapter: $.get(framework) === Framework.Other ? Adapter.Static : undefined,
				providerSilentMode: false
			});

			// Add domain
			await sdk.forProject(page.params.region, page.params.project).proxy.createSiteRule({
				domain: `${$.get(domain)}.${$regionalConsoleVariables()._APP_DOMAIN_SITES}`,
				siteId: site.$id
			});

			// Add variables
			const promises = $.get(variables).map((variable) => sdk.forProject(page.params.region, page.params.project).sites.createVariable({
				siteId: site.$id,
				variableId: ID.unique(),
				key: variable.key,
				value: variable.value,
				secret: variable.secret
			}));

			await Promise.all(promises);

			// Fetch latest tag from GitHub
			const latestTag = await getLatestTag($$props.data.repository.owner, $$props.data.repository.name);

			// Create deployment from GitHub repository using the latest tag
			const deployment = await sdk.forProject(page.params.region, page.params.project).sites.createTemplateDeployment({
				siteId: site.$id,
				repository: $$props.data.repository.name,
				owner: $$props.data.repository.owner,
				rootDirectory: $.get(rootDir) || '.',
				type: TemplateReferenceType.Tag,
				reference: latestTag ?? '1.0.0',
				activate: true
			});

			trackEvent(Submit.SiteCreate, {
				source: 'deploy-button',
				framework: $.get(framework),
				repository: $$props.data.repository.url
			});

			await goto(`${base}/project-${page.params.region}-${page.params.project}/sites/create-site/deploying?site=${site.$id}&deployment=${deployment.$id}`);
		} catch(e) {
			addNotification({ type: 'error', message: e.message });
			trackError(e, Submit.SiteCreate);
		} finally {
			$.store_set(isSubmitting, false);
		}
	}

	$.head('hlh7uq', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `Deploy ${$$props.data.repository.name ?? ''} - Appwrite`;
		});
	});

	{
		let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/sites/`);

		Wizard($$anchor, {
			title: 'Deploy site',
			columnSize: 's',
			column: true,
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
							return isSubmitting;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node = $.first_child(fragment_2);

							$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
								Layout_Stack($$anchor, {
									gap: 'xl',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_4();
										var node_1 = $.first_child(fragment_3);

										Card(node_1, {
											padding: 's',
											radius: 's',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_2 = $.first_child(fragment_4);

												$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
													Layout_Stack_1($$anchor, {
														direction: 'row',
														alignItems: 'center',
														gap: 's',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_3 = $.first_child(fragment_5);

															Icon(node_3, {
																get icon() {
																	return IconGithub;
																}
															});

															var node_4 = $.sibling(node_3, 2);

															Link(node_4, {
																variant: 'quiet',
																get href() {
																	return $$props.data.repository.url;
																},
																size: 'm',
																external: true,
																icon: true,
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text = $.text();

																	$.template_effect(() => $.set_text(text, `${$$props.data.repository.owner ?? ''}/${$$props.data.repository.name ?? ''}`));
																	$.append($$anchor, text);
																},
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_5);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});

										var node_5 = $.sibling(node_1, 2);

										Fieldset(node_5, {
											legend: 'Details',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = $.comment();
												var node_6 = $.first_child(fragment_7);

												$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
													Layout_Stack_2($$anchor, {
														gap: 'l',
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root();
															var node_7 = $.first_child(fragment_8);

															$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																Layout_Stack_3($$anchor, {
																	gap: 's',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = root();
																		var node_8 = $.first_child(fragment_9);

																		$.component(node_8, () => Input.Text, ($$anchor, Input_Text) => {
																			Input_Text($$anchor, {
																				label: 'Name',
																				id: 'name',
																				name: 'name',
																				required: true,
																				placeholder: 'Enter name',
																				get value() {
																					return $.get(name);
																				},

																				set value($$value) {
																					$.set(name, $$value, true);
																				}
																			});
																		});

																		var node_9 = $.sibling(node_8, 2);

																		{
																			var consequent = ($$anchor) => {
																				CustomId($$anchor, {
																					name: 'Site',
																					get id() {
																						return $.get(id);
																					},

																					set id($$value) {
																						$.set(id, $$value, true);
																					},

																					get show() {
																						return $.get(showCustomId);
																					},

																					set show($$value) {
																						$.set(showCustomId, $$value, true);
																					}
																				});
																			};

																			var alternate = ($$anchor) => {
																				var div = root_2();
																				var node_10 = $.child(div);

																				Tag(node_10, {
																					size: 's',
																					onclick: () => $.set(showCustomId, !$.get(showCustomId)),
																					children: ($$anchor, $$slotProps) => {
																						var fragment_11 = root_1();
																						var node_11 = $.first_child(fragment_11);

																						Icon(node_11, {
																							get icon() {
																								return IconPencil;
																							},
																							size: 's'
																						});

																						$.next();
																						$.append($$anchor, fragment_11);
																					},
																					$$slots: { default: true }
																				});

																				$.reset(div);
																				$.append($$anchor, div);
																			};

																			$.if(node_9, ($$render) => {
																				if ($.get(showCustomId)) $$render(consequent); else $$render(alternate, -1);
																			});
																		}

																		$.append($$anchor, fragment_9);
																	},
																	$$slots: { default: true }
																});
															});

															var node_12 = $.sibling(node_7, 2);

															$.component(node_12, () => Input.Select, ($$anchor, Input_Select) => {
																Input_Select($$anchor, {
																	id: 'framework',
																	label: 'Framework',
																	placeholder: 'Select framework',
																	get options() {
																		return $.get(frameworkSelectOptions);
																	},

																	get value() {
																		return $.get(framework);
																	},

																	set value($$value) {
																		$.set(framework, $$value, true);
																	},
																	$$events: { change: () => $.set(startCommand, '') }
																});
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_7);
											},
											$$slots: { default: true }
										});

										var node_13 = $.sibling(node_5, 2);

										Fieldset(node_13, {
											legend: 'Git configuration',
											children: ($$anchor, $$slotProps) => {
												var fragment_12 = $.comment();
												var node_14 = $.first_child(fragment_12);

												$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
													Layout_Stack_4($$anchor, {
														gap: 'm',
														children: ($$anchor, $$slotProps) => {
															var fragment_13 = $.comment();
															var node_15 = $.first_child(fragment_13);

															$.component(node_15, () => Input.Text, ($$anchor, Input_Text_1) => {
																Input_Text_1($$anchor, {
																	label: 'Root directory',
																	placeholder: './',
																	get value() {
																		return $.get(rootDir);
																	},

																	set value($$value) {
																		$.set(rootDir, $$value, true);
																	}
																});
															});

															$.append($$anchor, fragment_13);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_12);
											},
											$$slots: { default: true }
										});

										var node_16 = $.sibling(node_13, 2);

										Fieldset(node_16, {
											legend: 'Build configuration',
											children: ($$anchor, $$slotProps) => {
												var fragment_14 = $.comment();
												var node_17 = $.first_child(fragment_14);

												$.component(node_17, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
													Layout_Stack_5($$anchor, {
														gap: 'm',
														children: ($$anchor, $$slotProps) => {
															var fragment_15 = root_3();
															var node_18 = $.first_child(fragment_15);

															{
																let $0 = $.derived(() => $.get(installCommand) || 'npm install');

																$.component(node_18, () => Input.Text, ($$anchor, Input_Text_2) => {
																	Input_Text_2($$anchor, {
																		label: 'Install command',
																		get placeholder() {
																			return $.get($0);
																		},

																		get value() {
																			return $.get(installCommand);
																		},

																		set value($$value) {
																			$.set(installCommand, $$value, true);
																		}
																	});
																});
															}

															var node_19 = $.sibling(node_18, 2);

															{
																let $0 = $.derived(() => $.get(buildCommand) || 'npm run build');

																$.component(node_19, () => Input.Text, ($$anchor, Input_Text_3) => {
																	Input_Text_3($$anchor, {
																		label: 'Build command',
																		get placeholder() {
																			return $.get($0);
																		},

																		get value() {
																			return $.get(buildCommand);
																		},

																		set value($$value) {
																			$.set(buildCommand, $$value, true);
																		}
																	});
																});
															}

															var node_20 = $.sibling(node_19, 2);

															{
																var consequent_1 = ($$anchor) => {
																	var fragment_16 = $.comment();
																	var node_21 = $.first_child(fragment_16);

																	{
																		let $0 = $.derived(() => $.get(startCommand) || 'npm run start');

																		$.component(node_21, () => Input.Text, ($$anchor, Input_Text_4) => {
																			Input_Text_4($$anchor, {
																				label: 'Start command',
																				get placeholder() {
																					return $.get($0);
																				},

																				get value() {
																					return $.get(startCommand);
																				},

																				set value($$value) {
																					$.set(startCommand, $$value, true);
																				}
																			});
																		});
																	}

																	$.append($$anchor, fragment_16);
																};

																$.if(node_20, ($$render) => {
																	if ($.get(shouldShowStartCommand)) $$render(consequent_1);
																});
															}

															var node_22 = $.sibling(node_20, 2);

															{
																let $0 = $.derived(() => $.get(outputDirectory) || 'dist');

																$.component(node_22, () => Input.Text, ($$anchor, Input_Text_5) => {
																	Input_Text_5($$anchor, {
																		label: 'Output directory',
																		get placeholder() {
																			return $.get($0);
																		},

																		get value() {
																			return $.get(outputDirectory);
																		},

																		set value($$value) {
																			$.set(outputDirectory, $$value, true);
																		}
																	});
																});
															}

															$.append($$anchor, fragment_15);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_14);
											},
											$$slots: { default: true }
										});

										var node_23 = $.sibling(node_16, 2);

										{
											var consequent_2 = ($$anchor) => {
												Fieldset($$anchor, {
													legend: 'Environment variables',
													children: ($$anchor, $$slotProps) => {
														var fragment_18 = $.comment();
														var node_24 = $.first_child(fragment_18);

														$.component(node_24, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
															Layout_Stack_6($$anchor, {
																gap: 'm',
																children: ($$anchor, $$slotProps) => {
																	var fragment_19 = $.comment();
																	var node_25 = $.first_child(fragment_19);

																	$.each(node_25, 17, () => $.get(variables), $.index, ($$anchor, variable, i) => {
																		var fragment_20 = $.comment();
																		var node_26 = $.first_child(fragment_20);

																		$.component(node_26, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
																			Layout_Stack_7($$anchor, {
																				direction: 'row',
																				gap: 's',
																				alignItems: 'flex-end',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_21 = root();
																					var node_27 = $.first_child(fragment_21);

																					$.component(node_27, () => Input.Text, ($$anchor, Input_Text_6) => {
																						Input_Text_6($$anchor, {
																							label: i === 0 ? 'Key' : null,
																							get value() {
																								return $.get(variable).key;
																							},
																							readonly: true,
																							style: 'flex: 1'
																						});
																					});

																					var node_28 = $.sibling(node_27, 2);

																					$.component(node_28, () => Input.Text, ($$anchor, Input_Text_7) => {
																						Input_Text_7($$anchor, {
																							label: i === 0 ? 'Value' : null,
																							placeholder: 'Enter value',
																							required: true,
																							style: 'flex: 2',
																							get value() {
																								return $.get(variable).value;
																							},

																							set value($$value) {
																								($.get(variable).value = $$value);
																							}
																						});
																					});

																					$.append($$anchor, fragment_21);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_20);
																	});

																	$.append($$anchor, fragment_19);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_18);
													},
													$$slots: { default: true }
												});
											};

											$.if(node_23, ($$render) => {
												if ($.get(variables).length > 0) $$render(consequent_2);
											});
										}

										var node_29 = $.sibling(node_23, 2);

										Domain(node_29, {
											get domain() {
												return $.get(domain);
											},

											set domain($$value) {
												$.set(domain, $$value, true);
											},

											get domainIsValid() {
												return $.get(domainIsValid);
											},

											set domainIsValid($$value) {
												$.set(domainIsValid, $$value, true);
											}
										});

										var node_30 = $.sibling(node_29, 2);

										{
											var consequent_3 = ($$anchor) => {
												Card($$anchor, {
													isDashed: true,
													padding: 'xs',
													children: ($$anchor, $$slotProps) => {
														var fragment_23 = $.comment();
														var node_31 = $.first_child(fragment_23);

														$.component(node_31, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
															Layout_Stack_8($$anchor, {
																direction: 'row',
																gap: 's',
																alignItems: 'center',
																children: ($$anchor, $$slotProps) => {
																	var fragment_24 = root();
																	var node_32 = $.first_child(fragment_24);

																	Icon(node_32, {
																		get icon() {
																			return IconGithub;
																		},
																		size: 'm'
																	});

																	var node_33 = $.sibling(node_32, 2);

																	$.component(node_33, () => Typography.Text, ($$anchor, Typography_Text) => {
																		Typography_Text($$anchor, {
																			variant: 'm-400',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_1 = $.text('Note: You can connect your GitHub account later to enable automatic\n                            deployments');

																				$.append($$anchor, text_1);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_24);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_23);
													},
													$$slots: { default: true }
												});
											};

											$.if(node_30, ($$render) => {
												if (!$$props.data.installations?.total) $$render(consequent_3);
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
				footer: ($$anchor, $$slotProps) => {
					var fragment_25 = root();
					var node_34 = $.first_child(fragment_25);

					Button(node_34, {
						fullWidthMobile: true,
						size: 's',
						secondary: true,
						$$events: { click: () => $.set(showExitModal, true) },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Cancel');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_35 = $.sibling(node_34, 2);

					{
						let $0 = $.derived(() => $isSubmitting() || !$.get(domainIsValid) || !$.get(domain));

						Button(node_35, {
							size: 's',
							fullWidthMobile: true,
							submissionLoader: true,
							get forceShowLoader() {
								return $isSubmitting();
							},

							get disabled() {
								return $.get($0);
							},
							$$events: { click: () => $.get(formComponent).triggerSubmit() },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Deploy');

								$.append($$anchor, text_3);
							},
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_25);
				}
			}
		});
	}

	$.pop();
	$$cleanup();
}
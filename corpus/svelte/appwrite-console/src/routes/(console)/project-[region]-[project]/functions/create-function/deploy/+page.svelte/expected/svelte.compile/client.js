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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> Function ID`, 1);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $iconPath = () => $.store_get(iconPath, '$iconPath', $$stores);
	const $isSubmitting = () => $.store_get(isSubmitting, '$isSubmitting', $$stores);
	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showExitModal = $.state(false);
	let showCustomId = $.state(false);
	let isSubmitting = $.proxy(writable(false));
	let id = $.state($.proxy(ID.unique()));
	let name = $.state($.proxy($$props.data.repository.name));
	let execute = true;
	let entrypoint = $.state('');
	let specification = $.state('');
	let runtime = $.state(void 0);
	let installCommand = $.state('');
	let selectedScopes = $.proxy([]);
	let rootDir = $.state($.proxy($$props.data.repository?.rootDirectory));
	let variables = $.state($.proxy([]));
	let latestTag = $.state(null);

	const specificationOptions = $.derived(() => $$props.data.specificationsList?.specifications?.map((size) => ({
		label: `${size.cpus} CPU, ${size.memory} MB RAM` + (!size.enabled ? ` (Upgrade to use this)` : ''),
		value: size.slug,
		disabled: !size.enabled
	})) || []);

	const runtimeOptions = $.derived(() => $$props.data.runtimesList?.runtimes?.map((r) => ({
		value: r.$id,
		label: `${r.name} - ${r.version}`,
		leadingHtml: `<img src='${$iconPath()(getIconFromRuntime(r.key) ?? 'empty', 'color')}' style='inline-size: var(--icon-size-m)' />`
	})) || []);

	onMount(() => {
		const runtimeParam = $$props.data.runtime || page.url.searchParams.get('runtime');
		const runtimeOption = $$props.data.runtimesList.runtimes.find((runtime) => runtime.$id === runtimeParam);

		$.set(runtime, runtimeOption?.$id ?? $$props.data.runtimesList.runtimes[0]?.$id, true);
		$.set(entrypoint, page.url.searchParams.get('entrypoint') || '', true);
		$.set(installCommand, page.url.searchParams.get('install') || '', true);
		$.set(rootDir, page.url.searchParams.get('rootDir') || $$props.data.repository?.rootDirectory || './', true);

		if ($.get(specificationOptions).length > 0) {
			$.set(specification, $.get(specificationOptions)[0].value, true);
		}

		if ($$props.data.envKeys.length > 0) {
			$.set(variables, $$props.data.envKeys.map((key) => ({ key, value: '', secret: false })), true);
		}

		getLatestTag($$props.data.repository.owner, $$props.data.repository.name).then((tagName) => $.set(latestTag, tagName, true));
	});

	async function create() {
		$.store_set(isSubmitting, true);

		try {
			// Reject an unusable key before the resource is created, so a
			// rejected variable can't leave a half-configured resource behind.
			const validationError = validateVariables($.get(variables));

			if (validationError) {
				throw new Error(validationError);
			}

			if (!$.get(latestTag)) {
				$.set(latestTag, await getLatestTag($$props.data.repository.owner, $$props.data.repository.name), true);
			}

			// Create function with configuration
			const func = await sdk.forProject(page.params.region, page.params.project).functions.create({
				functionId: $.get(id) || ID.unique(),
				name: $.get(name),
				runtime: $.get(runtime),
				execute: execute ? ['any'] : undefined,
				entrypoint: $.get(entrypoint) || undefined,
				commands: $.get(installCommand) || undefined,
				scopes: selectedScopes?.length ? selectedScopes : undefined,
				providerSilentMode: false,
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
				key: variable.key,
				value: variable.value,
				secret: variable.secret
			}));

			await Promise.all(promises);

			// Create deployment from GitHub repository using the latest tag
			await sdk.forProject(page.params.region, page.params.project).functions.createTemplateDeployment({
				functionId: func.$id,
				repository: $$props.data.repository.name,
				owner: $$props.data.repository.owner,
				rootDirectory: $.get(rootDir) || '.',
				type: TemplateReferenceType.Tag,
				reference: $.get(latestTag) ?? '1.0.0',
				activate: true
			});

			trackEvent(Submit.FunctionCreate, {
				source: 'deploy-button',
				runtime: $.get(runtime),
				repository: $$props.data.repository.url
			});

			await goto(`${base}/project-${page.params.region}-${page.params.project}/functions/function-${func.$id}`);
		} catch(e) {
			addNotification({ type: 'error', message: e.message });
			trackError(e, Submit.FunctionCreate);
		} finally {
			$.store_set(isSubmitting, false);
		}
	}

	$.head('1mr211w', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `Deploy ${$$props.data.repository.name ?? ''} - Appwrite`;
		});
	});

	{
		let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/functions/`);

		Wizard($$anchor, {
			title: 'Deploy function',
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
														var fragment_8 = root_3();
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
																				name: 'Function',
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
																id: 'runtime',
																label: 'Runtime',
																placeholder: 'Select runtime',
																required: true,
																get options() {
																	return $.get(runtimeOptions);
																},

																get value() {
																	return $.get(runtime);
																},

																set value($$value) {
																	$.set(runtime, $$value, true);
																}
															});
														});

														var node_13 = $.sibling(node_12, 2);

														$.component(node_13, () => Input.Select, ($$anchor, Input_Select_1) => {
															Input_Select_1($$anchor, {
																id: 'specification',
																label: 'Specification',
																placeholder: 'Select specification',
																required: true,
																get options() {
																	return $.get(specificationOptions);
																},

																get value() {
																	return $.get(specification);
																},

																set value($$value) {
																	$.set(specification, $$value, true);
																}
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

									var node_14 = $.sibling(node_5, 2);

									Fieldset(node_14, {
										legend: 'Build configuration',
										children: ($$anchor, $$slotProps) => {
											var fragment_12 = $.comment();
											var node_15 = $.first_child(fragment_12);

											$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
												Layout_Stack_4($$anchor, {
													gap: 'm',
													children: ($$anchor, $$slotProps) => {
														var fragment_13 = root_3();
														var node_16 = $.first_child(fragment_13);

														$.component(node_16, () => Input.Text, ($$anchor, Input_Text_1) => {
															Input_Text_1($$anchor, {
																label: 'Root directory',
																id: 'rootDir',
																name: 'rootDir',
																placeholder: './',
																get value() {
																	return $.get(rootDir);
																},

																set value($$value) {
																	$.set(rootDir, $$value, true);
																}
															});
														});

														var node_17 = $.sibling(node_16, 2);

														$.component(node_17, () => Input.Text, ($$anchor, Input_Text_2) => {
															Input_Text_2($$anchor, {
																label: 'Entrypoint',
																id: 'entrypoint',
																name: 'entrypoint',
																placeholder: 'e.g., index.js, main.py',
																get value() {
																	return $.get(entrypoint);
																},

																set value($$value) {
																	$.set(entrypoint, $$value, true);
																}
															});
														});

														var node_18 = $.sibling(node_17, 2);

														$.component(node_18, () => Input.Text, ($$anchor, Input_Text_3) => {
															Input_Text_3($$anchor, {
																label: 'Install command',
																id: 'installCommand',
																name: 'installCommand',
																placeholder: 'e.g., npm install',
																get value() {
																	return $.get(installCommand);
																},

																set value($$value) {
																	$.set(installCommand, $$value, true);
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

									var node_19 = $.sibling(node_14, 2);

									{
										var consequent_1 = ($$anchor) => {
											Fieldset($$anchor, {
												legend: 'Environment variables',
												children: ($$anchor, $$slotProps) => {
													var fragment_15 = $.comment();
													var node_20 = $.first_child(fragment_15);

													$.component(node_20, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
														Layout_Stack_5($$anchor, {
															gap: 'm',
															children: ($$anchor, $$slotProps) => {
																var fragment_16 = $.comment();
																var node_21 = $.first_child(fragment_16);

																$.each(node_21, 17, () => $.get(variables), $.index, ($$anchor, variable, i) => {
																	var fragment_17 = $.comment();
																	var node_22 = $.first_child(fragment_17);

																	$.component(node_22, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
																		Layout_Stack_6($$anchor, {
																			direction: 'row',
																			gap: 's',
																			alignItems: 'flex-end',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_18 = root();
																				var node_23 = $.first_child(fragment_18);

																				$.component(node_23, () => Input.Text, ($$anchor, Input_Text_4) => {
																					Input_Text_4($$anchor, {
																						label: i === 0 ? 'Key' : null,
																						get value() {
																							return $.get(variable).key;
																						},
																						readonly: true,
																						style: 'flex: 1'
																					});
																				});

																				var node_24 = $.sibling(node_23, 2);

																				$.component(node_24, () => Input.Text, ($$anchor, Input_Text_5) => {
																					Input_Text_5($$anchor, {
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

																				$.append($$anchor, fragment_18);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_17);
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

										$.if(node_19, ($$render) => {
											if ($$props.data.envKeys.length > 0) $$render(consequent_1);
										});
									}

									var node_25 = $.sibling(node_19, 2);

									$.component(node_25, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
										Layout_Stack_7($$anchor, {
											direction: 'row',
											justifyContent: 'space-between',
											children: ($$anchor, $$slotProps) => {
												var fragment_19 = root();
												var node_26 = $.first_child(fragment_19);

												{
													let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/functions`);

													Button(node_26, {
														secondary: true,
														get href() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Cancel');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												}

												var node_27 = $.sibling(node_26, 2);

												{
													let $0 = $.derived(() => !$.get(name) || !$.get(runtime) || !$.get(specification) || $isSubmitting());

													Button(node_27, {
														submit: true,
														fullWidthMobile: true,
														submissionLoader: true,
														get forceShowLoader() {
															return $isSubmitting();
														},

														get disabled() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Deploy function');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												}

												$.append($$anchor, fragment_19);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.pop();
	$$cleanup();
}
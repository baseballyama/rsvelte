import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { CardGrid } from '$lib/components';
import { Dependencies } from '$lib/constants';
import { Button, Form, InputSelect, InputText } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Adapter, BuildRuntime, Framework } from '@appwrite.io/console';
import { Card, Fieldset, Icon, InlineCode, Layout, Tooltip } from '@appwrite.io/pink-svelte';
import { iconPath } from '$lib/stores/app';
import { Link } from '$lib/elements';
import { IconInfo } from '@appwrite.io/pink-icons-svelte';
import { adapterDataList } from './store';
import { getFrameworkIcon } from '$lib/stores/sites';
import { page } from '$app/state';

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

var root_2 = $.from_html(`<span slot="tooltip">Provide a fallback file for advanced routing and proper page
                                        handling in SPA mode.</span>`);

var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function UpdateBuildSettings($$anchor, $$props) {
	$.push($$props, true);

	const $iconPath = () => $.store_get(iconPath, '$iconPath', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const binding_group = [];
	let site = $.prop($$props, 'site', 7);
	let frameworkKey = $.state($.proxy(site().framework));
	let installCommand = $.state($.proxy(site()?.installCommand));
	let buildCommand = $.state($.proxy(site()?.buildCommand));
	let startCommand = $.state($.proxy(site()?.startCommand));
	let outputDirectory = $.state($.proxy(site()?.outputDirectory));
	let fallback = $.state($.proxy(site()?.fallbackFile ?? ''));
	let adapter = $.state($.proxy(site().adapter));
	let selectedFramework = $.state($.proxy($$props.frameworks.find((framework) => framework.key === site().framework)));
	let showFallback = $.derived(() => $.get(adapter) === Adapter.Static);
	let lastFrameworkAdapterKey = $.state('');
	let isUntouched = $.derived(() => $.get(installCommand) === site()?.installCommand && $.get(buildCommand) === site()?.buildCommand && $.get(startCommand) === site()?.startCommand && $.get(outputDirectory) === site()?.outputDirectory && $.get(selectedFramework)?.key === site()?.framework && ($.get(fallback) ?? '') === (site()?.fallbackFile ?? '') && ($.get(adapter) ?? '') === (site()?.adapter ?? ''));
	let frameworkAdapterData = $.derived(() => $.get(selectedFramework).adapters.find((a) => a.key === $.get(adapter)) ?? $.get(selectedFramework).adapters[0]);

	$.user_effect(() => {
		if (!$.get(selectedFramework)) return;

		const frameworkAdapterKey = `${$.get(selectedFramework).key}:${$.get(adapter) ?? ''}`;
		const hasFrameworkSelectionChanged = frameworkAdapterKey !== $.get(lastFrameworkAdapterKey);

		if ($.get(selectedFramework)?.key !== site().framework) {
			// Update adapter
			const singleAdapter = $.get(selectedFramework)?.adapters?.length <= 1;

			if (singleAdapter) {
				const hasSSR = $.get(selectedFramework)?.adapters?.some((a) => a?.key === Adapter.Ssr);
				const hasStatic = $.get(selectedFramework)?.adapters?.some((a) => a?.key === Adapter.Static);

				if (!hasSSR) {
					$.set(adapter, Adapter.Static, true);
				} else if (!hasStatic) {
					$.set(adapter, Adapter.Ssr, true);
				}
			}

			//Update values
			const data = $.get(selectedFramework).adapters.find((a) => a.key === $.get(adapter)) ?? $.get(selectedFramework).adapters[0];

			$.set(installCommand, data.installCommand, true);
			$.set(buildCommand, data.buildCommand, true);
			$.set(startCommand, '');
			$.set(outputDirectory, data.outputDirectory, true);
			$.set(adapter, data.key, true);
			$.set(fallback, data.fallbackFile, true);
		} else if (hasFrameworkSelectionChanged) {
			const data = $.get(selectedFramework).adapters.find((a) => a.key === $.get(adapter)) ?? $.get(selectedFramework).adapters[0];
			const isOriginalAdapter = $.get(adapter) === site().adapter;

			$.set(
				installCommand,
				isOriginalAdapter
					? site()?.installCommand ?? $.get(frameworkAdapterData).installCommand
					: data.installCommand,
				true
			);

			$.set(
				buildCommand,
				isOriginalAdapter
					? site()?.buildCommand ?? $.get(frameworkAdapterData).buildCommand
					: data.buildCommand,
				true
			);

			$.set(startCommand, isOriginalAdapter ? site()?.startCommand ?? '' : '', true);

			$.set(
				outputDirectory,
				isOriginalAdapter
					? site()?.outputDirectory ?? $.get(frameworkAdapterData).outputDirectory
					: data.outputDirectory,
				true
			);

			$.set(
				fallback,
				isOriginalAdapter
					? site()?.fallbackFile ?? data.fallbackFile
					: data.fallbackFile,
				true
			);
		}

		$.set(lastFrameworkAdapterKey, `${$.get(selectedFramework).key}:${$.get(adapter) ?? ''}`);
	});

	$.user_effect(() => {
		if ($.get(selectedFramework)) {
			if (!$.get(selectedFramework).adapters.some((a) => a.key === $.get(adapter))) {
				$.set(adapter, $.get(selectedFramework).adapters[0].key, true);
				site().adapter = $.get(adapter);
			}

			if ($$props.buildSpecs.specifications.length || $$props.runtimeSpecs.specifications.length) {
				const buildEnabledSpecs = $$props.buildSpecs.specifications.filter((s) => s.enabled);
				const runtimeEnabledSpecs = $$props.runtimeSpecs.specifications.filter((s) => s.enabled);

				if (buildEnabledSpecs.length && !buildEnabledSpecs.some((s) => s.slug === site().buildSpecification)) {
					site().buildSpecification = buildEnabledSpecs[0]?.slug;
				}

				if (runtimeEnabledSpecs.length && !runtimeEnabledSpecs.some((s) => s.slug === site().runtimeSpecification)) {
					site().runtimeSpecification = runtimeEnabledSpecs[0]?.slug;
				}
			}
		}
	});

	async function update() {
		let adptr = $.get(selectedFramework).adapters.find((a) => a.key === $.get(adapter));

		if (!adptr?.key && $.get(selectedFramework).adapters?.length) {
			$.set(adapter, $.get(selectedFramework).adapters[0].key, true);
			adptr = $.get(selectedFramework).adapters[0];
			site().adapter = $.get(adapter);
		}

		const buildEnabledSpecs = $$props.buildSpecs.specifications.filter((s) => s.enabled);
		const runtimeEnabledSpecs = $$props.runtimeSpecs.specifications.filter((s) => s.enabled);

		const specToSend = buildEnabledSpecs.some((s) => s.slug === site().buildSpecification)
			? site().buildSpecification
			: buildEnabledSpecs[0]?.slug ?? site().buildSpecification;

		const runtimeSpecToSend = runtimeEnabledSpecs.some((s) => s.slug === site().runtimeSpecification)
			? site().runtimeSpecification
			: runtimeEnabledSpecs[0]?.slug ?? site().runtimeSpecification;

		try {
			await sdk.forProject(page.params.region, page.params.project).sites.update({
				siteId: site().$id,
				name: site().name,
				framework: $.get(selectedFramework).key,
				enabled: site().enabled ?? undefined,
				logging: site().logging ?? undefined,
				timeout: site().timeout || undefined,
				installCommand: $.get(installCommand) || undefined,
				buildCommand: $.get(buildCommand) || undefined,
				startCommand: adptr?.key === 'ssr' ? $.get(startCommand) || undefined : undefined,
				outputDirectory: $.get(outputDirectory) || undefined,
				buildRuntime: site()?.buildRuntime || undefined,
				adapter: adptr?.key || undefined,
				fallbackFile: adptr?.key === 'static' ? $.get(fallback) || undefined : undefined,
				installationId: site().installationId || undefined,
				providerRepositoryId: site().providerRepositoryId || undefined,
				providerBranch: site().providerBranch || undefined,
				providerSilentMode: site().providerSilentMode ?? undefined,
				providerRootDirectory: site().providerRootDirectory || undefined,
				buildSpecification: specToSend || undefined,
				runtimeSpecification: runtimeSpecToSend || undefined,
				deploymentRetention: site().deploymentRetention ?? undefined
			});

			site().buildSpecification = specToSend;
			site().runtimeSpecification = runtimeSpecToSend;
			await invalidate(Dependencies.SITE);
			addNotification({ message: 'Build settings have been updated', type: 'success' });
			trackEvent(Submit.SiteUpdateBuildSettings);
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.SiteUpdateBuildSettings);
		}
	}

	function reset(type) {
		const data = $.get(selectedFramework).adapters.find((a) => a.key === $.get(adapter));

		if (type === 'installCommand') {
			$.set(installCommand, data.installCommand, true);
		} else if (type === 'buildCommand') {
			$.set(buildCommand, data.buildCommand, true);
		} else if (type === 'outputDirectory') {
			$.set(outputDirectory, data.outputDirectory, true);
		}
	}

	Form($$anchor, {
		onSubmit: update,
		children: ($$anchor, $$slotProps) => {
			CardGrid($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Default build settings are configured based on your framework, ensuring optimal performance. Adjust\n        the settings here if needed.');

					$.append($$anchor, text);
				},

				$$slots: {
					default: true,
					title: ($$anchor, $$slotProps) => {
						var text_1 = $.text('Build settings');

						$.append($$anchor, text_1);
					},

					aside: ($$anchor, $$slotProps) => {
						const adapterData = $.derived(() => adapterDataList.find((adapterData) => adapterData.framework === $.get(frameworkKey).toLowerCase()));
						var fragment_2 = $.comment();
						var node = $.first_child(fragment_2);

						$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								gap: 'xl',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_4();
									var node_1 = $.first_child(fragment_3);

									{
										let $0 = $.derived(() => $$props.frameworks.map((framework) => ({
											value: framework.key,
											label: framework.name,
											leadingHtml: `<img src='${$iconPath()(getFrameworkIcon(framework.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
										})));

										InputSelect(node_1, {
											required: true,
											id: 'framework',
											label: 'Framework',
											placeholder: 'Select framework',
											get options() {
												return $.get($0);
											},

											get value() {
												return $.get(frameworkKey);
											},

											set value($$value) {
												$.set(frameworkKey, $$value, true);
											},

											$$events: {
												change: () => {
													$.set(selectedFramework, $$props.frameworks.find((framework) => framework.key === $.get(frameworkKey)), true);
												}
											}
										});
									}

									var node_2 = $.sibling(node_1, 2);

									{
										var consequent_8 = ($$anchor) => {
											var fragment_4 = $.comment();
											var node_3 = $.first_child(fragment_4);

											$.component(node_3, () => Layout.Grid, ($$anchor, Layout_Grid) => {
												Layout_Grid($$anchor, {
													columnsXS: 1,
													columns: 2,
													gap: 'l',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_1();
														var node_4 = $.first_child(fragment_5);

														{
															let $0 = $.derived(() => `${Adapter.Ssr}`);

															$.component(node_4, () => Card.Selector, ($$anchor, Card_Selector) => {
																Card_Selector($$anchor, {
																	title: 'Server side rendering',
																	variant: 'primary',
																	radius: 's',
																	padding: 's',
																	name: 'adapter',
																	get value() {
																		return $.get($0);
																	},

																	get group() {
																		return $.get(adapter);
																	},

																	set group($$value) {
																		$.set(adapter, $$value, true);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = root_1();
																		var node_5 = $.first_child(fragment_6);

																		{
																			var consequent_1 = ($$anchor) => {
																				const parts = $.derived(() => $.get(adapterData).ssr.desc.split('$'));
																				var fragment_7 = $.comment();
																				var node_6 = $.first_child(fragment_7);

																				$.each(node_6, 17, () => $.get(parts), $.index, ($$anchor, part, i) => {
																					var fragment_8 = $.comment();
																					var node_7 = $.first_child(fragment_8);

																					{
																						var consequent = ($$anchor) => {
																							var text_2 = $.text();

																							$.template_effect(() => $.set_text(text_2, $.get(part)));
																							$.append($$anchor, text_2);
																						};

																						var alternate = ($$anchor) => {
																							var fragment_10 = root();
																							var node_8 = $.first_child(fragment_10);

																							InlineCode(node_8, {
																								get code() {
																									return $.get(adapterData).ssr.code[i - 1];
																								},
																								size: 's'
																							});

																							var text_3 = $.sibling(node_8);

																							$.template_effect(() => $.set_text(text_3, ` ${$.get(part) ?? ''}`));
																							$.append($$anchor, fragment_10);
																						};

																						$.if(node_7, ($$render) => {
																							if (i === 0) $$render(consequent); else $$render(alternate, -1);
																						});
																					}

																					$.append($$anchor, fragment_8);
																				});

																				$.append($$anchor, fragment_7);
																			};

																			var d = $.derived(() => $.get(adapterData)?.ssr?.desc?.includes('$'));

																			var consequent_2 = ($$anchor) => {
																				var text_4 = $.text();

																				$.template_effect(() => $.set_text(text_4, $.get(adapterData).ssr.desc));
																				$.append($$anchor, text_4);
																			};

																			$.if(node_5, ($$render) => {
																				if ($.get(d)) $$render(consequent_1); else if ($.get(adapterData)?.ssr?.desc) $$render(consequent_2, 1);
																			});
																		}

																		var node_9 = $.sibling(node_5, 2);

																		{
																			var consequent_3 = ($$anchor) => {
																				Link($$anchor, {
																					variant: 'muted',
																					size: 'm',
																					external: true,
																					get href() {
																						return $.get(adapterData).ssr.url;
																					},

																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_5 = $.text('Learn more');

																						$.append($$anchor, text_5);
																					},
																					$$slots: { default: true }
																				});
																			};

																			$.if(node_9, ($$render) => {
																				if ($.get(adapterData)?.ssr?.url) $$render(consequent_3);
																			});
																		}

																		$.append($$anchor, fragment_6);
																	},
																	$$slots: { default: true }
																});
															});
														}

														var node_10 = $.sibling(node_4, 2);

														$.component(node_10, () => Card.Selector, ($$anchor, Card_Selector_1) => {
															Card_Selector_1($$anchor, {
																title: 'Static site',
																variant: 'primary',
																radius: 's',
																padding: 's',
																name: 'adapter',
																get value() {
																	return Adapter.Static;
																},

																get group() {
																	return $.get(adapter);
																},

																set group($$value) {
																	$.set(adapter, $$value, true);
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_13 = root_1();
																	var node_11 = $.first_child(fragment_13);

																	{
																		var consequent_5 = ($$anchor) => {
																			const parts = $.derived(() => $.get(adapterData).static.desc.split('$'));
																			var fragment_14 = $.comment();
																			var node_12 = $.first_child(fragment_14);

																			$.each(node_12, 17, () => $.get(parts), $.index, ($$anchor, part, i) => {
																				var fragment_15 = $.comment();
																				var node_13 = $.first_child(fragment_15);

																				{
																					var consequent_4 = ($$anchor) => {
																						var text_6 = $.text();

																						$.template_effect(() => $.set_text(text_6, $.get(part)));
																						$.append($$anchor, text_6);
																					};

																					var alternate_1 = ($$anchor) => {
																						var fragment_17 = root();
																						var node_14 = $.first_child(fragment_17);

																						InlineCode(node_14, {
																							get code() {
																								return $.get(adapterData).static.code[i - 1];
																							},
																							size: 's'
																						});

																						var text_7 = $.sibling(node_14);

																						$.template_effect(() => $.set_text(text_7, ` ${$.get(part) ?? ''}`));
																						$.append($$anchor, fragment_17);
																					};

																					$.if(node_13, ($$render) => {
																						if (i === 0) $$render(consequent_4); else $$render(alternate_1, -1);
																					});
																				}

																				$.append($$anchor, fragment_15);
																			});

																			$.append($$anchor, fragment_14);
																		};

																		var d_1 = $.derived(() => $.get(adapterData)?.static?.desc?.includes('$'));

																		var consequent_6 = ($$anchor) => {
																			var text_8 = $.text();

																			$.template_effect(() => $.set_text(text_8, $.get(adapterData).static.desc));
																			$.append($$anchor, text_8);
																		};

																		$.if(node_11, ($$render) => {
																			if ($.get(d_1)) $$render(consequent_5); else if ($.get(adapterData)?.ssr?.desc) $$render(consequent_6, 1);
																		});
																	}

																	var node_15 = $.sibling(node_11, 2);

																	{
																		var consequent_7 = ($$anchor) => {
																			Link($$anchor, {
																				variant: 'muted',
																				size: 'm',
																				external: true,
																				get href() {
																					return $.get(adapterData).static.url;
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_9 = $.text('Learn more');

																					$.append($$anchor, text_9);
																				},
																				$$slots: { default: true }
																			});
																		};

																		$.if(node_15, ($$render) => {
																			if ($.get(adapterData)?.static?.url) $$render(consequent_7);
																		});
																	}

																	$.append($$anchor, fragment_13);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										};

										$.if(node_2, ($$render) => {
											if ($.get(selectedFramework).adapters?.length >= 2) $$render(consequent_8);
										});
									}

									var node_16 = $.sibling(node_2, 2);

									Fieldset(node_16, {
										legend: 'Settings',
										children: ($$anchor, $$slotProps) => {
											var fragment_20 = $.comment();
											var node_17 = $.first_child(fragment_20);

											$.component(node_17, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
												Layout_Stack_1($$anchor, {
													gap: 'xl',
													children: ($$anchor, $$slotProps) => {
														var fragment_21 = root_3();
														var node_18 = $.first_child(fragment_21);

														$.component(node_18, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
															Layout_Stack_2($$anchor, {
																gap: 's',
																direction: 'row',
																alignItems: 'flex-end',
																children: ($$anchor, $$slotProps) => {
																	var fragment_22 = root_1();
																	var node_19 = $.first_child(fragment_22);

																	{
																		let $0 = $.derived(() => $.get(frameworkAdapterData)?.installCommand || 'Enter install command');

																		InputText(node_19, {
																			id: 'installCommand',
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
																	}

																	var node_20 = $.sibling(node_19, 2);

																	{
																		let $0 = $.derived(() => ($.get(installCommand) ?? '') === ($.get(frameworkAdapterData)?.installCommand ?? ''));

																		Button(node_20, {
																			secondary: true,
																			size: 's',
																			get disabled() {
																				return $.get($0);
																			},
																			$$events: { click: () => reset('installCommand') },
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_10 = $.text('Reset');

																				$.append($$anchor, text_10);
																			},
																			$$slots: { default: true }
																		});
																	}

																	$.append($$anchor, fragment_22);
																},
																$$slots: { default: true }
															});
														});

														var node_21 = $.sibling(node_18, 2);

														$.component(node_21, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
															Layout_Stack_3($$anchor, {
																gap: 's',
																direction: 'row',
																alignItems: 'flex-end',
																children: ($$anchor, $$slotProps) => {
																	var fragment_23 = root_1();
																	var node_22 = $.first_child(fragment_23);

																	{
																		let $0 = $.derived(() => $.get(frameworkAdapterData)?.buildCommand || 'Enter build command');

																		InputText(node_22, {
																			id: 'buildCommand',
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
																	}

																	var node_23 = $.sibling(node_22, 2);

																	{
																		let $0 = $.derived(() => ($.get(buildCommand) ?? '') === ($.get(frameworkAdapterData)?.buildCommand ?? ''));

																		Button(node_23, {
																			secondary: true,
																			size: 's',
																			get disabled() {
																				return $.get($0);
																			},
																			$$events: { click: () => reset('buildCommand') },
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_11 = $.text('Reset');

																				$.append($$anchor, text_11);
																			},
																			$$slots: { default: true }
																		});
																	}

																	$.append($$anchor, fragment_23);
																},
																$$slots: { default: true }
															});
														});

														var node_24 = $.sibling(node_21, 2);

														{
															var consequent_9 = ($$anchor) => {
																var fragment_24 = $.comment();
																var node_25 = $.first_child(fragment_24);

																$.component(node_25, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																	Layout_Stack_4($$anchor, {
																		gap: 's',
																		direction: 'row',
																		alignItems: 'flex-end',
																		children: ($$anchor, $$slotProps) => {
																			InputText($$anchor, {
																				id: 'startCommand',
																				label: 'Start command',
																				placeholder: 'Enter start command',
																				get value() {
																					return $.get(startCommand);
																				},

																				set value($$value) {
																					$.set(startCommand, $$value, true);
																				}
																			});
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_24);
															};

															$.if(node_24, ($$render) => {
																if ($.get(adapter) === Adapter.Ssr) $$render(consequent_9);
															});
														}

														var node_26 = $.sibling(node_24, 2);

														$.component(node_26, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
															Layout_Stack_5($$anchor, {
																gap: 's',
																direction: 'row',
																alignItems: 'flex-end',
																children: ($$anchor, $$slotProps) => {
																	var fragment_26 = root_1();
																	var node_27 = $.first_child(fragment_26);

																	{
																		let $0 = $.derived(() => $.get(frameworkAdapterData)?.outputDirectory || 'Enter output directory');

																		InputText(node_27, {
																			id: 'outputDirectory',
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
																	}

																	var node_28 = $.sibling(node_27, 2);

																	{
																		let $0 = $.derived(() => ($.get(outputDirectory) ?? '') === ($.get(frameworkAdapterData)?.outputDirectory ?? ''));

																		Button(node_28, {
																			secondary: true,
																			size: 's',
																			get disabled() {
																				return $.get($0);
																			},
																			$$events: { click: () => reset('outputDirectory') },
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_12 = $.text('Reset');

																				$.append($$anchor, text_12);
																			},
																			$$slots: { default: true }
																		});
																	}

																	$.append($$anchor, fragment_26);
																},
																$$slots: { default: true }
															});
														});

														var node_29 = $.sibling(node_26, 2);

														{
															var consequent_10 = ($$anchor) => {
																InputText($$anchor, {
																	id: 'fallback',
																	label: 'Fallback file',
																	placeholder: 'index.html',
																	get value() {
																		return $.get(fallback);
																	},

																	set value($$value) {
																		$.set(fallback, $$value, true);
																	},

																	$$slots: {
																		info: ($$anchor, $$slotProps) => {
																			Tooltip($$anchor, {
																				slot: 'info',
																				children: ($$anchor, $$slotProps) => {
																					Icon($$anchor, {
																						get icon() {
																							return IconInfo;
																						},
																						size: 's'
																					});
																				},

																				$$slots: {
																					default: true,
																					tooltip: ($$anchor, $$slotProps) => {
																						var span = root_2();

																						$.append($$anchor, span);
																					}
																				}
																			});
																		}
																	}
																});
															};

															$.if(node_29, ($$render) => {
																if ($.get(showFallback)) $$render(consequent_10);
															});
														}

														$.append($$anchor, fragment_21);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_20);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},

					actions: ($$anchor, $$slotProps) => {
						Button($$anchor, {
							get disabled() {
								return $.get(isUntouched);
							},
							submit: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_13 = $.text('Update');

								$.append($$anchor, text_13);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}
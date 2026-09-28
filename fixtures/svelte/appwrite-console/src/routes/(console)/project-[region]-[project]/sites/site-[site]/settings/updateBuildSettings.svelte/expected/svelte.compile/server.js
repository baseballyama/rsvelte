import * as $ from 'svelte/internal/server';
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

export default function UpdateBuildSettings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { site, frameworks, buildSpecs, runtimeSpecs } = $$props;
		let frameworkKey = site.framework;
		let installCommand = site?.installCommand;
		let buildCommand = site?.buildCommand;
		let startCommand = site?.startCommand;
		let outputDirectory = site?.outputDirectory;
		let fallback = site?.fallbackFile ?? '';
		let adapter = site.adapter;
		let selectedFramework = frameworks.find((framework) => framework.key === site.framework);
		let showFallback = $.derived(() => adapter === Adapter.Static);
		let lastFrameworkAdapterKey = '';
		let isUntouched = $.derived(() => installCommand === site?.installCommand && buildCommand === site?.buildCommand && startCommand === site?.startCommand && outputDirectory === site?.outputDirectory && selectedFramework?.key === site?.framework && (fallback ?? '') === (site?.fallbackFile ?? '') && (adapter ?? '') === (site?.adapter ?? ''));
		let frameworkAdapterData = $.derived(() => selectedFramework.adapters.find((a) => a.key === adapter) ?? selectedFramework.adapters[0]);

		// Update adapter
		//Update values
		async function update() {
			let adptr = selectedFramework.adapters.find((a) => a.key === adapter);

			if (!adptr?.key && selectedFramework.adapters?.length) {
				adapter = selectedFramework.adapters[0].key;
				adptr = selectedFramework.adapters[0];
				site.adapter = adapter;
			}

			const buildEnabledSpecs = buildSpecs.specifications.filter((s) => s.enabled);
			const runtimeEnabledSpecs = runtimeSpecs.specifications.filter((s) => s.enabled);

			const specToSend = buildEnabledSpecs.some((s) => s.slug === site.buildSpecification)
				? site.buildSpecification
				: buildEnabledSpecs[0]?.slug ?? site.buildSpecification;

			const runtimeSpecToSend = runtimeEnabledSpecs.some((s) => s.slug === site.runtimeSpecification)
				? site.runtimeSpecification
				: runtimeEnabledSpecs[0]?.slug ?? site.runtimeSpecification;

			try {
				await sdk.forProject(page.params.region, page.params.project).sites.update({
					siteId: site.$id,
					name: site.name,
					framework: selectedFramework.key,
					enabled: site.enabled ?? undefined,
					logging: site.logging ?? undefined,
					timeout: site.timeout || undefined,
					installCommand: installCommand || undefined,
					buildCommand: buildCommand || undefined,
					startCommand: adptr?.key === 'ssr' ? startCommand || undefined : undefined,
					outputDirectory: outputDirectory || undefined,
					buildRuntime: site?.buildRuntime || undefined,
					adapter: adptr?.key || undefined,
					fallbackFile: adptr?.key === 'static' ? fallback || undefined : undefined,
					installationId: site.installationId || undefined,
					providerRepositoryId: site.providerRepositoryId || undefined,
					providerBranch: site.providerBranch || undefined,
					providerSilentMode: site.providerSilentMode ?? undefined,
					providerRootDirectory: site.providerRootDirectory || undefined,
					buildSpecification: specToSend || undefined,
					runtimeSpecification: runtimeSpecToSend || undefined,
					deploymentRetention: site.deploymentRetention ?? undefined
				});

				site.buildSpecification = specToSend;
				site.runtimeSpecification = runtimeSpecToSend;
				await invalidate(Dependencies.SITE);
				addNotification({ message: 'Build settings have been updated', type: 'success' });
				trackEvent(Submit.SiteUpdateBuildSettings);
			} catch(error) {
				addNotification({ message: error.message, type: 'error' });
				trackError(error, Submit.SiteUpdateBuildSettings);
			}
		}

		function reset(type) {
			const data = selectedFramework.adapters.find((a) => a.key === adapter);

			if (type === 'installCommand') {
				installCommand = data.installCommand;
			} else if (type === 'buildCommand') {
				buildCommand = data.buildCommand;
			} else if (type === 'outputDirectory') {
				outputDirectory = data.outputDirectory;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Form($$renderer, {
				onSubmit: update,
				children: ($$renderer) => {
					CardGrid($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Default build settings are configured based on your framework, ensuring optimal performance. Adjust
        the settings here if needed.`);
						},

						$$slots: {
							default: true,
							title: ($$renderer) => {
								{
									$$renderer.push(`Build settings`);
								}
							},

							aside: ($$renderer) => {
								{
									const adapterData = adapterDataList.find((adapterData) => adapterData.framework === frameworkKey.toLowerCase());

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											gap: 'xl',
											children: ($$renderer) => {
												InputSelect($$renderer, {
													required: true,
													id: 'framework',
													label: 'Framework',
													placeholder: 'Select framework',
													options: frameworks.map((framework) => ({
														value: framework.key,
														label: framework.name,
														leadingHtml: `<img src='${$.store_get($$store_subs ??= {}, '$iconPath', iconPath)(getFrameworkIcon(framework.key), 'color')}' style='inline-size: var(--icon-size-m)' />`
													})),

													get value() {
														return frameworkKey;
													},

													set value($$value) {
														frameworkKey = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----> `);

												if (selectedFramework.adapters?.length >= 2) {
													$$renderer.push('<!--[0-->');

													if (Layout.Grid) {
														$$renderer.push('<!--[-->');

														Layout.Grid($$renderer, {
															columnsXS: 1,
															columns: 2,
															gap: 'l',
															children: ($$renderer) => {
																if (Card.Selector) {
																	$$renderer.push('<!--[-->');

																	Card.Selector($$renderer, {
																		title: 'Server side rendering',
																		variant: 'primary',
																		radius: 's',
																		padding: 's',
																		name: 'adapter',
																		value: `${Adapter.Ssr}`,
																		get group() {
																			return adapter;
																		},

																		set group($$value) {
																			adapter = $$value;
																			$$settled = false;
																		},

																		children: ($$renderer) => {
																			if (adapterData?.ssr?.desc?.includes('$')) {
																				$$renderer.push('<!--[0-->');

																				const parts = adapterData.ssr.desc.split('$');

																				$$renderer.push(`<!--[-->`);

																				const each_array = $.ensure_array_like(parts);

																				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
																					let part = each_array[i];

																					if (i === 0) {
																						$$renderer.push(`<!--[0-->${$.escape(part)}`);
																					} else {
																						$$renderer.push('<!--[-1-->');
																						InlineCode($$renderer, { code: adapterData.ssr.code[i - 1], size: 's' });
																						$$renderer.push(`<!----> ${$.escape(part)}`);
																					}

																					$$renderer.push(`<!--]-->`);
																				}

																				$$renderer.push(`<!--]-->`);
																			} else if (adapterData?.ssr?.desc) {
																				$$renderer.push(`<!--[1-->${$.escape(adapterData.ssr.desc)}`);
																			} else {
																				$$renderer.push('<!--[-1-->');
																			}

																			$$renderer.push(`<!--]--> `);

																			if (adapterData?.ssr?.url) {
																				$$renderer.push('<!--[0-->');

																				Link($$renderer, {
																					variant: 'muted',
																					size: 'm',
																					external: true,
																					href: adapterData.ssr.url,
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Learn more`);
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

																$$renderer.push(` `);

																if (Card.Selector) {
																	$$renderer.push('<!--[-->');

																	Card.Selector($$renderer, {
																		title: 'Static site',
																		variant: 'primary',
																		radius: 's',
																		padding: 's',
																		name: 'adapter',
																		value: Adapter.Static,
																		get group() {
																			return adapter;
																		},

																		set group($$value) {
																			adapter = $$value;
																			$$settled = false;
																		},

																		children: ($$renderer) => {
																			if (adapterData?.static?.desc?.includes('$')) {
																				$$renderer.push('<!--[0-->');

																				const parts = adapterData.static.desc.split('$');

																				$$renderer.push(`<!--[-->`);

																				const each_array_1 = $.ensure_array_like(parts);

																				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
																					let part = each_array_1[i];

																					if (i === 0) {
																						$$renderer.push(`<!--[0-->${$.escape(part)}`);
																					} else {
																						$$renderer.push('<!--[-1-->');
																						InlineCode($$renderer, { code: adapterData.static.code[i - 1], size: 's' });
																						$$renderer.push(`<!----> ${$.escape(part)}`);
																					}

																					$$renderer.push(`<!--]-->`);
																				}

																				$$renderer.push(`<!--]-->`);
																			} else if (adapterData?.ssr?.desc) {
																				$$renderer.push(`<!--[1-->${$.escape(adapterData.static.desc)}`);
																			} else {
																				$$renderer.push('<!--[-1-->');
																			}

																			$$renderer.push(`<!--]--> `);

																			if (adapterData?.static?.url) {
																				$$renderer.push('<!--[0-->');

																				Link($$renderer, {
																					variant: 'muted',
																					size: 'm',
																					external: true,
																					href: adapterData.static.url,
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Learn more`);
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

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> `);

												Fieldset($$renderer, {
													legend: 'Settings',
													children: ($$renderer) => {
														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																gap: 'xl',
																children: ($$renderer) => {
																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			gap: 's',
																			direction: 'row',
																			alignItems: 'flex-end',
																			children: ($$renderer) => {
																				InputText($$renderer, {
																					id: 'installCommand',
																					label: 'Install command',
																					placeholder: frameworkAdapterData()?.installCommand || 'Enter install command',
																					get value() {
																						return installCommand;
																					},

																					set value($$value) {
																						installCommand = $$value;
																						$$settled = false;
																					}
																				});

																				$$renderer.push(`<!----> `);

																				Button($$renderer, {
																					secondary: true,
																					size: 's',
																					disabled: (installCommand ?? '') === (frameworkAdapterData()?.installCommand ?? ''),
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Reset`);
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

																	$$renderer.push(` `);

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			gap: 's',
																			direction: 'row',
																			alignItems: 'flex-end',
																			children: ($$renderer) => {
																				InputText($$renderer, {
																					id: 'buildCommand',
																					label: 'Build command',
																					placeholder: frameworkAdapterData()?.buildCommand || 'Enter build command',
																					get value() {
																						return buildCommand;
																					},

																					set value($$value) {
																						buildCommand = $$value;
																						$$settled = false;
																					}
																				});

																				$$renderer.push(`<!----> `);

																				Button($$renderer, {
																					secondary: true,
																					size: 's',
																					disabled: (buildCommand ?? '') === (frameworkAdapterData()?.buildCommand ?? ''),
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Reset`);
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

																	$$renderer.push(` `);

																	if (adapter === Adapter.Ssr) {
																		$$renderer.push('<!--[0-->');

																		if (Layout.Stack) {
																			$$renderer.push('<!--[-->');

																			Layout.Stack($$renderer, {
																				gap: 's',
																				direction: 'row',
																				alignItems: 'flex-end',
																				children: ($$renderer) => {
																					InputText($$renderer, {
																						id: 'startCommand',
																						label: 'Start command',
																						placeholder: 'Enter start command',
																						get value() {
																							return startCommand;
																						},

																						set value($$value) {
																							startCommand = $$value;
																							$$settled = false;
																						}
																					});
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

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			gap: 's',
																			direction: 'row',
																			alignItems: 'flex-end',
																			children: ($$renderer) => {
																				InputText($$renderer, {
																					id: 'outputDirectory',
																					label: 'Output directory',
																					placeholder: frameworkAdapterData()?.outputDirectory || 'Enter output directory',
																					get value() {
																						return outputDirectory;
																					},

																					set value($$value) {
																						outputDirectory = $$value;
																						$$settled = false;
																					}
																				});

																				$$renderer.push(`<!----> `);

																				Button($$renderer, {
																					secondary: true,
																					size: 's',
																					disabled: (outputDirectory ?? '') === (frameworkAdapterData()?.outputDirectory ?? ''),
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Reset`);
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

																	$$renderer.push(` `);

																	if (showFallback()) {
																		$$renderer.push('<!--[0-->');

																		InputText($$renderer, {
																			id: 'fallback',
																			label: 'Fallback file',
																			placeholder: 'index.html',
																			get value() {
																				return fallback;
																			},

																			set value($$value) {
																				fallback = $$value;
																				$$settled = false;
																			},

																			$$slots: {
																				info: ($$renderer) => {
																					Tooltip($$renderer, {
																						slot: 'info',
																						children: ($$renderer) => {
																							Icon($$renderer, { icon: IconInfo, size: 's' });
																						},

																						$$slots: {
																							default: true,
																							tooltip: ($$renderer) => {
																								$$renderer.push(`<span slot="tooltip">Provide a fallback file for advanced routing and proper page
                                        handling in SPA mode.</span>`);
																							}
																						}
																					});
																				}
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
								}
							},

							actions: ($$renderer) => {
								{
									Button($$renderer, {
										disabled: isUntouched(),
										submit: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Update`);
										},
										$$slots: { default: true }
									});
								}
							}
						}
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
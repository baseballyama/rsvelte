import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Button, Form, InputDomain, InputSelect, InputURL } from '$lib/elements/forms';
import { Wizard } from '$lib/layout';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { Fieldset, Layout, Tooltip, Icon, Alert } from '@appwrite.io/pink-svelte';
import { goto, invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { IconInfo } from '@appwrite.io/pink-icons-svelte';
import { LabelCard } from '$lib/components';
import { BranchSelector } from '$lib/components/git';

import {
	Adapter,
	BuildRuntime,
	Framework,
	ProxyResourceType,
	StatusCode
} from '@appwrite.io/console';

import { statusCodeOptions } from '$lib/stores/domains';
import { writable } from 'svelte/store';
import { onMount } from 'svelte';
import { ConnectRepoModal } from '$lib/components/git/index.js';
import { project, regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { isCloud } from '$lib/system';
import { getApexDomain } from '$lib/helpers/tlds';
import { isProxyRuleVerified } from '$lib/components/domains/status';

var root = $.from_html(`<!> <!> <!>`, 1);

var root_1 = $.from_html(
	`<p>The domain will be connected to your active deployment.
                                        Connect your Git repository to link a production branch.</p> <div><!></div>`,
	1
);

var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<span slot="tooltip">Redirect your domain to this URL.</span>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const $project = () => $.store_get(project, '$project', $$stores);
	const $isSubmitting = () => $.store_get($.get(isSubmitting), '$isSubmitting', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const binding_group = [];
	const routeBase = `${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/domains`;
	let formComponent;
	let isSubmitting = $.state($.proxy(writable(false)));
	let showConnectRepo = $.state(false);
	let behaviour = $.state('ACTIVE');
	let domainName = $.state('');
	let redirect = $.state(null);
	let branch = $.state(null);
	let statusCode = $.state($.proxy(StatusCode.TemporaryRedirect));

	onMount(() => {
		if (page.url.searchParams.has('connectRepo') && page.url.searchParams.get('connectRepo') === 'true') {
			$.set(showConnectRepo, true);
		}

		if (page.url.searchParams.has('domain')) {
			$.set(domainName, page.url.searchParams.get('domain'), true);
		}
	});

	async function addDomain() {
		const apexDomain = getApexDomain($.get(domainName));
		const isSiteDomain = $.get(domainName).endsWith($regionalConsoleVariables()._APP_DOMAIN_SITES);
		const domain = $$props.data.domainsList.domains.find((d) => d.domain === apexDomain);

		if (isCloud && apexDomain && !domain && !isSiteDomain) {
			try {
				await sdk.forConsole.domains.create({ teamId: $project().teamId, domain: apexDomain });
			} catch(error) {
				// apex might already be added on organization level, skip.
				const alreadyAdded = error?.type === 'domain_already_exists';

				if (!alreadyAdded) {
					addNotification({ type: 'error', message: error.message });

					return;
				}
			}
		}

		try {
			let rule;

			if ($.get(behaviour) === 'BRANCH') {
				rule = await sdk.forProject(page.params.region, page.params.project).proxy.createSiteRule({
					domain: $.get(domainName),
					siteId: page.params.site,
					branch: $.get(branch)
				});
			} else if ($.get(behaviour) === 'REDIRECT') {
				rule = await sdk.forProject(page.params.region, page.params.project).proxy.createRedirectRule({
					domain: $.get(domainName),
					url: $.get(redirect),
					statusCode: $.get(statusCode),
					resourceId: page.params.site,
					resourceType: ProxyResourceType.Site
				});
			} else if ($.get(behaviour) === 'ACTIVE') {
				rule = await sdk.forProject(page.params.region, page.params.project).proxy.createSiteRule({ domain: $.get(domainName), siteId: page.params.site });
			}

			await invalidate(Dependencies.SITES_DOMAINS);

			const verified = isProxyRuleVerified(rule?.status);

			if (verified) {
				addNotification({ type: 'success', message: 'Domain verified successfully' });
				await goto(routeBase);
			} else {
				await goto(`${routeBase}/add-domain/verify-${$.get(domainName)}?rule=${rule.$id}`);
			}
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
		}
	}

	async function connect(selectedInstallationId, selectedRepository) {
		try {
			await sdk.forProject(page.params.region, page.params.project).sites.update({
				siteId: $$props.data.site.$id,
				name: $$props.data.site.name,
				framework: $$props.data.site.framework,
				enabled: $$props.data.site.enabled,
				logging: $$props.data.site.logging || undefined,
				timeout: $$props.data.site.timeout,
				installCommand: $$props.data.site.installCommand,
				buildCommand: $$props.data.site.buildCommand,
				startCommand: $$props.data.site.startCommand,
				outputDirectory: $$props.data.site.outputDirectory,
				buildRuntime: $$props.data.site.buildRuntime,
				adapter: $$props.data.site.adapter,
				fallbackFile: $$props.data.site.fallbackFile,
				installationId: selectedInstallationId,
				providerRepositoryId: selectedRepository,
				providerBranch: 'main'
			});

			invalidate(Dependencies.SITE);
		} catch {
			return;
		}
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	Wizard(node, {
		title: 'Add domain',
		get href() {
			return routeBase;
		},
		column: true,
		columnSize: 's',
		confirmExit: true,
		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				Form($$anchor, {
					onSubmit: addDomain,
					get isSubmitting() {
						return $.get(isSubmitting);
					},

					set isSubmitting($$value) {
						$.store_unsub($.set(isSubmitting, $$value, true), '$isSubmitting', $$stores);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								gap: 'xxl',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									Fieldset(node_2, {
										legend: 'Domain',
										children: ($$anchor, $$slotProps) => {
											InputDomain($$anchor, {
												label: 'Domain',
												id: 'domain',
												required: true,
												placeholder: 'appwrite.example.com',
												get value() {
													return $.get(domainName);
												},

												set value($$value) {
													$.set(domainName, $$value, true);
												}
											});
										},
										$$slots: { default: true }
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Layout.Grid, ($$anchor, Layout_Grid) => {
										Layout_Grid($$anchor, {
											columns: 3,
											columnsXS: 1,
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												LabelCard(node_4, {
													value: 'ACTIVE',
													title: 'Active deployment',
													get group() {
														return $.get(behaviour);
													},

													set group($$value) {
														$.set(behaviour, $$value, true);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text('Point this domain to the latest deployed version.');

														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});

												var node_5 = $.sibling(node_4, 2);

												LabelCard(node_5, {
													value: 'BRANCH',
													title: 'Git branch',
													get group() {
														return $.get(behaviour);
													},

													set group($$value) {
														$.set(behaviour, $$value, true);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Point this domain to a specific branch in your repository.');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});

												var node_6 = $.sibling(node_5, 2);

												LabelCard(node_6, {
													value: 'REDIRECT',
													title: 'Redirect',
													get group() {
														return $.get(behaviour);
													},

													set group($$value) {
														$.set(behaviour, $$value, true);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Forward all traffic from this domain to another URL.');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									var node_7 = $.sibling(node_3, 2);

									{
										var consequent_1 = ($$anchor) => {
											Fieldset($$anchor, {
												legend: 'Settings',
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = $.comment();
													var node_8 = $.first_child(fragment_7);

													$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
														Layout_Stack_1($$anchor, {
															gap: 'xl',
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = $.comment();
																var node_9 = $.first_child(fragment_8);

																{
																	var consequent = ($$anchor) => {
																		BranchSelector($$anchor, {
																			get installationId() {
																				return $$props.data.site.installationId;
																			},

																			get repositoryId() {
																				return $$props.data.site.providerRepositoryId;
																			},

																			get value() {
																				return $.get(branch);
																			},

																			set value($$value) {
																				$.set(branch, $$value, true);
																			},
																			$$events: { select: (e) => $.set(branch, e.detail, true) }
																		});
																	};

																	var alternate = ($$anchor) => {
																		var fragment_10 = root_2();
																		var node_10 = $.first_child(fragment_10);

																		InputSelect(node_10, {
																			disabled: true,
																			options: [{ label: 'main', value: 'main' }],
																			label: 'Production branch',
																			id: 'branch',
																			required: true,
																			value: 'main',
																			placeholder: 'Select branch'
																		});

																		var node_11 = $.sibling(node_10, 2);

																		$.component(node_11, () => Alert.Inline, ($$anchor, Alert_Inline) => {
																			Alert_Inline($$anchor, {
																				title: ' There is no repository connected to your site',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_11 = $.comment();
																					var node_12 = $.first_child(fragment_11);

																					$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
																						Layout_Stack_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var fragment_12 = root_1();
																								var div = $.sibling($.first_child(fragment_12), 2);
																								var node_13 = $.child(div);

																								Button(node_13, {
																									compact: true,
																									$$events: { click: () => $.set(showConnectRepo, true) },
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_3 = $.text('Connect repository');

																										$.append($$anchor, text_3);
																									},
																									$$slots: { default: true }
																								});

																								$.reset(div);
																								$.append($$anchor, fragment_12);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_11);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_10);
																	};

																	$.if(node_9, ($$render) => {
																		if ($$props.data.site?.providerRepositoryId) $$render(consequent); else $$render(alternate, -1);
																	});
																}

																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										};

										var consequent_2 = ($$anchor) => {
											Fieldset($$anchor, {
												legend: 'Settings',
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = $.comment();
													var node_14 = $.first_child(fragment_14);

													$.component(node_14, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
														Layout_Stack_3($$anchor, {
															gap: 'xl',
															children: ($$anchor, $$slotProps) => {
																var fragment_15 = root_2();
																var node_15 = $.first_child(fragment_15);

																InputURL(node_15, {
																	label: 'Redirect to',
																	id: 'redirect',
																	placeholder: 'https://appwrite.io/docs',
																	required: true,
																	get value() {
																		return $.get(redirect);
																	},

																	set value($$value) {
																		$.set(redirect, $$value, true);
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
																						var span = root_3();

																						$.append($$anchor, span);
																					}
																				}
																			});
																		}
																	}
																});

																var node_16 = $.sibling(node_15, 2);

																InputSelect(node_16, {
																	get options() {
																		return statusCodeOptions;
																	},
																	label: 'Status code',
																	id: 'code',
																	required: true,
																	placeholder: 'Select status code',
																	get value() {
																		return $.get(statusCode);
																	},

																	set value($$value) {
																		$.set(statusCode, $$value, true);
																	}
																});

																$.append($$anchor, fragment_15);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_14);
												},
												$$slots: { default: true }
											});
										};

										$.if(node_7, ($$render) => {
											if ($.get(behaviour) === 'BRANCH') $$render(consequent_1); else if ($.get(behaviour) === 'REDIRECT') $$render(consequent_2, 1);
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
				($$value) => formComponent = $$value,
				() => formComponent
			);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_18 = root_2();
				var node_17 = $.first_child(fragment_18);

				Button(node_17, {
					secondary: true,
					get href() {
						return routeBase;
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Cancel');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});

				var node_18 = $.sibling(node_17, 2);

				Button(node_18, {
					get disabled() {
						$.mark_store_binding();

						return $isSubmitting();
					},

					set disabled($$value) {
						$.store_set($.get(isSubmitting), $$value);
					},
					$$events: { click: () => formComponent.triggerSubmit() },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Add');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_18);
			}
		}
	});

	var node_19 = $.sibling(node, 2);

	{
		var consequent_3 = ($$anchor) => {
			ConnectRepoModal($$anchor, {
				connect,
				product: 'sites',
				onlyExisting: true,
				callbackState: { connectRepo: 'true' },
				get show() {
					return $.get(showConnectRepo);
				},

				set show($$value) {
					$.set(showConnectRepo, $$value, true);
				}
			});
		};

		$.if(node_19, ($$render) => {
			if ($.get(showConnectRepo)) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
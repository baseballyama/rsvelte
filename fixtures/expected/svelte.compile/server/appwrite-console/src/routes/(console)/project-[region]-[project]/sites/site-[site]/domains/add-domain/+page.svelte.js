import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const routeBase = `${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/domains`;
		let { data } = $$props;
		let formComponent;
		let isSubmitting = writable(false);
		let showConnectRepo = false;
		let behaviour = 'ACTIVE';
		let domainName = '';
		let redirect = null;
		let branch = null;
		let statusCode = StatusCode.TemporaryRedirect;

		onMount(() => {
			if (page.url.searchParams.has('connectRepo') && page.url.searchParams.get('connectRepo') === 'true') {
				showConnectRepo = true;
			}

			if (page.url.searchParams.has('domain')) {
				domainName = page.url.searchParams.get('domain');
			}
		});

		async function addDomain() {
			const apexDomain = getApexDomain(domainName);
			const isSiteDomain = domainName.endsWith($.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)._APP_DOMAIN_SITES);
			const domain = data.domainsList.domains.find((d) => d.domain === apexDomain);

			if (isCloud && apexDomain && !domain && !isSiteDomain) {
				try {
					await sdk.forConsole.domains.create({
						teamId: $.store_get($$store_subs ??= {}, '$project', project).teamId,
						domain: apexDomain
					});
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

				if (behaviour === 'BRANCH') {
					rule = await sdk.forProject(page.params.region, page.params.project).proxy.createSiteRule({ domain: domainName, siteId: page.params.site, branch });
				} else if (behaviour === 'REDIRECT') {
					rule = await sdk.forProject(page.params.region, page.params.project).proxy.createRedirectRule({
						domain: domainName,
						url: redirect,
						statusCode,
						resourceId: page.params.site,
						resourceType: ProxyResourceType.Site
					});
				} else if (behaviour === 'ACTIVE') {
					rule = await sdk.forProject(page.params.region, page.params.project).proxy.createSiteRule({ domain: domainName, siteId: page.params.site });
				}

				await invalidate(Dependencies.SITES_DOMAINS);

				const verified = isProxyRuleVerified(rule?.status);

				if (verified) {
					addNotification({ type: 'success', message: 'Domain verified successfully' });
					await goto(routeBase);
				} else {
					await goto(`${routeBase}/add-domain/verify-${domainName}?rule=${rule.$id}`);
				}
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
			}
		}

		async function connect(selectedInstallationId, selectedRepository) {
			try {
				await sdk.forProject(page.params.region, page.params.project).sites.update({
					siteId: data.site.$id,
					name: data.site.name,
					framework: data.site.framework,
					enabled: data.site.enabled,
					logging: data.site.logging || undefined,
					timeout: data.site.timeout,
					installCommand: data.site.installCommand,
					buildCommand: data.site.buildCommand,
					startCommand: data.site.startCommand,
					outputDirectory: data.site.outputDirectory,
					buildRuntime: data.site.buildRuntime,
					adapter: data.site.adapter,
					fallbackFile: data.site.fallbackFile,
					installationId: selectedInstallationId,
					providerRepositoryId: selectedRepository,
					providerBranch: 'main'
				});

				invalidate(Dependencies.SITE);
			} catch {
				return;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				title: 'Add domain',
				href: routeBase,
				column: true,
				columnSize: 's',
				confirmExit: true,
				children: ($$renderer) => {
					Form($$renderer, {
						onSubmit: addDomain,
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
									gap: 'xxl',
									children: ($$renderer) => {
										Fieldset($$renderer, {
											legend: 'Domain',
											children: ($$renderer) => {
												InputDomain($$renderer, {
													label: 'Domain',
													id: 'domain',
													required: true,
													placeholder: 'appwrite.example.com',
													get value() {
														return domainName;
													},

													set value($$value) {
														domainName = $$value;
														$$settled = false;
													}
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										if (Layout.Grid) {
											$$renderer.push('<!--[-->');

											Layout.Grid($$renderer, {
												columns: 3,
												columnsXS: 1,
												children: ($$renderer) => {
													LabelCard($$renderer, {
														value: 'ACTIVE',
														title: 'Active deployment',
														get group() {
															return behaviour;
														},

														set group($$value) {
															behaviour = $$value;
															$$settled = false;
														},

														children: ($$renderer) => {
															$$renderer.push(`<!---->Point this domain to the latest deployed version.`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													LabelCard($$renderer, {
														value: 'BRANCH',
														title: 'Git branch',
														get group() {
															return behaviour;
														},

														set group($$value) {
															behaviour = $$value;
															$$settled = false;
														},

														children: ($$renderer) => {
															$$renderer.push(`<!---->Point this domain to a specific branch in your repository.`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													LabelCard($$renderer, {
														value: 'REDIRECT',
														title: 'Redirect',
														get group() {
															return behaviour;
														},

														set group($$value) {
															behaviour = $$value;
															$$settled = false;
														},

														children: ($$renderer) => {
															$$renderer.push(`<!---->Forward all traffic from this domain to another URL.`);
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

										if (behaviour === 'BRANCH') {
											$$renderer.push('<!--[0-->');

											Fieldset($$renderer, {
												legend: 'Settings',
												children: ($$renderer) => {
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 'xl',
															children: ($$renderer) => {
																if (data.site?.providerRepositoryId) {
																	$$renderer.push('<!--[0-->');

																	BranchSelector($$renderer, {
																		installationId: data.site.installationId,
																		repositoryId: data.site.providerRepositoryId,
																		get value() {
																			return branch;
																		},

																		set value($$value) {
																			branch = $$value;
																			$$settled = false;
																		}
																	});
																} else {
																	$$renderer.push('<!--[-1-->');

																	InputSelect($$renderer, {
																		disabled: true,
																		options: [{ label: 'main', value: 'main' }],
																		label: 'Production branch',
																		id: 'branch',
																		required: true,
																		value: 'main',
																		placeholder: 'Select branch'
																	});

																	$$renderer.push(`<!----> `);

																	if (Alert.Inline) {
																		$$renderer.push('<!--[-->');

																		Alert.Inline($$renderer, {
																			title: ' There is no repository connected to your site',
																			children: ($$renderer) => {
																				if (Layout.Stack) {
																					$$renderer.push('<!--[-->');

																					Layout.Stack($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<p>The domain will be connected to your active deployment.
                                        Connect your Git repository to link a production branch.</p> <div>`);

																							Button($$renderer, {
																								compact: true,
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Connect repository`);
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
										} else if (behaviour === 'REDIRECT') {
											$$renderer.push('<!--[1-->');

											Fieldset($$renderer, {
												legend: 'Settings',
												children: ($$renderer) => {
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															gap: 'xl',
															children: ($$renderer) => {
																InputURL($$renderer, {
																	label: 'Redirect to',
																	id: 'redirect',
																	placeholder: 'https://appwrite.io/docs',
																	required: true,
																	get value() {
																		return redirect;
																	},

																	set value($$value) {
																		redirect = $$value;
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
																						$$renderer.push(`<span slot="tooltip">Redirect your domain to this URL.</span>`);
																					}
																				}
																			});
																		}
																	}
																});

																$$renderer.push(`<!----> `);

																InputSelect($$renderer, {
																	options: statusCodeOptions,
																	label: 'Status code',
																	id: 'code',
																	required: true,
																	placeholder: 'Select status code',
																	get value() {
																		return statusCode;
																	},

																	set value($$value) {
																		statusCode = $$value;
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
								secondary: true,
								href: routeBase,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								get disabled() {
									return $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting);
								},

								set disabled($$value) {
									$.store_set(isSubmitting, $$value);
									$$settled = false;
								},

								children: ($$renderer) => {
									$$renderer.push(`<!---->Add`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			if (showConnectRepo) {
				$$renderer.push('<!--[0-->');

				ConnectRepoModal($$renderer, {
					connect,
					product: 'sites',
					onlyExisting: true,
					callbackState: { connectRepo: 'true' },
					get show() {
						return showConnectRepo;
					},

					set show($$value) {
						showConnectRepo = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
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
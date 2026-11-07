import * as $ from 'svelte/internal/server';
import { resolve } from '$app/paths';
import { page } from '$app/state';
import { Wizard } from '$lib/layout';
import { Layout, Typography, Icon, Lights, Step, Card } from '@appwrite.io/pink-svelte';
import { IconArrowSmRight } from '@appwrite.io/pink-icons-svelte';
import Check from './(components)/check.svelte';
import Button from '$lib/elements/forms/button.svelte';
import OpenOnMobileModal from '../../(components)/openOnMobileModal.svelte';
import SiteCard from '../../(components)/siteCard.svelte';
import { onMount } from 'svelte';
import AddCollaboratorModal from '../../(components)/addCollaboratorModal.svelte';
import { Click, trackEvent } from '$lib/actions/analytics';
import { invalidate } from '$app/navigation';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { ConnectRepoModal } from '$lib/components/git';
import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
		let showOpenOnMobile = false;
		let showConnectRepository = false;
		let showInviteCollaborator = false;
		const siteURL = $.derived(() => data.proxyRuleList.rules[0].domain);

		const siteRedirectHref = $.derived(() => {
			return resolve('/(console)/project-[region]-[project]/sites/site-[site]', {
				region: page.params.region,
				project: page.params.project,
				site: data.site.$id
			});
		});

		onMount(() => {
			if (page.url.searchParams.has('connectRepo') && page.url.searchParams.get('connectRepo') === 'true') {
				showConnectRepository = true;
			}
		});

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

				await invalidate(Dependencies.SITE);
			} catch {
				return;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				column: true,
				href: siteRedirectHref(),
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'xxxl',
							children: ($$renderer) => {
								$$renderer.push(`<div${$.attr_style('z-index: 6;', { position: 'relative' })}>`);

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										gap: 'xxxl',
										children: ($$renderer) => {
											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													gap: 'l',
													direction: 'column',
													alignItems: 'center',
													children: ($$renderer) => {
														Check($$renderer, {});
														$$renderer.push(`<!----> `);

														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																gap: 'xs',
																direction: 'column',
																alignItems: 'center',
																children: ($$renderer) => {
																	if (Typography.Title) {
																		$$renderer.push('<!--[-->');

																		Typography.Title($$renderer, {
																			size: 'l',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Congratulations!`);
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
																			variant: 'l-400',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->You deployed your Site successfully`);
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

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);
											Lights($$renderer, { style: 'top: -100px; height:200px; width: 50%' });
											$$renderer.push(`<!----> `);

											{
												function footer($$renderer) {
													Button($$renderer, {
														href: `${$.store_get($$store_subs ??= {}, '$regionalProtocol', regionalProtocol)}${siteURL()}`,
														external: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Visit site`);
														},
														$$slots: { default: true }
													});
												}

												SiteCard($$renderer, {
													variant: 'secondary',
													deployment: data.deployment,
													proxyRuleList: data.proxyRuleList,
													hideQRCode: true,
													footer,
													$$slots: { footer: true }
												});
											}

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</div> <div></div> `);

								if (Step.List) {
									$$renderer.push('<!--[-->');

									Step.List($$renderer, {
										children: ($$renderer) => {
											if (Step.Item) {
												$$renderer.push('<!--[-->');

												Step.Item($$renderer, {
													state: 'current',
													shortLine: true,
													badgeText: 'Next steps',
													children: ($$renderer) => {
														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																children: ($$renderer) => {
																	if (Layout.Grid) {
																		$$renderer.push('<!--[-->');

																		Layout.Grid($$renderer, {
																			columns: !data.site.providerRepositoryId ? 4 : 3,
																			columnsS: 1,
																			children: ($$renderer) => {
																				if (!data.site.providerRepositoryId) {
																					$$renderer.push('<!--[0-->');

																					if (Card.Button) {
																						$$renderer.push('<!--[-->');

																						Card.Button($$renderer, {
																							radius: 's',
																							padding: 's',
																							children: ($$renderer) => {
																								if (Layout.Stack) {
																									$$renderer.push('<!--[-->');

																									Layout.Stack($$renderer, {
																										gap: 's',
																										style: 'height: 100%',
																										children: ($$renderer) => {
																											if (Layout.Stack) {
																												$$renderer.push('<!--[-->');

																												Layout.Stack($$renderer, {
																													direction: 'row',
																													justifyContent: 'space-between',
																													alignItems: 'center',
																													children: ($$renderer) => {
																														if (Typography.Title) {
																															$$renderer.push('<!--[-->');

																															Typography.Title($$renderer, {
																																size: 's',
																																children: ($$renderer) => {
																																	$$renderer.push(`<!---->Add repository`);
																																},
																																$$slots: { default: true }
																															});

																															$$renderer.push('<!--]-->');
																														} else {
																															$$renderer.push('<!--[!-->');
																															$$renderer.push('<!--]-->');
																														}

																														$$renderer.push(` `);

																														Icon($$renderer, {
																															icon: IconArrowSmRight,
																															size: 'l',
																															color: '--fgcolor-neutral-weak'
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

																											if (Typography.Text) {
																												$$renderer.push('<!--[-->');

																												Typography.Text($$renderer, {
																													variant: 'm-400',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Connect to a new repository or an existing one.`);
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

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}
																				} else {
																					$$renderer.push('<!--[-1-->');
																				}

																				$$renderer.push(`<!--]--> `);

																				if (Card.Link) {
																					$$renderer.push('<!--[-->');

																					Card.Link($$renderer, {
																						radius: 's',
																						padding: 's',
																						href: `${siteRedirectHref()}/domains`,
																						children: ($$renderer) => {
																							if (Layout.Stack) {
																								$$renderer.push('<!--[-->');

																								Layout.Stack($$renderer, {
																									gap: 's',
																									style: 'height: 100%',
																									children: ($$renderer) => {
																										if (Layout.Stack) {
																											$$renderer.push('<!--[-->');

																											Layout.Stack($$renderer, {
																												direction: 'row',
																												justifyContent: 'space-between',
																												alignItems: 'center',
																												children: ($$renderer) => {
																													if (Typography.Title) {
																														$$renderer.push('<!--[-->');

																														Typography.Title($$renderer, {
																															size: 's',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->Add domain`);
																															},
																															$$slots: { default: true }
																														});

																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}

																													$$renderer.push(` `);

																													Icon($$renderer, {
																														icon: IconArrowSmRight,
																														size: 'l',
																														color: '--fgcolor-neutral-weak'
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

																										if (Typography.Text) {
																											$$renderer.push('<!--[-->');

																											Typography.Text($$renderer, {
																												variant: 'm-400',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Connect to an existing domain or add a new one.`);
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

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Card.Button) {
																					$$renderer.push('<!--[-->');

																					Card.Button($$renderer, {
																						radius: 's',
																						padding: 's',
																						children: ($$renderer) => {
																							if (Layout.Stack) {
																								$$renderer.push('<!--[-->');

																								Layout.Stack($$renderer, {
																									gap: 's',
																									style: 'height: 100%',
																									children: ($$renderer) => {
																										if (Layout.Stack) {
																											$$renderer.push('<!--[-->');

																											Layout.Stack($$renderer, {
																												direction: 'row',
																												justifyContent: 'space-between',
																												alignItems: 'center',
																												children: ($$renderer) => {
																													if (Typography.Title) {
																														$$renderer.push('<!--[-->');

																														Typography.Title($$renderer, {
																															size: 's',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->Share site`);
																															},
																															$$slots: { default: true }
																														});

																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}

																													$$renderer.push(` `);

																													Icon($$renderer, {
																														icon: IconArrowSmRight,
																														size: 'l',
																														color: '--fgcolor-neutral-weak'
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

																										if (Typography.Text) {
																											$$renderer.push('<!--[-->');

																											Typography.Text($$renderer, {
																												variant: 'm-400',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Share your progress and start collaborating with your team.`);
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

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Card.Button) {
																					$$renderer.push('<!--[-->');

																					Card.Button($$renderer, {
																						radius: 's',
																						padding: 's',
																						children: ($$renderer) => {
																							if (Layout.Stack) {
																								$$renderer.push('<!--[-->');

																								Layout.Stack($$renderer, {
																									gap: 's',
																									style: 'height: 100%',
																									children: ($$renderer) => {
																										if (Layout.Stack) {
																											$$renderer.push('<!--[-->');

																											Layout.Stack($$renderer, {
																												direction: 'row',
																												justifyContent: 'space-between',
																												alignItems: 'center',
																												children: ($$renderer) => {
																													if (Typography.Title) {
																														$$renderer.push('<!--[-->');

																														Typography.Title($$renderer, {
																															size: 's',
																															children: ($$renderer) => {
																																$$renderer.push(`<!---->Open on mobile`);
																															},
																															$$slots: { default: true }
																														});

																														$$renderer.push('<!--]-->');
																													} else {
																														$$renderer.push('<!--[!-->');
																														$$renderer.push('<!--]-->');
																													}

																													$$renderer.push(` `);

																													Icon($$renderer, {
																														icon: IconArrowSmRight,
																														size: 'l',
																														color: '--fgcolor-neutral-weak'
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

																										if (Typography.Text) {
																											$$renderer.push('<!--[-->');

																											Typography.Text($$renderer, {
																												variant: 'm-400',
																												children: ($$renderer) => {
																													$$renderer.push(`<!---->Open the preview of your site on any mobile or tablet device.`);
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

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							Button($$renderer, {
								size: 's',
								fullWidthMobile: true,
								secondary: true,
								href: siteRedirectHref(),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Go to dashboard`);
								},
								$$slots: { default: true }
							});
						}
					}
				}
			});

			$$renderer.push(`<!----> `);

			if (showConnectRepository) {
				$$renderer.push('<!--[0-->');

				ConnectRepoModal($$renderer, {
					connect,
					product: 'sites',
					callbackState: { connectRepo: 'true' },
					get show() {
						return showConnectRepository;
					},

					set show($$value) {
						showConnectRepository = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showOpenOnMobile) {
				$$renderer.push('<!--[0-->');

				OpenOnMobileModal($$renderer, {
					proxyRuleList: data.proxyRuleList,
					get show() {
						return showOpenOnMobile;
					},

					set show($$value) {
						showOpenOnMobile = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showInviteCollaborator) {
				$$renderer.push('<!--[0-->');

				AddCollaboratorModal($$renderer, {
					get show() {
						return showInviteCollaborator;
					},

					set show($$value) {
						showInviteCollaborator = $$value;
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
import * as $ from 'svelte/internal/server';
import { Card } from '$lib/components/index.js';
import { humanFileSize } from '$lib/helpers/sizeConvertion';
import { formatTimeDetailed } from '$lib/helpers/timeConversion';
import { ImageFormat } from '@appwrite.io/console';
import { page } from '$app/state';

import {
	Badge,
	Divider,
	Icon,
	Image,
	Layout,
	Status,
	Tooltip,
	Typography
} from '@appwrite.io/pink-svelte';

import { DeploymentSource, DeploymentCreatedBy } from '$lib/components/git';
import { IconInfo } from '@appwrite.io/pink-icons-svelte';
import OpenOnMobileModal from './openOnMobileModal.svelte';
import DeploymentDomains from '$lib/components/git/deploymentDomains.svelte';
import { app } from '$lib/stores/app';
import { base } from '$app/paths';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { capitalize } from '$lib/helpers/string';
import { getEffectiveBuildStatus } from '$lib/helpers/buildTimeout';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';
import { impersonatedResourceUrl } from '$lib/appwrite/impersonation';

export default function SiteCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			site,
			deployment,
			proxyRuleList,
			hideQRCode = false,
			variant = 'primary',
			footer
		} = $$props;

		let effectiveStatus = $.derived(() => getEffectiveBuildStatus(deployment, $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)));
		let show = false;
		const totalSize = $.derived(() => humanFileSize(deployment?.totalSize ?? 0));

		const sortedDomains = $.derived(() => proxyRuleList?.rules?.slice()?.sort((a, b) => {
			if (a?.trigger === 'manual' && b?.trigger !== 'manual') return -1;
			if (a?.trigger !== 'manual' && b?.trigger === 'manual') return 1;

			return 0;
		}));

		const primaryDomain = $.derived(() => sortedDomains()?.[0]?.domain);

		function getScreenshot(theme, deployment) {
			if (theme === 'dark') {
				return deployment.screenshotDark
					? getFilePreview(deployment.screenshotDark)
					: `${base}/images/sites/screenshot-placeholder-dark.svg`;
			} else {
				return deployment.screenshotLight
					? getFilePreview(deployment.screenshotLight)
					: `${base}/images/sites/screenshot-placeholder-light.svg`;
			}
		}

		function getFilePreview(fileId) {
			return $.store_get($$store_subs ??= {}, '$impersonatedResourceUrl', impersonatedResourceUrl)(sdk.forConsoleIn(page.params.region).storage.getFilePreview({
				bucketId: 'screenshots',
				fileId,
				width: 1024,
				height: 576,
				output: ImageFormat.Avif
			}));
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Card($$renderer, {
				padding: 's',
				radius: 'm',
				variant,
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'l',
							children: ($$renderer) => {
								$$renderer.push(`<div class="card-grid svelte-1tx0n9e">`);

								if (primaryDomain()) {
									$$renderer.push('<!--[0-->');

									Card($$renderer, {
										href: `${$.store_get($$store_subs ??= {}, '$regionalProtocol', regionalProtocol)}${primaryDomain()}`,
										padding: 'none',
										radius: 's',
										children: ($$renderer) => {
											Image($$renderer, {
												border: true,
												radius: 's',
												ratio: '16/9',
												style: 'width: 100%; align-self: start',
												src: getScreenshot($.store_get($$store_subs ??= {}, '$app', app).themeInUse, deployment),
												alt: 'Screenshot'
											});
										},
										$$slots: { default: true }
									});
								} else {
									$$renderer.push('<!--[-1-->');

									Image($$renderer, {
										border: true,
										radius: 's',
										ratio: '16/9',
										style: 'width: 100%; align-self: start',
										src: getScreenshot($.store_get($$store_subs ??= {}, '$app', app).themeInUse, deployment),
										alt: 'Screenshot'
									});
								}

								$$renderer.push(`<!--]--> `);

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										gap: 'xl',
										children: ($$renderer) => {
											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													direction: 'row',
													alignItems: 'flex-start',
													children: ($$renderer) => {
														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																gap: 'xxs',
																children: ($$renderer) => {
																	if (Typography.Text) {
																		$$renderer.push('<!--[-->');

																		Typography.Text($$renderer, {
																			variant: 'm-400',
																			color: '--fgcolor-neutral-tertiary',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Domains`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	DeploymentDomains($$renderer, {
																		domains: proxyRuleList,
																		hideQRCode,
																		showQR: () => show = !show
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

											$$renderer.push(` `);

											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													direction: 'row',
													gap: 'xl',
													children: ($$renderer) => {
														if (effectiveStatus() === 'failed') {
															$$renderer.push('<!--[0-->');

															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 'xxs',
																	inline: true,
																	children: ($$renderer) => {
																		if (Typography.Text) {
																			$$renderer.push('<!--[-->');

																			Typography.Text($$renderer, {
																				variant: 'm-400',
																				color: '--fgcolor-neutral-tertiary',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Status`);
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
																				color: '--fgcolor-neutral-primary',
																				children: ($$renderer) => {
																					Status($$renderer, {
																						status: effectiveStatus(),
																						label: capitalize(effectiveStatus())
																					});
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

															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 'xxs',
																	inline: true,
																	children: ($$renderer) => {
																		if (Typography.Text) {
																			$$renderer.push('<!--[-->');

																			Typography.Text($$renderer, {
																				variant: 'm-400',
																				color: '--fgcolor-neutral-tertiary',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Deployed`);
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
																				color: '--fgcolor-neutral-primary',
																				children: ($$renderer) => {
																					DeploymentCreatedBy($$renderer, { deployment });
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

											$$renderer.push(` `);

											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													gap: 'xxl',
													direction: 'row',
													wrap: 'wrap',
													children: ($$renderer) => {
														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																gap: 'xxl',
																direction: 'row',
																wrap: 'wrap',
																inline: true,
																children: ($$renderer) => {
																	if (deployment?.buildDuration) {
																		$$renderer.push('<!--[0-->');

																		if (Layout.Stack) {
																			$$renderer.push('<!--[-->');

																			Layout.Stack($$renderer, {
																				gap: 'xxs',
																				inline: true,
																				children: ($$renderer) => {
																					if (Typography.Text) {
																						$$renderer.push('<!--[-->');

																						Typography.Text($$renderer, {
																							variant: 'm-400',
																							color: '--fgcolor-neutral-tertiary',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->Build duration`);
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
																							color: '--fgcolor-neutral-primary',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(formatTimeDetailed(deployment.buildDuration))}`);
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

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			gap: 'xxs',
																			inline: true,
																			children: ($$renderer) => {
																				if (Typography.Text) {
																					$$renderer.push('<!--[-->');

																					Typography.Text($$renderer, {
																						variant: 'm-400',
																						color: '--fgcolor-neutral-tertiary',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Total size`);
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
																						color: '--fgcolor-neutral-primary',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(totalSize().value)}${$.escape(totalSize().unit)}`);
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

														if (Layout.Stack) {
															$$renderer.push('<!--[-->');

															Layout.Stack($$renderer, {
																gap: 'xxl',
																direction: 'row',
																wrap: 'wrap',
																inline: true,
																children: ($$renderer) => {
																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			gap: 'xxs',
																			inline: true,
																			children: ($$renderer) => {
																				if (Typography.Text) {
																					$$renderer.push('<!--[-->');

																					Typography.Text($$renderer, {
																						variant: 'm-400',
																						color: '--fgcolor-neutral-tertiary',
																						children: ($$renderer) => {
																							if (Layout.Stack) {
																								$$renderer.push('<!--[-->');

																								Layout.Stack($$renderer, {
																									direction: 'row',
																									gap: 'xxs',
																									alignItems: 'center',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->Global CDN `);

																										Tooltip($$renderer, {
																											children: ($$renderer) => {
																												Icon($$renderer, { icon: IconInfo, size: 's' });
																											},

																											$$slots: {
																												default: true,
																												tooltip: ($$renderer) => {
																													$$renderer.push(`<span slot="tooltip">Optimized speed by caching content on servers closer to
                                            users.</span>`);
																												}
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

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Layout.Stack) {
																					$$renderer.push('<!--[-->');

																					Layout.Stack($$renderer, {
																						inline: true,
																						alignItems: 'flex-start',
																						children: ($$renderer) => {
																							Badge($$renderer, {
																								size: 'xs',
																								variant: 'secondary',
																								type: isCloud ? 'success' : null,
																								content: isCloud ? 'Connected' : 'Available on Cloud'
																							});
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

																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			gap: 'xxs',
																			inline: true,
																			children: ($$renderer) => {
																				if (Typography.Text) {
																					$$renderer.push('<!--[-->');

																					Typography.Text($$renderer, {
																						variant: 'm-400',
																						color: '--fgcolor-neutral-tertiary',
																						children: ($$renderer) => {
																							if (Layout.Stack) {
																								$$renderer.push('<!--[-->');

																								Layout.Stack($$renderer, {
																									direction: 'row',
																									gap: 'xxs',
																									alignItems: 'center',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->DDoS protection `);

																										Tooltip($$renderer, {
																											children: ($$renderer) => {
																												Icon($$renderer, { icon: IconInfo, size: 's' });
																											},

																											$$slots: {
																												default: true,
																												tooltip: ($$renderer) => {
																													$$renderer.push(`<span slot="tooltip">Safeguards your site by detecting and blocking malicious
                                            traffic.</span>`);
																												}
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

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` `);

																				if (Layout.Stack) {
																					$$renderer.push('<!--[-->');

																					Layout.Stack($$renderer, {
																						inline: true,
																						alignItems: 'flex-start',
																						children: ($$renderer) => {
																							Badge($$renderer, {
																								size: 'xs',
																								variant: 'secondary',
																								type: isCloud ? 'success' : null,
																								content: isCloud ? 'Connected' : 'Available on Cloud'
																							});
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

											$$renderer.push(` `);

											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													gap: 'xxs',
													inline: true,
													style: 'width: min-content;',
													children: ($$renderer) => {
														if (Typography.Text) {
															$$renderer.push('<!--[-->');

															Typography.Text($$renderer, {
																variant: 'm-400',
																color: '--fgcolor-neutral-tertiary',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Source`);
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
																color: '--fgcolor-neutral-primary',
																children: ($$renderer) => {
																	DeploymentSource($$renderer, {
																		deployment,
																		resource: site,
																		region: page.params.region,
																		project: page.params.project
																	});
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

								$$renderer.push(`</div> `);

								if (footer) {
									$$renderer.push(`<!--[0--><span style="margin-left: calc(-1* var(--space-7));margin-right: calc(-1* var(--space-7));width:auto;">`);
									Divider($$renderer, {});
									$$renderer.push(`<!----></span> `);

									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'row-reverse',
											children: ($$renderer) => {
												footer?.($$renderer);
												$$renderer.push(`<!---->`);
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

			$$renderer.push(`<!----> `);

			if (show && proxyRuleList.total) {
				$$renderer.push('<!--[0-->');

				OpenOnMobileModal($$renderer, {
					proxyRuleList,
					get show() {
						return show;
					},

					set show($$value) {
						show = $$value;
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
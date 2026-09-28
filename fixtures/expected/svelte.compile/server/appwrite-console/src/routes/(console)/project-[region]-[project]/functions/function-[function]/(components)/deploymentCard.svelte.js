import * as $ from 'svelte/internal/server';
import { Card, Id, SvgIcon } from '$lib/components/index.js';
import { humanFileSize } from '$lib/helpers/sizeConvertion';
import { formatTimeDetailed } from '$lib/helpers/timeConversion';
import { Badge, Divider, Icon, Layout, Status, Tooltip, Typography } from '@appwrite.io/pink-svelte';
import { DeploymentSource, DeploymentCreatedBy, DeploymentDomains } from '$lib/components/git';
import { func } from '../store';
import { capitalize } from '$lib/helpers/string';
import { getEffectiveBuildStatus } from '$lib/helpers/buildTimeout';
import { deploymentStatusConverter } from '$lib/stores/git';
import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
import { isCloud } from '$lib/system';
import { IconInfo } from '@appwrite.io/pink-icons-svelte';
import Link from '$lib/elements/link.svelte';
import { base } from '$app/paths';
import { page } from '$app/state';

function titleSnippet($$renderer, title) {
	if (Typography.Text) {
		$$renderer.push('<!--[-->');

		Typography.Text($$renderer, {
			variant: 'm-400',
			color: '--fgcolor-neutral-tertiary',
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(title)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}

function textGroup($$renderer, title, text) {
	if (Layout.Stack) {
		$$renderer.push('<!--[-->');

		Layout.Stack($$renderer, {
			gap: 'xxs',
			inline: true,
			children: ($$renderer) => {
				titleSnippet($$renderer, title);
				$$renderer.push(`<!----> `);

				if (Typography.Text) {
					$$renderer.push('<!--[-->');

					Typography.Text($$renderer, {
						variant: 'm-400',
						color: '--fgcolor-neutral-primary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(text)}`);
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

function protection($$renderer, text, tooltip) {
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
										$$renderer.push(`<!---->${$.escape(text)} `);

										Tooltip($$renderer, {
											children: ($$renderer) => {
												Icon($$renderer, { icon: IconInfo, size: 's' });
											},

											$$slots: {
												default: true,
												tooltip: ($$renderer) => {
													$$renderer.push(`<span slot="tooltip">${$.escape(tooltip)}</span>`);
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
}

export default function DeploymentCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			deployment,
			proxyRuleList,
			variant = 'primary',
			activeDeployment = false,
			footer
		} = $$props;

		const effectiveStatus = $.derived(() => getEffectiveBuildStatus(deployment, $.store_get($$store_subs ??= {}, '$regionalConsoleVariables', regionalConsoleVariables)));
		const displayStatus = $.derived(() => effectiveStatus() === 'finalizing' ? 'ready' : effectiveStatus());
		const totalSize = $.derived(() => humanFileSize(deployment?.totalSize ?? 0));

		Card($$renderer, {
			padding: 'm',
			radius: 'm',
			variant,
			children: ($$renderer) => {
				if (Layout.Stack) {
					$$renderer.push('<!--[-->');

					Layout.Stack($$renderer, {
						gap: 'l',
						children: ($$renderer) => {
							if (Layout.GridFraction) {
								$$renderer.push('<!--[-->');

								Layout.GridFraction($$renderer, {
									start: 4,
									end: 6,
									children: ($$renderer) => {
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												children: ($$renderer) => {
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															direction: 'row',
															alignItems: 'center',
															gap: 's',
															wrap: 'wrap',
															children: ($$renderer) => {
																if (activeDeployment) {
																	$$renderer.push('<!--[0-->');

																	if (Typography.Title) {
																		$$renderer.push('<!--[-->');

																		Typography.Title($$renderer, {
																			size: 's',
																			variant: 'l-500',
																			color: '--fgcolor-neutral-primary',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Active deployment`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` <div>`);

																	Id($$renderer, {
																		value: deployment.$id,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(deployment.$id)}`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push(`<!----></div>`);
																} else {
																	$$renderer.push('<!--[-1-->');

																	if (Typography.Title) {
																		$$renderer.push('<!--[-->');

																		Typography.Title($$renderer, {
																			size: 's',
																			variant: 'l-500',
																			color: '--fgcolor-neutral-primary',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Deployment overview`);
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

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

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
																			titleSnippet($$renderer, 'Domains');
																			$$renderer.push(`<!----> `);

																			if ($.store_get($$store_subs ??= {}, '$func', func).deploymentId === deployment.$id) {
																				$$renderer.push('<!--[0-->');
																				DeploymentDomains($$renderer, { domains: proxyRuleList });
																			} else {
																				$$renderer.push('<!--[-1-->');

																				if (Typography.Text) {
																					$$renderer.push('<!--[-->');

																					Typography.Text($$renderer, {
																						variant: 'm-400',
																						color: '--fgcolor-neutral-primary',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Only the `);

																							Link($$renderer, {
																								href: `${base}/project-${page.params.region}-${page.params.project}/functions/function-${$.store_get($$store_subs ??= {}, '$func', func).$id}/deployment-${$.store_get($$store_subs ??= {}, '$func', func).deploymentId}`,
																								variant: 'default',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->active deployment`);
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push(`<!----> has a domain.`);
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
																				titleSnippet($$renderer, 'Status');
																				$$renderer.push(`<!----> `);

																				if (Typography.Text) {
																					$$renderer.push('<!--[-->');

																					Typography.Text($$renderer, {
																						variant: 'm-400',
																						color: '--fgcolor-neutral-primary',
																						children: ($$renderer) => {
																							Status($$renderer, {
																								status: deploymentStatusConverter(displayStatus()),
																								label: displayStatus()
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
																				textGroup($$renderer, 'Build duration', formatTimeDetailed(deployment.buildDuration));
																			} else {
																				$$renderer.push('<!--[-1-->');
																			}

																			$$renderer.push(`<!--]--> `);
																			textGroup($$renderer, 'Total size', `${totalSize().value} ${totalSize().unit}`);
																			$$renderer.push(`<!----> `);

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					gap: 'xxs',
																					inline: true,
																					children: ($$renderer) => {
																						titleSnippet($$renderer, 'Runtime');
																						$$renderer.push(`<!----> `);

																						if (Typography.Text) {
																							$$renderer.push('<!--[-->');

																							Typography.Text($$renderer, {
																								variant: 'm-400',
																								color: '--fgcolor-neutral-primary',
																								children: ($$renderer) => {
																									if (Layout.Stack) {
																										$$renderer.push('<!--[-->');

																										Layout.Stack($$renderer, {
																											direction: 'row',
																											gap: 'xxs',
																											alignItems: 'center',
																											children: ($$renderer) => {
																												SvgIcon($$renderer, {
																													size: 16,
																													iconSize: 'small',
																													name: $.store_get($$store_subs ??= {}, '$func', func).runtime.split('-')[0]
																												});

																												$$renderer.push(`<!----> ${$.escape(capitalize($.store_get($$store_subs ??= {}, '$func', func).runtime))}`);
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
																protection($$renderer, 'Global CDN', 'Optimized speed by caching content on servers closer to users.');
																$$renderer.push(`<!----> `);
																protection($$renderer, 'DDoS protection', 'Safeguards your site by detecting and blocking malicious traffic.');
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
															gap: 'xxs',
															inline: true,
															style: 'width: min-content;',
															children: ($$renderer) => {
																titleSnippet($$renderer, 'Source');
																$$renderer.push(`<!----> `);

																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		variant: 'm-400',
																		color: '--fgcolor-neutral-primary',
																		children: ($$renderer) => {
																			$$renderer.push(`<div>`);

																			DeploymentSource($$renderer, {
																				deployment,
																				resource: $.store_get($$store_subs ??= {}, '$func', func),
																				region: page.params.region,
																				project: page.params.project
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

							if (footer) {
								$$renderer.push(`<!--[0--><span style="margin-left: calc(-1* var(--space-9));margin-right: calc(-1* var(--space-9));width:auto;">`);
								Divider($$renderer, {});
								$$renderer.push(`<!----></span> `);

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row-reverse',
										children: ($$renderer) => {
											footer($$renderer);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
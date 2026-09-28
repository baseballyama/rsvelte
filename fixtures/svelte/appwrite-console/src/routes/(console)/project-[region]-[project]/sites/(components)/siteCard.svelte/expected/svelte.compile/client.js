import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(`<span slot="tooltip">Optimized speed by caching content on servers closer to
                                            users.</span>`);

var root_2 = $.from_html(`Global CDN <!>`, 1);

var root_3 = $.from_html(`<span slot="tooltip">Safeguards your site by detecting and blocking malicious
                                            traffic.</span>`);

var root_4 = $.from_html(`DDoS protection <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<span style="margin-left: calc(-1* var(--space-7));margin-right: calc(-1* var(--space-7));width:auto;"><!></span> <!>`, 1);
var root_7 = $.from_html(`<div class="card-grid svelte-1tx0n9e"><!> <!></div> <!>`, 1);

export default function SiteCard($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const $impersonatedResourceUrl = () => $.store_get(impersonatedResourceUrl, '$impersonatedResourceUrl', $$stores);
	const $regionalProtocol = () => $.store_get(regionalProtocol, '$regionalProtocol', $$stores);
	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let hideQRCode = $.prop($$props, 'hideQRCode', 3, false),
		variant = $.prop($$props, 'variant', 3, 'primary');

	let effectiveStatus = $.derived(() => getEffectiveBuildStatus($$props.deployment, $regionalConsoleVariables()));
	let show = $.state(false);
	const totalSize = $.derived(() => humanFileSize($$props.deployment?.totalSize ?? 0));

	const sortedDomains = $.derived(() => $$props.proxyRuleList?.rules?.slice()?.sort((a, b) => {
		if (a?.trigger === 'manual' && b?.trigger !== 'manual') return -1;
		if (a?.trigger !== 'manual' && b?.trigger === 'manual') return 1;

		return 0;
	}));

	const primaryDomain = $.derived(() => $.get(sortedDomains)?.[0]?.domain);

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
		return $impersonatedResourceUrl()(sdk.forConsoleIn(page.params.region).storage.getFilePreview({
			bucketId: 'screenshots',
			fileId,
			width: 1024,
			height: 576,
			output: ImageFormat.Avif
		}));
	}

	var fragment = root();
	var node = $.first_child(fragment);

	Card(node, {
		padding: 's',
		radius: 'm',
		get variant() {
			return variant();
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 'l',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_7();
						var div = $.first_child(fragment_2);
						var node_2 = $.child(div);

						{
							var consequent = ($$anchor) => {
								{
									let $0 = $.derived(() => `${$regionalProtocol()}${$.get(primaryDomain)}`);

									Card($$anchor, {
										get href() {
											return $.get($0);
										},
										padding: 'none',
										radius: 's',
										children: ($$anchor, $$slotProps) => {
											{
												let $0 = $.derived(() => getScreenshot($app().themeInUse, $$props.deployment));

												Image($$anchor, {
													border: true,
													radius: 's',
													ratio: '16/9',
													style: 'width: 100%; align-self: start',
													get src() {
														return $.get($0);
													},
													alt: 'Screenshot'
												});
											}
										},
										$$slots: { default: true }
									});
								}
							};

							var alternate = ($$anchor) => {
								{
									let $0 = $.derived(() => getScreenshot($app().themeInUse, $$props.deployment));

									Image($$anchor, {
										border: true,
										radius: 's',
										ratio: '16/9',
										style: 'width: 100%; align-self: start',
										get src() {
											return $.get($0);
										},
										alt: 'Screenshot'
									});
								}
							};

							$.if(node_2, ($$render) => {
								if ($.get(primaryDomain)) $$render(consequent); else $$render(alternate, -1);
							});
						}

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								gap: 'xl',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_5();
									var node_4 = $.first_child(fragment_6);

									$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
										Layout_Stack_2($$anchor, {
											direction: 'row',
											alignItems: 'flex-start',
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = $.comment();
												var node_5 = $.first_child(fragment_7);

												$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
													Layout_Stack_3($$anchor, {
														gap: 'xxs',
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root();
															var node_6 = $.first_child(fragment_8);

															$.component(node_6, () => Typography.Text, ($$anchor, Typography_Text) => {
																Typography_Text($$anchor, {
																	variant: 'm-400',
																	color: '--fgcolor-neutral-tertiary',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('Domains');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var node_7 = $.sibling(node_6, 2);

															DeploymentDomains(node_7, {
																get domains() {
																	return $$props.proxyRuleList;
																},

																get hideQRCode() {
																	return hideQRCode();
																},
																showQR: () => $.set(show, !$.get(show))
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
									});

									var node_8 = $.sibling(node_4, 2);

									$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
										Layout_Stack_4($$anchor, {
											direction: 'row',
											gap: 'xl',
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = $.comment();
												var node_9 = $.first_child(fragment_9);

												{
													var consequent_1 = ($$anchor) => {
														var fragment_10 = $.comment();
														var node_10 = $.first_child(fragment_10);

														$.component(node_10, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
															Layout_Stack_5($$anchor, {
																gap: 'xxs',
																inline: true,
																children: ($$anchor, $$slotProps) => {
																	var fragment_11 = root();
																	var node_11 = $.first_child(fragment_11);

																	$.component(node_11, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																		Typography_Text_1($$anchor, {
																			variant: 'm-400',
																			color: '--fgcolor-neutral-tertiary',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_1 = $.text('Status');

																				$.append($$anchor, text_1);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_12 = $.sibling(node_11, 2);

																	$.component(node_12, () => Typography.Text, ($$anchor, Typography_Text_2) => {
																		Typography_Text_2($$anchor, {
																			variant: 'm-400',
																			color: '--fgcolor-neutral-primary',
																			children: ($$anchor, $$slotProps) => {
																				{
																					let $0 = $.derived(() => capitalize($.get(effectiveStatus)));

																					Status($$anchor, {
																						get status() {
																							return $.get(effectiveStatus);
																						},

																						get label() {
																							return $.get($0);
																						}
																					});
																				}
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

													var alternate_1 = ($$anchor) => {
														var fragment_13 = $.comment();
														var node_13 = $.first_child(fragment_13);

														$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
															Layout_Stack_6($$anchor, {
																gap: 'xxs',
																inline: true,
																children: ($$anchor, $$slotProps) => {
																	var fragment_14 = root();
																	var node_14 = $.first_child(fragment_14);

																	$.component(node_14, () => Typography.Text, ($$anchor, Typography_Text_3) => {
																		Typography_Text_3($$anchor, {
																			variant: 'm-400',
																			color: '--fgcolor-neutral-tertiary',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_2 = $.text('Deployed');

																				$.append($$anchor, text_2);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_15 = $.sibling(node_14, 2);

																	$.component(node_15, () => Typography.Text, ($$anchor, Typography_Text_4) => {
																		Typography_Text_4($$anchor, {
																			variant: 'm-400',
																			color: '--fgcolor-neutral-primary',
																			children: ($$anchor, $$slotProps) => {
																				DeploymentCreatedBy($$anchor, {
																					get deployment() {
																						return $$props.deployment;
																					}
																				});
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_14);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_13);
													};

													$.if(node_9, ($$render) => {
														if ($.get(effectiveStatus) === 'failed') $$render(consequent_1); else $$render(alternate_1, -1);
													});
												}

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_8, 2);

									$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
										Layout_Stack_7($$anchor, {
											gap: 'xxl',
											direction: 'row',
											wrap: 'wrap',
											children: ($$anchor, $$slotProps) => {
												var fragment_16 = root();
												var node_17 = $.first_child(fragment_16);

												$.component(node_17, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
													Layout_Stack_8($$anchor, {
														gap: 'xxl',
														direction: 'row',
														wrap: 'wrap',
														inline: true,
														children: ($$anchor, $$slotProps) => {
															var fragment_17 = root();
															var node_18 = $.first_child(fragment_17);

															{
																var consequent_2 = ($$anchor) => {
																	var fragment_18 = $.comment();
																	var node_19 = $.first_child(fragment_18);

																	$.component(node_19, () => Layout.Stack, ($$anchor, Layout_Stack_9) => {
																		Layout_Stack_9($$anchor, {
																			gap: 'xxs',
																			inline: true,
																			children: ($$anchor, $$slotProps) => {
																				var fragment_19 = root();
																				var node_20 = $.first_child(fragment_19);

																				$.component(node_20, () => Typography.Text, ($$anchor, Typography_Text_5) => {
																					Typography_Text_5($$anchor, {
																						variant: 'm-400',
																						color: '--fgcolor-neutral-tertiary',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_3 = $.text('Build duration');

																							$.append($$anchor, text_3);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_21 = $.sibling(node_20, 2);

																				$.component(node_21, () => Typography.Text, ($$anchor, Typography_Text_6) => {
																					Typography_Text_6($$anchor, {
																						variant: 'm-400',
																						color: '--fgcolor-neutral-primary',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_4 = $.text();

																							$.template_effect(($0) => $.set_text(text_4, $0), [() => formatTimeDetailed($$props.deployment.buildDuration)]);
																							$.append($$anchor, text_4);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_19);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_18);
																};

																$.if(node_18, ($$render) => {
																	if ($$props.deployment?.buildDuration) $$render(consequent_2);
																});
															}

															var node_22 = $.sibling(node_18, 2);

															$.component(node_22, () => Layout.Stack, ($$anchor, Layout_Stack_10) => {
																Layout_Stack_10($$anchor, {
																	gap: 'xxs',
																	inline: true,
																	children: ($$anchor, $$slotProps) => {
																		var fragment_21 = root();
																		var node_23 = $.first_child(fragment_21);

																		$.component(node_23, () => Typography.Text, ($$anchor, Typography_Text_7) => {
																			Typography_Text_7($$anchor, {
																				variant: 'm-400',
																				color: '--fgcolor-neutral-tertiary',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_5 = $.text('Total size');

																					$.append($$anchor, text_5);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_24 = $.sibling(node_23, 2);

																		$.component(node_24, () => Typography.Text, ($$anchor, Typography_Text_8) => {
																			Typography_Text_8($$anchor, {
																				variant: 'm-400',
																				color: '--fgcolor-neutral-primary',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_6 = $.text();

																					$.template_effect(() => $.set_text(text_6, `${$.get(totalSize).value ?? ''}${$.get(totalSize).unit ?? ''}`));
																					$.append($$anchor, text_6);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_21);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_17);
														},
														$$slots: { default: true }
													});
												});

												var node_25 = $.sibling(node_17, 2);

												$.component(node_25, () => Layout.Stack, ($$anchor, Layout_Stack_11) => {
													Layout_Stack_11($$anchor, {
														gap: 'xxl',
														direction: 'row',
														wrap: 'wrap',
														inline: true,
														children: ($$anchor, $$slotProps) => {
															var fragment_23 = root();
															var node_26 = $.first_child(fragment_23);

															$.component(node_26, () => Layout.Stack, ($$anchor, Layout_Stack_12) => {
																Layout_Stack_12($$anchor, {
																	gap: 'xxs',
																	inline: true,
																	children: ($$anchor, $$slotProps) => {
																		var fragment_24 = root();
																		var node_27 = $.first_child(fragment_24);

																		$.component(node_27, () => Typography.Text, ($$anchor, Typography_Text_9) => {
																			Typography_Text_9($$anchor, {
																				variant: 'm-400',
																				color: '--fgcolor-neutral-tertiary',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_25 = $.comment();
																					var node_28 = $.first_child(fragment_25);

																					$.component(node_28, () => Layout.Stack, ($$anchor, Layout_Stack_13) => {
																						Layout_Stack_13($$anchor, {
																							direction: 'row',
																							gap: 'xxs',
																							alignItems: 'center',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var fragment_26 = root_2();
																								var node_29 = $.sibling($.first_child(fragment_26));

																								Tooltip(node_29, {
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
																											var span = root_1();

																											$.append($$anchor, span);
																										}
																									}
																								});

																								$.append($$anchor, fragment_26);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_25);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_30 = $.sibling(node_27, 2);

																		$.component(node_30, () => Layout.Stack, ($$anchor, Layout_Stack_14) => {
																			Layout_Stack_14($$anchor, {
																				inline: true,
																				alignItems: 'flex-start',
																				children: ($$anchor, $$slotProps) => {
																					{
																						let $0 = $.derived(() => isCloud ? 'success' : null);
																						let $1 = $.derived(() => isCloud ? 'Connected' : 'Available on Cloud');

																						Badge($$anchor, {
																							size: 'xs',
																							variant: 'secondary',
																							get type() {
																								return $.get($0);
																							},

																							get content() {
																								return $.get($1);
																							}
																						});
																					}
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_24);
																	},
																	$$slots: { default: true }
																});
															});

															var node_31 = $.sibling(node_26, 2);

															$.component(node_31, () => Layout.Stack, ($$anchor, Layout_Stack_15) => {
																Layout_Stack_15($$anchor, {
																	gap: 'xxs',
																	inline: true,
																	children: ($$anchor, $$slotProps) => {
																		var fragment_29 = root();
																		var node_32 = $.first_child(fragment_29);

																		$.component(node_32, () => Typography.Text, ($$anchor, Typography_Text_10) => {
																			Typography_Text_10($$anchor, {
																				variant: 'm-400',
																				color: '--fgcolor-neutral-tertiary',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_30 = $.comment();
																					var node_33 = $.first_child(fragment_30);

																					$.component(node_33, () => Layout.Stack, ($$anchor, Layout_Stack_16) => {
																						Layout_Stack_16($$anchor, {
																							direction: 'row',
																							gap: 'xxs',
																							alignItems: 'center',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var fragment_31 = root_4();
																								var node_34 = $.sibling($.first_child(fragment_31));

																								Tooltip(node_34, {
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
																											var span_1 = root_3();

																											$.append($$anchor, span_1);
																										}
																									}
																								});

																								$.append($$anchor, fragment_31);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_30);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_35 = $.sibling(node_32, 2);

																		$.component(node_35, () => Layout.Stack, ($$anchor, Layout_Stack_17) => {
																			Layout_Stack_17($$anchor, {
																				inline: true,
																				alignItems: 'flex-start',
																				children: ($$anchor, $$slotProps) => {
																					{
																						let $0 = $.derived(() => isCloud ? 'success' : null);
																						let $1 = $.derived(() => isCloud ? 'Connected' : 'Available on Cloud');

																						Badge($$anchor, {
																							size: 'xs',
																							variant: 'secondary',
																							get type() {
																								return $.get($0);
																							},

																							get content() {
																								return $.get($1);
																							}
																						});
																					}
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_29);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_23);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_16);
											},
											$$slots: { default: true }
										});
									});

									var node_36 = $.sibling(node_16, 2);

									$.component(node_36, () => Layout.Stack, ($$anchor, Layout_Stack_18) => {
										Layout_Stack_18($$anchor, {
											gap: 'xxs',
											inline: true,
											style: 'width: min-content;',
											children: ($$anchor, $$slotProps) => {
												var fragment_34 = root();
												var node_37 = $.first_child(fragment_34);

												$.component(node_37, () => Typography.Text, ($$anchor, Typography_Text_11) => {
													Typography_Text_11($$anchor, {
														variant: 'm-400',
														color: '--fgcolor-neutral-tertiary',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('Source');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_38 = $.sibling(node_37, 2);

												$.component(node_38, () => Typography.Text, ($$anchor, Typography_Text_12) => {
													Typography_Text_12($$anchor, {
														variant: 'm-400',
														color: '--fgcolor-neutral-primary',
														children: ($$anchor, $$slotProps) => {
															DeploymentSource($$anchor, {
																get deployment() {
																	return $$props.deployment;
																},

																get resource() {
																	return $$props.site;
																},

																get region() {
																	return page.params.region;
																},

																get project() {
																	return page.params.project;
																}
															});
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_34);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div);

						var node_39 = $.sibling(div, 2);

						{
							var consequent_3 = ($$anchor) => {
								var fragment_36 = root_6();
								var span_2 = $.first_child(fragment_36);
								var node_40 = $.child(span_2);

								Divider(node_40, {});
								$.reset(span_2);

								var node_41 = $.sibling(span_2, 2);

								$.component(node_41, () => Layout.Stack, ($$anchor, Layout_Stack_19) => {
									Layout_Stack_19($$anchor, {
										direction: 'row-reverse',
										children: ($$anchor, $$slotProps) => {
											var fragment_37 = $.comment();
											var node_42 = $.first_child(fragment_37);

											$.snippet(node_42, () => $$props.footer ?? $.noop);
											$.append($$anchor, fragment_37);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_36);
							};

							$.if(node_39, ($$render) => {
								if ($$props.footer) $$render(consequent_3);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_43 = $.sibling(node, 2);

	{
		var consequent_4 = ($$anchor) => {
			OpenOnMobileModal($$anchor, {
				get proxyRuleList() {
					return $$props.proxyRuleList;
				},

				get show() {
					return $.get(show);
				},

				set show($$value) {
					$.set(show, $$value, true);
				}
			});
		};

		$.if(node_43, ($$render) => {
			if ($.get(show) && $$props.proxyRuleList.total) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
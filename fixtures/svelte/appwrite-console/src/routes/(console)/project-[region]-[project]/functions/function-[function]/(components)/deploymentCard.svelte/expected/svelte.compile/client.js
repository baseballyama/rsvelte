import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

const titleSnippet = ($$anchor, title = $.noop) => {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Typography.Text, ($$anchor, Typography_Text) => {
		Typography_Text($$anchor, {
			variant: 'm-400',
			color: '--fgcolor-neutral-tertiary',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, title()));
				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
};

const textGroup = ($$anchor, title = $.noop, text = $.noop) => {
	var fragment_2 = $.comment();
	var node_1 = $.first_child(fragment_2);

	$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 'xxs',
			inline: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root();
				var node_2 = $.first_child(fragment_3);

				titleSnippet(node_2, title);

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text_1) => {
					Typography_Text_1($$anchor, {
						variant: 'm-400',
						color: '--fgcolor-neutral-primary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, text()));
							$.append($$anchor, text_2);
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
};

const protection = ($$anchor, text = $.noop, tooltip = $.noop) => {
	var fragment_5 = $.comment();
	var node_4 = $.first_child(fragment_5);

	$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
		Layout_Stack_1($$anchor, {
			gap: 'xxs',
			inline: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root();
				var node_5 = $.first_child(fragment_6);

				$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text_2) => {
					Typography_Text_2($$anchor, {
						variant: 'm-400',
						color: '--fgcolor-neutral-tertiary',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_6 = $.first_child(fragment_7);

							$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
								Layout_Stack_2($$anchor, {
									direction: 'row',
									gap: 'xxs',
									alignItems: 'center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_8 = root_2();
										var text_3 = $.first_child(fragment_8);
										var node_7 = $.sibling(text_3);

										Tooltip(node_7, {
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
													var text_4 = $.only_child(span, true);

													$.template_effect(() => $.set_text(text_4, tooltip()));
													$.append($$anchor, span);
												}
											}
										});

										$.template_effect(() => $.set_text(text_3, `${text() ?? ''} `));
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

				var node_8 = $.sibling(node_5, 2);

				$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
					Layout_Stack_3($$anchor, {
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

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment_5);
};

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span slot="tooltip"> </span>`);
var root_2 = $.from_html(` <!>`, 1);
var root_3 = $.from_html(`<!> <div><!></div>`, 1);
var root_4 = $.from_html(`Only the <!> has a domain.`, 1);
var root_5 = $.from_html(`<!> `, 1);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<div><!></div>`);
var root_8 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_9 = $.from_html(`<span style="margin-left: calc(-1* var(--space-9));margin-right: calc(-1* var(--space-9));width:auto;"><!></span> <!>`, 1);

export default function DeploymentCard($$anchor, $$props) {
	$.push($$props, true);

	const $regionalConsoleVariables = () => $.store_get(regionalConsoleVariables, '$regionalConsoleVariables', $$stores);
	const $func = () => $.store_get(func, '$func', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let variant = $.prop($$props, 'variant', 3, 'primary'),
		activeDeployment = $.prop($$props, 'activeDeployment', 3, false);

	const effectiveStatus = $.derived(() => getEffectiveBuildStatus($$props.deployment, $regionalConsoleVariables()));
	const displayStatus = $.derived(() => $.get(effectiveStatus) === 'finalizing' ? 'ready' : $.get(effectiveStatus));
	const totalSize = $.derived(() => humanFileSize($$props.deployment?.totalSize ?? 0));

	Card($$anchor, {
		padding: 'm',
		radius: 'm',
		get variant() {
			return variant();
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_12 = $.comment();
			var node_9 = $.first_child(fragment_12);

			$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
				Layout_Stack_4($$anchor, {
					gap: 'l',
					children: ($$anchor, $$slotProps) => {
						var fragment_13 = root();
						var node_10 = $.first_child(fragment_13);

						$.component(node_10, () => Layout.GridFraction, ($$anchor, Layout_GridFraction) => {
							Layout_GridFraction($$anchor, {
								start: 4,
								end: 6,
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root();
									var node_11 = $.first_child(fragment_14);

									$.component(node_11, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
										Layout_Stack_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_15 = $.comment();
												var node_12 = $.first_child(fragment_15);

												$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
													Layout_Stack_6($$anchor, {
														direction: 'row',
														alignItems: 'center',
														gap: 's',
														wrap: 'wrap',
														children: ($$anchor, $$slotProps) => {
															var fragment_16 = $.comment();
															var node_13 = $.first_child(fragment_16);

															{
																var consequent = ($$anchor) => {
																	var fragment_17 = root_3();
																	var node_14 = $.first_child(fragment_17);

																	$.component(node_14, () => Typography.Title, ($$anchor, Typography_Title) => {
																		Typography_Title($$anchor, {
																			size: 's',
																			variant: 'l-500',
																			color: '--fgcolor-neutral-primary',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_5 = $.text('Active deployment');

																				$.append($$anchor, text_5);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var div = $.sibling(node_14, 2);
																	var node_15 = $.child(div);

																	Id(node_15, {
																		get value() {
																			return $$props.deployment.$id;
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_6 = $.text();

																			$.template_effect(() => $.set_text(text_6, $$props.deployment.$id));
																			$.append($$anchor, text_6);
																		},
																		$$slots: { default: true }
																	});

																	$.reset(div);
																	$.append($$anchor, fragment_17);
																};

																var alternate = ($$anchor) => {
																	var fragment_19 = $.comment();
																	var node_16 = $.first_child(fragment_19);

																	$.component(node_16, () => Typography.Title, ($$anchor, Typography_Title_1) => {
																		Typography_Title_1($$anchor, {
																			size: 's',
																			variant: 'l-500',
																			color: '--fgcolor-neutral-primary',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_7 = $.text('Deployment overview');

																				$.append($$anchor, text_7);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_19);
																};

																$.if(node_13, ($$render) => {
																	if (activeDeployment()) $$render(consequent); else $$render(alternate, -1);
																});
															}

															$.append($$anchor, fragment_16);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_15);
											},
											$$slots: { default: true }
										});
									});

									var node_17 = $.sibling(node_11, 2);

									$.component(node_17, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
										Layout_Stack_7($$anchor, {
											gap: 'xl',
											children: ($$anchor, $$slotProps) => {
												var fragment_20 = root_8();
												var node_18 = $.first_child(fragment_20);

												$.component(node_18, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
													Layout_Stack_8($$anchor, {
														direction: 'row',
														alignItems: 'flex-start',
														children: ($$anchor, $$slotProps) => {
															var fragment_21 = $.comment();
															var node_19 = $.first_child(fragment_21);

															$.component(node_19, () => Layout.Stack, ($$anchor, Layout_Stack_9) => {
																Layout_Stack_9($$anchor, {
																	gap: 'xxs',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_22 = root();
																		var node_20 = $.first_child(fragment_22);

																		titleSnippet(node_20, () => 'Domains');

																		var node_21 = $.sibling(node_20, 2);

																		{
																			var consequent_1 = ($$anchor) => {
																				DeploymentDomains($$anchor, {
																					get domains() {
																						return $$props.proxyRuleList;
																					}
																				});
																			};

																			var alternate_1 = ($$anchor) => {
																				var fragment_24 = $.comment();
																				var node_22 = $.first_child(fragment_24);

																				$.component(node_22, () => Typography.Text, ($$anchor, Typography_Text_3) => {
																					Typography_Text_3($$anchor, {
																						variant: 'm-400',
																						color: '--fgcolor-neutral-primary',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var fragment_25 = root_4();
																							var node_23 = $.sibling($.first_child(fragment_25));

																							{
																								let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/functions/function-${$func().$id}/deployment-${$func().deploymentId}`);

																								Link(node_23, {
																									get href() {
																										return $.get($0);
																									},
																									variant: 'default',
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_8 = $.text('active deployment');

																										$.append($$anchor, text_8);
																									},
																									$$slots: { default: true }
																								});
																							}

																							$.next();
																							$.append($$anchor, fragment_25);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_24);
																			};

																			$.if(node_21, ($$render) => {
																				if ($func().deploymentId === $$props.deployment.$id) $$render(consequent_1); else $$render(alternate_1, -1);
																			});
																		}

																		$.append($$anchor, fragment_22);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_21);
														},
														$$slots: { default: true }
													});
												});

												var node_24 = $.sibling(node_18, 2);

												$.component(node_24, () => Layout.Stack, ($$anchor, Layout_Stack_10) => {
													Layout_Stack_10($$anchor, {
														direction: 'row',
														gap: 'xl',
														children: ($$anchor, $$slotProps) => {
															var fragment_26 = $.comment();
															var node_25 = $.first_child(fragment_26);

															{
																var consequent_2 = ($$anchor) => {
																	var fragment_27 = $.comment();
																	var node_26 = $.first_child(fragment_27);

																	$.component(node_26, () => Layout.Stack, ($$anchor, Layout_Stack_11) => {
																		Layout_Stack_11($$anchor, {
																			gap: 'xxs',
																			inline: true,
																			children: ($$anchor, $$slotProps) => {
																				var fragment_28 = root();
																				var node_27 = $.first_child(fragment_28);

																				titleSnippet(node_27, () => 'Status');

																				var node_28 = $.sibling(node_27, 2);

																				$.component(node_28, () => Typography.Text, ($$anchor, Typography_Text_4) => {
																					Typography_Text_4($$anchor, {
																						variant: 'm-400',
																						color: '--fgcolor-neutral-primary',
																						children: ($$anchor, $$slotProps) => {
																							{
																								let $0 = $.derived(() => deploymentStatusConverter($.get(displayStatus)));

																								Status($$anchor, {
																									get status() {
																										return $.get($0);
																									},

																									get label() {
																										return $.get(displayStatus);
																									}
																								});
																							}
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_28);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_27);
																};

																var alternate_2 = ($$anchor) => {
																	var fragment_30 = $.comment();
																	var node_29 = $.first_child(fragment_30);

																	$.component(node_29, () => Layout.Stack, ($$anchor, Layout_Stack_12) => {
																		Layout_Stack_12($$anchor, {
																			gap: 'xxs',
																			inline: true,
																			children: ($$anchor, $$slotProps) => {
																				var fragment_31 = root();
																				var node_30 = $.first_child(fragment_31);

																				$.component(node_30, () => Typography.Text, ($$anchor, Typography_Text_5) => {
																					Typography_Text_5($$anchor, {
																						variant: 'm-400',
																						color: '--fgcolor-neutral-tertiary',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_9 = $.text('Deployed');

																							$.append($$anchor, text_9);
																						},
																						$$slots: { default: true }
																					});
																				});

																				var node_31 = $.sibling(node_30, 2);

																				$.component(node_31, () => Typography.Text, ($$anchor, Typography_Text_6) => {
																					Typography_Text_6($$anchor, {
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

																				$.append($$anchor, fragment_31);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_30);
																};

																$.if(node_25, ($$render) => {
																	if ($.get(effectiveStatus) === 'failed') $$render(consequent_2); else $$render(alternate_2, -1);
																});
															}

															$.append($$anchor, fragment_26);
														},
														$$slots: { default: true }
													});
												});

												var node_32 = $.sibling(node_24, 2);

												$.component(node_32, () => Layout.Stack, ($$anchor, Layout_Stack_13) => {
													Layout_Stack_13($$anchor, {
														gap: 'xxl',
														direction: 'row',
														wrap: 'wrap',
														children: ($$anchor, $$slotProps) => {
															var fragment_33 = root_6();
															var node_33 = $.first_child(fragment_33);

															$.component(node_33, () => Layout.Stack, ($$anchor, Layout_Stack_14) => {
																Layout_Stack_14($$anchor, {
																	gap: 'xxl',
																	direction: 'row',
																	wrap: 'wrap',
																	inline: true,
																	children: ($$anchor, $$slotProps) => {
																		var fragment_34 = root_6();
																		var node_34 = $.first_child(fragment_34);

																		{
																			var consequent_3 = ($$anchor) => {
																				{
																					let $0 = $.derived(() => formatTimeDetailed($$props.deployment.buildDuration));

																					textGroup($$anchor, () => 'Build duration', () => $.get($0));
																				}
																			};

																			$.if(node_34, ($$render) => {
																				if ($$props.deployment?.buildDuration) $$render(consequent_3);
																			});
																		}

																		var node_35 = $.sibling(node_34, 2);

																		textGroup(node_35, () => 'Total size', () => `${$.get(totalSize).value} ${$.get(totalSize).unit}`);

																		var node_36 = $.sibling(node_35, 2);

																		$.component(node_36, () => Layout.Stack, ($$anchor, Layout_Stack_15) => {
																			Layout_Stack_15($$anchor, {
																				gap: 'xxs',
																				inline: true,
																				children: ($$anchor, $$slotProps) => {
																					var fragment_36 = root();
																					var node_37 = $.first_child(fragment_36);

																					titleSnippet(node_37, () => 'Runtime');

																					var node_38 = $.sibling(node_37, 2);

																					$.component(node_38, () => Typography.Text, ($$anchor, Typography_Text_7) => {
																						Typography_Text_7($$anchor, {
																							variant: 'm-400',
																							color: '--fgcolor-neutral-primary',
																							children: ($$anchor, $$slotProps) => {
																								var fragment_37 = $.comment();
																								var node_39 = $.first_child(fragment_37);

																								$.component(node_39, () => Layout.Stack, ($$anchor, Layout_Stack_16) => {
																									Layout_Stack_16($$anchor, {
																										direction: 'row',
																										gap: 'xxs',
																										alignItems: 'center',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_38 = root_5();
																											var node_40 = $.first_child(fragment_38);

																											{
																												let $0 = $.derived(() => $func().runtime.split('-')[0]);

																												SvgIcon(node_40, {
																													size: 16,
																													iconSize: 'small',
																													get name() {
																														return $.get($0);
																													}
																												});
																											}

																											var text_10 = $.sibling(node_40);

																											$.template_effect(($0) => $.set_text(text_10, ` ${$0 ?? ''}`), [() => capitalize($func().runtime)]);
																											$.append($$anchor, fragment_38);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_37);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_36);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_34);
																	},
																	$$slots: { default: true }
																});
															});

															var node_41 = $.sibling(node_33, 2);

															protection(node_41, () => 'Global CDN', () => 'Optimized speed by caching content on servers closer to users.');

															var node_42 = $.sibling(node_41, 2);

															protection(node_42, () => 'DDoS protection', () => 'Safeguards your site by detecting and blocking malicious traffic.');
															$.append($$anchor, fragment_33);
														},
														$$slots: { default: true }
													});
												});

												var node_43 = $.sibling(node_32, 2);

												$.component(node_43, () => Layout.Stack, ($$anchor, Layout_Stack_17) => {
													Layout_Stack_17($$anchor, {
														gap: 'xxs',
														inline: true,
														style: 'width: min-content;',
														children: ($$anchor, $$slotProps) => {
															var fragment_39 = root();
															var node_44 = $.first_child(fragment_39);

															titleSnippet(node_44, () => 'Source');

															var node_45 = $.sibling(node_44, 2);

															$.component(node_45, () => Typography.Text, ($$anchor, Typography_Text_8) => {
																Typography_Text_8($$anchor, {
																	variant: 'm-400',
																	color: '--fgcolor-neutral-primary',
																	children: ($$anchor, $$slotProps) => {
																		var div_1 = root_7();
																		var node_46 = $.child(div_1);

																		DeploymentSource(node_46, {
																			get deployment() {
																				return $$props.deployment;
																			},

																			get resource() {
																				return $func();
																			},

																			get region() {
																				return page.params.region;
																			},

																			get project() {
																				return page.params.project;
																			}
																		});

																		$.reset(div_1);
																		$.append($$anchor, div_1);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_39);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_20);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						var node_47 = $.sibling(node_10, 2);

						{
							var consequent_4 = ($$anchor) => {
								var fragment_40 = root_9();
								var span_1 = $.first_child(fragment_40);
								var node_48 = $.child(span_1);

								Divider(node_48, {});
								$.reset(span_1);

								var node_49 = $.sibling(span_1, 2);

								$.component(node_49, () => Layout.Stack, ($$anchor, Layout_Stack_18) => {
									Layout_Stack_18($$anchor, {
										direction: 'row-reverse',
										children: ($$anchor, $$slotProps) => {
											var fragment_41 = $.comment();
											var node_50 = $.first_child(fragment_41);

											$.snippet(node_50, () => $$props.footer);
											$.append($$anchor, fragment_41);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_40);
							};

							$.if(node_47, ($$render) => {
								if ($$props.footer) $$render(consequent_4);
							});
						}

						$.append($$anchor, fragment_13);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}
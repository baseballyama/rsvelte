import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div><!></div> <div></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $regionalProtocol = () => $.store_get(regionalProtocol, '$regionalProtocol', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showOpenOnMobile = $.state(false);
	let showConnectRepository = $.state(false);
	let showInviteCollaborator = $.state(false);
	const siteURL = $.derived(() => $$props.data.proxyRuleList.rules[0].domain);

	const siteRedirectHref = $.derived(() => {
		return resolve('/(console)/project-[region]-[project]/sites/site-[site]', {
			region: page.params.region,
			project: page.params.project,
			site: $$props.data.site.$id
		});
	});

	onMount(() => {
		if (page.url.searchParams.has('connectRepo') && page.url.searchParams.get('connectRepo') === 'true') {
			$.set(showConnectRepository, true);
		}
	});

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

			await invalidate(Dependencies.SITE);
		} catch {
			return;
		}
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	Wizard(node, {
		column: true,
		get href() {
			return $.get(siteRedirectHref);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					gap: 'xxxl',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var div = $.first_child(fragment_2);

						$.set_style(div, 'z-index: 6;', {}, { position: 'relative' });

						var node_2 = $.child(div);

						$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								gap: 'xxxl',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
										Layout_Stack_2($$anchor, {
											gap: 'l',
											direction: 'column',
											alignItems: 'center',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_4 = $.first_child(fragment_4);

												Check(node_4, {});

												var node_5 = $.sibling(node_4, 2);

												$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
													Layout_Stack_3($$anchor, {
														gap: 'xs',
														direction: 'column',
														alignItems: 'center',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_6 = $.first_child(fragment_5);

															$.component(node_6, () => Typography.Title, ($$anchor, Typography_Title) => {
																Typography_Title($$anchor, {
																	size: 'l',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text = $.text('Congratulations!');

																		$.append($$anchor, text);
																	},
																	$$slots: { default: true }
																});
															});

															var node_7 = $.sibling(node_6, 2);

															$.component(node_7, () => Typography.Text, ($$anchor, Typography_Text) => {
																Typography_Text($$anchor, {
																	variant: 'l-400',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('You deployed your Site successfully');

																		$.append($$anchor, text_1);
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
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_3, 2);

									Lights(node_8, { style: 'top: -100px; height:200px; width: 50%' });

									var node_9 = $.sibling(node_8, 2);

									{
										const footer = ($$anchor) => {
											{
												let $0 = $.derived(() => `${$regionalProtocol()}${$.get(siteURL)}`);

												Button($$anchor, {
													get href() {
														return $.get($0);
													},
													external: true,
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Visit site');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											}
										};

										SiteCard(node_9, {
											variant: 'secondary',
											get deployment() {
												return $$props.data.deployment;
											},

											get proxyRuleList() {
												return $$props.data.proxyRuleList;
											},
											hideQRCode: true,
											footer,
											$$slots: { footer: true }
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div);

						var node_10 = $.sibling(div, 4);

						$.component(node_10, () => Step.List, ($$anchor, Step_List) => {
							Step_List($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_11 = $.first_child(fragment_7);

									$.component(node_11, () => Step.Item, ($$anchor, Step_Item) => {
										Step_Item($$anchor, {
											state: 'current',
											shortLine: true,
											badgeText: 'Next steps',
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = $.comment();
												var node_12 = $.first_child(fragment_8);

												$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
													Layout_Stack_4($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = $.comment();
															var node_13 = $.first_child(fragment_9);

															{
																let $0 = $.derived(() => !$$props.data.site.providerRepositoryId ? 4 : 3);

																$.component(node_13, () => Layout.Grid, ($$anchor, Layout_Grid) => {
																	Layout_Grid($$anchor, {
																		get columns() {
																			return $.get($0);
																		},
																		columnsS: 1,
																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = root_2();
																			var node_14 = $.first_child(fragment_10);

																			{
																				var consequent = ($$anchor) => {
																					var fragment_11 = $.comment();
																					var node_15 = $.first_child(fragment_11);

																					$.component(node_15, () => Card.Button, ($$anchor, Card_Button) => {
																						Card_Button($$anchor, {
																							radius: 's',
																							padding: 's',
																							$$events: { click: () => $.set(showConnectRepository, true) },
																							children: ($$anchor, $$slotProps) => {
																								var fragment_12 = $.comment();
																								var node_16 = $.first_child(fragment_12);

																								$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
																									Layout_Stack_5($$anchor, {
																										gap: 's',
																										style: 'height: 100%',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_13 = root();
																											var node_17 = $.first_child(fragment_13);

																											$.component(node_17, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
																												Layout_Stack_6($$anchor, {
																													direction: 'row',
																													justifyContent: 'space-between',
																													alignItems: 'center',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_14 = root();
																														var node_18 = $.first_child(fragment_14);

																														$.component(node_18, () => Typography.Title, ($$anchor, Typography_Title_1) => {
																															Typography_Title_1($$anchor, {
																																size: 's',
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text_3 = $.text('Add repository');

																																	$.append($$anchor, text_3);
																																},
																																$$slots: { default: true }
																															});
																														});

																														var node_19 = $.sibling(node_18, 2);

																														Icon(node_19, {
																															get icon() {
																																return IconArrowSmRight;
																															},
																															size: 'l',
																															color: '--fgcolor-neutral-weak'
																														});

																														$.append($$anchor, fragment_14);
																													},
																													$$slots: { default: true }
																												});
																											});

																											var node_20 = $.sibling(node_17, 2);

																											$.component(node_20, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																												Typography_Text_1($$anchor, {
																													variant: 'm-400',
																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_4 = $.text('Connect to a new repository or an existing one.');

																														$.append($$anchor, text_4);
																													},
																													$$slots: { default: true }
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
																					});

																					$.append($$anchor, fragment_11);
																				};

																				$.if(node_14, ($$render) => {
																					if (!$$props.data.site.providerRepositoryId) $$render(consequent);
																				});
																			}

																			var node_21 = $.sibling(node_14, 2);

																			{
																				let $0 = $.derived(() => `${$.get(siteRedirectHref)}/domains`);

																				$.component(node_21, () => Card.Link, ($$anchor, Card_Link) => {
																					Card_Link($$anchor, {
																						radius: 's',
																						padding: 's',
																						get href() {
																							return $.get($0);
																						},

																						$$events: {
																							click: () => {
																								trackEvent(Click.DomainCreateClick, { source: 'sites_create_finish' });
																							}
																						},

																						children: ($$anchor, $$slotProps) => {
																							var fragment_15 = $.comment();
																							var node_22 = $.first_child(fragment_15);

																							$.component(node_22, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
																								Layout_Stack_7($$anchor, {
																									gap: 's',
																									style: 'height: 100%',
																									children: ($$anchor, $$slotProps) => {
																										var fragment_16 = root();
																										var node_23 = $.first_child(fragment_16);

																										$.component(node_23, () => Layout.Stack, ($$anchor, Layout_Stack_8) => {
																											Layout_Stack_8($$anchor, {
																												direction: 'row',
																												justifyContent: 'space-between',
																												alignItems: 'center',
																												children: ($$anchor, $$slotProps) => {
																													var fragment_17 = root();
																													var node_24 = $.first_child(fragment_17);

																													$.component(node_24, () => Typography.Title, ($$anchor, Typography_Title_2) => {
																														Typography_Title_2($$anchor, {
																															size: 's',
																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_5 = $.text('Add domain');

																																$.append($$anchor, text_5);
																															},
																															$$slots: { default: true }
																														});
																													});

																													var node_25 = $.sibling(node_24, 2);

																													Icon(node_25, {
																														get icon() {
																															return IconArrowSmRight;
																														},
																														size: 'l',
																														color: '--fgcolor-neutral-weak'
																													});

																													$.append($$anchor, fragment_17);
																												},
																												$$slots: { default: true }
																											});
																										});

																										var node_26 = $.sibling(node_23, 2);

																										$.component(node_26, () => Typography.Text, ($$anchor, Typography_Text_2) => {
																											Typography_Text_2($$anchor, {
																												variant: 'm-400',
																												children: ($$anchor, $$slotProps) => {
																													$.next();

																													var text_6 = $.text('Connect to an existing domain or add a new one.');

																													$.append($$anchor, text_6);
																												},
																												$$slots: { default: true }
																											});
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
																				});
																			}

																			var node_27 = $.sibling(node_21, 2);

																			$.component(node_27, () => Card.Button, ($$anchor, Card_Button_1) => {
																				Card_Button_1($$anchor, {
																					radius: 's',
																					padding: 's',
																					$$events: { click: () => $.set(showInviteCollaborator, true) },
																					children: ($$anchor, $$slotProps) => {
																						var fragment_18 = $.comment();
																						var node_28 = $.first_child(fragment_18);

																						$.component(node_28, () => Layout.Stack, ($$anchor, Layout_Stack_9) => {
																							Layout_Stack_9($$anchor, {
																								gap: 's',
																								style: 'height: 100%',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_19 = root();
																									var node_29 = $.first_child(fragment_19);

																									$.component(node_29, () => Layout.Stack, ($$anchor, Layout_Stack_10) => {
																										Layout_Stack_10($$anchor, {
																											direction: 'row',
																											justifyContent: 'space-between',
																											alignItems: 'center',
																											children: ($$anchor, $$slotProps) => {
																												var fragment_20 = root();
																												var node_30 = $.first_child(fragment_20);

																												$.component(node_30, () => Typography.Title, ($$anchor, Typography_Title_3) => {
																													Typography_Title_3($$anchor, {
																														size: 's',
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text_7 = $.text('Share site');

																															$.append($$anchor, text_7);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_31 = $.sibling(node_30, 2);

																												Icon(node_31, {
																													get icon() {
																														return IconArrowSmRight;
																													},
																													size: 'l',
																													color: '--fgcolor-neutral-weak'
																												});

																												$.append($$anchor, fragment_20);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_32 = $.sibling(node_29, 2);

																									$.component(node_32, () => Typography.Text, ($$anchor, Typography_Text_3) => {
																										Typography_Text_3($$anchor, {
																											variant: 'm-400',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_8 = $.text('Share your progress and start collaborating with your team.');

																												$.append($$anchor, text_8);
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
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_33 = $.sibling(node_27, 2);

																			$.component(node_33, () => Card.Button, ($$anchor, Card_Button_2) => {
																				Card_Button_2($$anchor, {
																					radius: 's',
																					padding: 's',
																					$$events: { click: () => $.set(showOpenOnMobile, true) },
																					children: ($$anchor, $$slotProps) => {
																						var fragment_21 = $.comment();
																						var node_34 = $.first_child(fragment_21);

																						$.component(node_34, () => Layout.Stack, ($$anchor, Layout_Stack_11) => {
																							Layout_Stack_11($$anchor, {
																								gap: 's',
																								style: 'height: 100%',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_22 = root();
																									var node_35 = $.first_child(fragment_22);

																									$.component(node_35, () => Layout.Stack, ($$anchor, Layout_Stack_12) => {
																										Layout_Stack_12($$anchor, {
																											direction: 'row',
																											justifyContent: 'space-between',
																											alignItems: 'center',
																											children: ($$anchor, $$slotProps) => {
																												var fragment_23 = root();
																												var node_36 = $.first_child(fragment_23);

																												$.component(node_36, () => Typography.Title, ($$anchor, Typography_Title_4) => {
																													Typography_Title_4($$anchor, {
																														size: 's',
																														children: ($$anchor, $$slotProps) => {
																															$.next();

																															var text_9 = $.text('Open on mobile');

																															$.append($$anchor, text_9);
																														},
																														$$slots: { default: true }
																													});
																												});

																												var node_37 = $.sibling(node_36, 2);

																												Icon(node_37, {
																													get icon() {
																														return IconArrowSmRight;
																													},
																													size: 'l',
																													color: '--fgcolor-neutral-weak'
																												});

																												$.append($$anchor, fragment_23);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var node_38 = $.sibling(node_35, 2);

																									$.component(node_38, () => Typography.Text, ($$anchor, Typography_Text_4) => {
																										Typography_Text_4($$anchor, {
																											variant: 'm-400',
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_10 = $.text('Open the preview of your site on any mobile or tablet device.');

																												$.append($$anchor, text_10);
																											},
																											$$slots: { default: true }
																										});
																									});

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

																			$.append($$anchor, fragment_10);
																		},
																		$$slots: { default: true }
																	});
																});
															}

															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
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
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				Button($$anchor, {
					size: 's',
					fullWidthMobile: true,
					secondary: true,
					get href() {
						return $.get(siteRedirectHref);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_11 = $.text('Go to dashboard');

						$.append($$anchor, text_11);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	var node_39 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			ConnectRepoModal($$anchor, {
				connect,
				product: 'sites',
				callbackState: { connectRepo: 'true' },
				get show() {
					return $.get(showConnectRepository);
				},

				set show($$value) {
					$.set(showConnectRepository, $$value, true);
				}
			});
		};

		$.if(node_39, ($$render) => {
			if ($.get(showConnectRepository)) $$render(consequent_1);
		});
	}

	var node_40 = $.sibling(node_39, 2);

	{
		var consequent_2 = ($$anchor) => {
			OpenOnMobileModal($$anchor, {
				get proxyRuleList() {
					return $$props.data.proxyRuleList;
				},

				get show() {
					return $.get(showOpenOnMobile);
				},

				set show($$value) {
					$.set(showOpenOnMobile, $$value, true);
				}
			});
		};

		$.if(node_40, ($$render) => {
			if ($.get(showOpenOnMobile)) $$render(consequent_2);
		});
	}

	var node_41 = $.sibling(node_40, 2);

	{
		var consequent_3 = ($$anchor) => {
			AddCollaboratorModal($$anchor, {
				get show() {
					return $.get(showInviteCollaborator);
				},

				set show($$value) {
					$.set(showInviteCollaborator, $$value, true);
				}
			});
		};

		$.if(node_41, ($$render) => {
			if ($.get(showInviteCollaborator)) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
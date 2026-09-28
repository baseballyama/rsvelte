import * as $ from 'svelte/internal/server';
import { NavigationMenu } from "bits-ui";

export default function Navigation_menu_test($$renderer, $$props) {
	let {
		noViewport,
		noSubViewport,
		contentForceMount = false,
		viewportForceMount = false,
		indicatorForceMount = false,
		groupItemProps,
		subGroupItemProps,
		subGroupItem1Props,
		subGroupItem2Props,
		delayDuration = 0,
		skipDelayDuration = 0,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	$$renderer.push(`<main><button data-testid="previous-button"${$.attr('tabindex', 0)}>previous button</button> `);

	if (NavigationMenu.Root) {
		$$renderer.push('<!--[-->');

		NavigationMenu.Root($$renderer, $.spread_props([
			restProps,
			{
				'data-testid': 'root',
				delayDuration,
				skipDelayDuration,
				children: ($$renderer) => {
					if (NavigationMenu.List) {
						$$renderer.push('<!--[-->');

						NavigationMenu.List($$renderer, {
							'data-testid': 'list',
							children: ($$renderer) => {
								if (NavigationMenu.Item) {
									$$renderer.push('<!--[-->');

									NavigationMenu.Item($$renderer, $.spread_props([
										{ value: 'group', 'data-testid': 'group-item' },
										groupItemProps,
										{
											children: ($$renderer) => {
												if (NavigationMenu.Trigger) {
													$$renderer.push('<!--[-->');

													NavigationMenu.Trigger($$renderer, {
														'data-testid': 'group-item-trigger',
														children: ($$renderer) => {
															$$renderer.push(`<!---->trigger`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (NavigationMenu.Content) {
													$$renderer.push('<!--[-->');

													NavigationMenu.Content($$renderer, {
														'data-testid': 'group-item-content',
														forceMount: contentForceMount,
														children: ($$renderer) => {
															$$renderer.push(`<button data-testid="group-item-content-button1">first button</button> <button data-testid="group-item-content-button2">second button</button>`);
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
										}
									]));

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (NavigationMenu.Item) {
									$$renderer.push('<!--[-->');

									NavigationMenu.Item($$renderer, $.spread_props([
										{ value: 'sub-group', 'data-testid': 'sub-group-item' },
										subGroupItemProps,
										{
											children: ($$renderer) => {
												if (NavigationMenu.Trigger) {
													$$renderer.push('<!--[-->');

													NavigationMenu.Trigger($$renderer, {
														'data-testid': 'sub-group-item-trigger',
														children: ($$renderer) => {
															$$renderer.push(`<!---->sub`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (NavigationMenu.Content) {
													$$renderer.push('<!--[-->');

													NavigationMenu.Content($$renderer, {
														'data-testid': 'sub-group-item-content',
														forceMount: contentForceMount,
														children: ($$renderer) => {
															if (NavigationMenu.Sub) {
																$$renderer.push('<!--[-->');

																NavigationMenu.Sub($$renderer, {
																	value: 'sub1',
																	'data-testid': 'sub-group-item-sub',
																	children: ($$renderer) => {
																		if (NavigationMenu.List) {
																			$$renderer.push('<!--[-->');

																			NavigationMenu.List($$renderer, {
																				'data-testid': 'sub-group-item-sub-list',
																				children: ($$renderer) => {
																					if (NavigationMenu.Item) {
																						$$renderer.push('<!--[-->');

																						NavigationMenu.Item($$renderer, $.spread_props([
																							{ value: 'sub1', 'data-testid': 'sub-group-item-sub-item1' },
																							subGroupItem1Props,
																							{
																								children: ($$renderer) => {
																									if (NavigationMenu.Trigger) {
																										$$renderer.push('<!--[-->');

																										NavigationMenu.Trigger($$renderer, {
																											'data-testid': 'sub-group-item-sub-item1-trigger',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->sub1`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (NavigationMenu.Content) {
																										$$renderer.push('<!--[-->');

																										NavigationMenu.Content($$renderer, {
																											'data-testid': 'sub-group-item-sub-item1-content',
																											forceMount: contentForceMount,
																											children: ($$renderer) => {
																												$$renderer.push(`<button data-testid="sub-group-item-sub-item1-content-button">first sub button</button>`);
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
																							}
																						]));

																						$$renderer.push('<!--]-->');
																					} else {
																						$$renderer.push('<!--[!-->');
																						$$renderer.push('<!--]-->');
																					}

																					$$renderer.push(` `);

																					if (NavigationMenu.Item) {
																						$$renderer.push('<!--[-->');

																						NavigationMenu.Item($$renderer, $.spread_props([
																							{ value: 'sub2', 'data-testid': 'sub-group-item-sub-item2' },
																							subGroupItem2Props,
																							{
																								children: ($$renderer) => {
																									if (NavigationMenu.Trigger) {
																										$$renderer.push('<!--[-->');

																										NavigationMenu.Trigger($$renderer, {
																											'data-testid': 'sub-group-item-sub-item2-trigger',
																											children: ($$renderer) => {
																												$$renderer.push(`<!---->sub2`);
																											},
																											$$slots: { default: true }
																										});

																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}

																									$$renderer.push(` `);

																									if (NavigationMenu.Content) {
																										$$renderer.push('<!--[-->');

																										NavigationMenu.Content($$renderer, {
																											'data-testid': 'sub-group-item-sub-item2-content',
																											forceMount: contentForceMount,
																											children: ($$renderer) => {
																												$$renderer.push(`<button data-testid="sub-group-item-sub-item2-content-button">second sub button</button>`);
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
																							}
																						]));

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

																		if (!noSubViewport) {
																			$$renderer.push('<!--[0-->');

																			if (NavigationMenu.Viewport) {
																				$$renderer.push('<!--[-->');
																				NavigationMenu.Viewport($$renderer, { 'data-testid': 'sub-group-item-sub-viewport' });
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

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										}
									]));

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (NavigationMenu.Item) {
									$$renderer.push('<!--[-->');

									NavigationMenu.Item($$renderer, {
										value: 'link',
										'data-testid': 'link-item',
										children: ($$renderer) => {
											if (NavigationMenu.Link) {
												$$renderer.push('<!--[-->');

												NavigationMenu.Link($$renderer, {
													'data-testid': 'link-item-link',
													href: '/',
													children: ($$renderer) => {
														$$renderer.push(`<!---->link`);
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

								if (NavigationMenu.Indicator) {
									$$renderer.push('<!--[-->');
									NavigationMenu.Indicator($$renderer, { 'data-testid': 'indicator', forceMount: indicatorForceMount });
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

					if (!noViewport) {
						$$renderer.push('<!--[0-->');

						if (NavigationMenu.Viewport) {
							$$renderer.push('<!--[-->');
							NavigationMenu.Viewport($$renderer, { 'data-testid': 'viewport', forceMount: viewportForceMount });
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
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(` <button data-testid="next-button"${$.attr('tabindex', 0)}>next button</button></main>`);
}
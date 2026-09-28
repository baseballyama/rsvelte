import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { EmptySearch, PaginationWithLimit, ViewSelector } from '$lib/components/index.js';
import { Button } from '$lib/elements/forms';
import Link from '$lib/elements/link.svelte';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import Container from '$lib/layout/container.svelte';
import { protocol } from '$routes/(console)/store.js';
import { IconDotsHorizontal, IconPlus, IconRefresh, IconTrash } from '@appwrite.io/pink-icons-svelte';

import {
	ActionMenu,
	Badge,
	Card,
	Empty,
	Icon,
	Layout,
	Popover,
	Table,
	Typography
} from '@appwrite.io/pink-svelte';

import DeleteDomainModal from './deleteDomainModal.svelte';
import RetryDomainModal from './retryDomainModal.svelte';
import { queries } from '$lib/components/filters';
import SearchQuery from '$lib/components/searchQuery.svelte';
import { app } from '$lib/stores/app';
import { Click, trackEvent } from '$lib/actions/analytics';
import { columns } from './store';
import { View } from '$lib/helpers/load';

var root_1 = $.from_html(`<!> Add domain`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get(columns, '$columns', $$stores);
	const $protocol = () => $.store_get(protocol, '$protocol', $$stores);
	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let data = $.prop($$props, 'data', 7);
	let showDelete = $.state(false);
	let showRetry = $.state(false);
	let selectedDomain = $.state(null);

	const isDomainVerified = (domain) => {
		return domain.nameservers.toLowerCase() === 'appwrite';
	};

	var fragment = root_3();
	var node = $.first_child(fragment);

	Container(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'row',
					justifyContent: 'space-between',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_2 = $.first_child(fragment_2);

						SearchQuery(node_2, { placeholder: 'Search domains' });

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								direction: 'row',
								gap: 'm',
								inline: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var node_4 = $.first_child(fragment_3);

									ViewSelector(node_4, {
										ui: 'new',
										get view() {
											return View.Table;
										},

										get columns() {
											return columns;
										},
										hideView: true
									});

									var node_5 = $.sibling(node_4, 2);

									{
										let $0 = $.derived(() => `${base}/organization-${page.params.organization}/domains/add-domain`);

										Button(node_5, {
											get href() {
												return $.get($0);
											},

											$$events: {
												click: () => {
													trackEvent(Click.DomainCreateClick, { source: 'organization_domain_overview' });
												}
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_1();
												var node_6 = $.first_child(fragment_4);

												Icon(node_6, {
													get icon() {
														return IconPlus;
													},
													size: 's'
												});

												$.next();
												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
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
				});
			});

			var node_7 = $.sibling(node_1, 2);

			{
				var consequent_10 = ($$anchor) => {
					var fragment_5 = root_2();
					var node_8 = $.first_child(fragment_5);

					{
						let $0 = $.derived(() => [...$columns(), { id: 'actions', width: 40 }]);

						$.component(node_8, () => Table.Root, ($$anchor, Table_Root) => {
							Table_Root($$anchor, {
								get columns() {
									return $.get($0);
								},
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$anchor, $$slotProps) => {
										const root = $.derived(() => $$slotProps.root);
										var fragment_6 = $.comment();
										var node_9 = $.first_child(fragment_6);

										$.each(node_9, 17, () => data().domains.domains, $.index, ($$anchor, domain) => {
											var fragment_7 = $.comment();
											var node_10 = $.first_child(fragment_7);

											{
												let $0 = $.derived(() => `${base}/organization-${page.params.organization}/domains/domain-${$.get(domain).$id}`);

												$.component(node_10, () => Table.Row.Link, ($$anchor, Table_Row_Link) => {
													Table_Row_Link($$anchor, {
														get root() {
															return $.get(root);
														},

														get href() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_2();
															var node_11 = $.first_child(fragment_8);

															$.each(node_11, 1, $columns, $.index, ($$anchor, column) => {
																var fragment_9 = $.comment();
																var node_12 = $.first_child(fragment_9);

																$.component(node_12, () => Table.Cell, ($$anchor, Table_Cell) => {
																	Table_Cell($$anchor, {
																		get column() {
																			return $.get(column).id;
																		},

																		get root() {
																			return $.get(root);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = $.comment();
																			var node_13 = $.first_child(fragment_10);

																			$.component(node_13, () => Typography.Text, ($$anchor, Typography_Text) => {
																				Typography_Text($$anchor, {
																					truncate: true,
																					children: ($$anchor, $$slotProps) => {
																						var fragment_11 = $.comment();
																						var node_14 = $.first_child(fragment_11);

																						{
																							var consequent_1 = ($$anchor) => {
																								var fragment_12 = $.comment();
																								var node_15 = $.first_child(fragment_12);

																								$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
																									Layout_Stack_2($$anchor, {
																										direction: 'row',
																										gap: 'xs',
																										children: ($$anchor, $$slotProps) => {
																											var fragment_13 = root_2();
																											var node_16 = $.first_child(fragment_13);

																											{
																												let $0 = $.derived(() => `${$protocol()}${$.get(domain).domain}`);

																												Link(node_16, {
																													external: true,
																													get href() {
																														return $.get($0);
																													},
																													variant: 'quiet',
																													children: ($$anchor, $$slotProps) => {
																														var fragment_14 = $.comment();
																														var node_17 = $.first_child(fragment_14);

																														$.component(node_17, () => Typography.Text, ($$anchor, Typography_Text_1) => {
																															Typography_Text_1($$anchor, {
																																truncate: true,
																																children: ($$anchor, $$slotProps) => {
																																	$.next();

																																	var text = $.text();

																																	$.template_effect(() => $.set_text(text, $.get(domain).domain));
																																	$.append($$anchor, text);
																																},
																																$$slots: { default: true }
																															});
																														});

																														$.append($$anchor, fragment_14);
																													},
																													$$slots: { default: true }
																												});
																											}

																											var node_18 = $.sibling(node_16, 2);

																											{
																												var consequent = ($$anchor) => {
																													Badge($$anchor, {
																														variant: 'secondary',
																														type: 'error',
																														content: 'Not verified',
																														size: 'xs'
																													});
																												};

																												var d = $.derived(() => !isDomainVerified($.get(domain)));

																												$.if(node_18, ($$render) => {
																													if ($.get(d)) $$render(consequent);
																												});
																											}

																											$.append($$anchor, fragment_13);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_12);
																							};

																							var consequent_2 = ($$anchor) => {
																								var text_1 = $.text();

																								$.template_effect(() => $.set_text(text_1, $.get(domain).registrar || '-'));
																								$.append($$anchor, text_1);
																							};

																							var consequent_3 = ($$anchor) => {
																								var text_2 = $.text();

																								$.template_effect(() => $.set_text(text_2, $.get(domain).nameservers || '-'));
																								$.append($$anchor, text_2);
																							};

																							var consequent_5 = ($$anchor) => {
																								var fragment_19 = $.comment();
																								var node_19 = $.first_child(fragment_19);

																								{
																									var consequent_4 = ($$anchor) => {
																										DualTimeView($$anchor, {
																											get time() {
																												return $.get(domain).expire;
																											}
																										});
																									};

																									var alternate = ($$anchor) => {
																										var text_3 = $.text('-');

																										$.append($$anchor, text_3);
																									};

																									$.if(node_19, ($$render) => {
																										if ($.get(domain)?.expire) $$render(consequent_4); else $$render(alternate, -1);
																									});
																								}

																								$.append($$anchor, fragment_19);
																							};

																							var consequent_7 = ($$anchor) => {
																								var fragment_21 = $.comment();
																								var node_20 = $.first_child(fragment_21);

																								{
																									var consequent_6 = ($$anchor) => {
																										DualTimeView($$anchor, {
																											get time() {
																												return $.get(domain).renewal;
																											}
																										});
																									};

																									var alternate_1 = ($$anchor) => {
																										var text_4 = $.text('-');

																										$.append($$anchor, text_4);
																									};

																									$.if(node_20, ($$render) => {
																										if ($.get(domain)?.renewal) $$render(consequent_6); else $$render(alternate_1, -1);
																									});
																								}

																								$.append($$anchor, fragment_21);
																							};

																							var consequent_8 = ($$anchor) => {
																								var text_5 = $.text();

																								$.template_effect(() => $.set_text(text_5, $.get(domain)?.autoRenewal ? 'On' : 'Off'));
																								$.append($$anchor, text_5);
																							};

																							$.if(node_14, ($$render) => {
																								if ($.get(column).id === 'domain') $$render(consequent_1); else if ($.get(column).id === 'registrar') $$render(consequent_2, 1); else if ($.get(column).id === 'nameservers') $$render(consequent_3, 2); else if ($.get(column).id === 'expiry_date') $$render(consequent_5, 3); else if ($.get(column).id === 'renewal') $$render(consequent_7, 4); else if ($.get(column).id === 'auto_renewal') $$render(consequent_8, 5);
																							});
																						}

																						$.append($$anchor, fragment_11);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_9);
															});

															var node_21 = $.sibling(node_11, 2);

															$.component(node_21, () => Table.Cell, ($$anchor, Table_Cell_1) => {
																Table_Cell_1($$anchor, {
																	column: 'actions',
																	get root() {
																		return $.get(root);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_24 = $.comment();
																		var node_22 = $.first_child(fragment_24);

																		$.component(node_22, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																			Layout_Stack_3($$anchor, {
																				direction: 'row',
																				justifyContent: 'flex-end',
																				children: ($$anchor, $$slotProps) => {
																					Popover($$anchor, {
																						placement: 'bottom-end',
																						padding: 'none',
																						children: $.invalid_default_snippet,
																						$$slots: {
																							default: ($$anchor, $$slotProps) => {
																								const toggle = $.derived(() => $$slotProps.toggle);

																								Button($$anchor, {
																									text: true,
																									icon: true,
																									$$events: {
																										click: (e) => {
																											e.preventDefault();
																											$.get(toggle)(e);
																										}
																									},

																									children: ($$anchor, $$slotProps) => {
																										Icon($$anchor, {
																											get icon() {
																												return IconDotsHorizontal;
																											},
																											size: 's'
																										});
																									},
																									$$slots: { default: true }
																								});
																							},

																							tooltip: ($$anchor, $$slotProps) => {
																								const toggle = $.derived(() => $$slotProps.toggle);
																								var fragment_28 = $.comment();
																								var node_23 = $.first_child(fragment_28);

																								$.component(node_23, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
																									ActionMenu_Root($$anchor, {
																										children: ($$anchor, $$slotProps) => {
																											var fragment_29 = root_2();
																											var node_24 = $.first_child(fragment_29);

																											{
																												var consequent_9 = ($$anchor) => {
																													var fragment_30 = $.comment();
																													var node_25 = $.first_child(fragment_30);

																													$.component(node_25, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
																														ActionMenu_Item_Button($$anchor, {
																															get leadingIcon() {
																																return IconRefresh;
																															},

																															$$events: {
																																click: (e) => {
																																	e.preventDefault();
																																	$.set(selectedDomain, $.get(domain), true);
																																	$.set(showRetry, true);
																																	$.get(toggle)(e);
																																	trackEvent(Click.DomainRetryDomainVerificationClick, { source: 'organization_domain_overview' });
																																}
																															},

																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_6 = $.text('Retry');

																																$.append($$anchor, text_6);
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_30);
																												};

																												var d_1 = $.derived(() => !isDomainVerified($.get(domain)));

																												$.if(node_24, ($$render) => {
																													if ($.get(d_1)) $$render(consequent_9);
																												});
																											}

																											var node_26 = $.sibling(node_24, 2);

																											$.component(node_26, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_1) => {
																												ActionMenu_Item_Button_1($$anchor, {
																													status: 'danger',
																													get leadingIcon() {
																														return IconTrash;
																													},

																													$$events: {
																														click: (e) => {
																															e.preventDefault();
																															$.set(selectedDomain, $.get(domain), true);
																															$.set(showDelete, true);
																															$.get(toggle)(e);
																															trackEvent(Click.DomainDeleteClick, { source: 'organization_domain_overview' });
																														}
																													},

																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_7 = $.text('Delete');

																														$.append($$anchor, text_7);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_29);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_28);
																							}
																						}
																					});
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_24);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});
											}

											$.append($$anchor, fragment_7);
										});

										$.append($$anchor, fragment_6);
									},

									header: ($$anchor, $$slotProps) => {
										const root = $.derived(() => $$slotProps.root);
										var fragment_31 = root_2();
										var node_27 = $.first_child(fragment_31);

										$.each(node_27, 1, $columns, $.index, ($$anchor, $$item) => {
											let id = () => $.get($$item).id;
											let title = () => $.get($$item).title;
											var fragment_32 = $.comment();
											var node_28 = $.first_child(fragment_32);

											$.component(node_28, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
												Table_Header_Cell($$anchor, {
													get column() {
														return id();
													},

													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_8 = $.text();

														$.template_effect(() => $.set_text(text_8, title()));
														$.append($$anchor, text_8);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_32);
										});

										var node_29 = $.sibling(node_27, 2);

										$.component(node_29, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
											Table_Header_Cell_1($$anchor, {
												get root() {
													return $.get(root);
												},
												column: 'actions'
											});
										});

										$.append($$anchor, fragment_31);
									}
								}
							});
						});
					}

					var node_30 = $.sibling(node_8, 2);

					PaginationWithLimit(node_30, {
						name: 'Domains',
						get limit() {
							return data().limit;
						},

						get offset() {
							return data().offset;
						},

						get total() {
							return data().domains.total;
						}
					});

					$.append($$anchor, fragment_5);
				};

				var consequent_11 = ($$anchor) => {
					EmptySearch($$anchor, {
						hidePages: true,
						target: 'domains',
						get search() {
							return data().search;
						},

						set search($$value) {
							data().search = $$value;
						},

						$$slots: {
							actions: ($$anchor, $$slotProps) => {
								Button($$anchor, {
									secondary: true,
									$$events: {
										click: () => {
											queries.clearAll();
											queries.apply();
										}
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text('Clear filters');

										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});
							}
						}
					});
				};

				var alternate_2 = ($$anchor) => {
					var fragment_36 = $.comment();
					var node_31 = $.first_child(fragment_36);

					$.component(node_31, () => Card.Base, ($$anchor, Card_Base) => {
						Card_Base($$anchor, {
							padding: 'none',
							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => $app().themeInUse === 'dark'
										? `${base}/images/domains/empty-domain-dark.svg`
										: `${base}/images/domains/empty-domain-light.svg`);

									Empty($$anchor, {
										get src() {
											return $.get($0);
										},
										title: 'Add your first domain',
										description: 'Connect a domain you own to get your project up and running.',
										$$slots: {
											actions: ($$anchor, $$slotProps) => {
												var fragment_38 = root_2();
												var node_32 = $.first_child(fragment_38);

												Button(node_32, {
													external: true,
													href: 'https://appwrite.io/docs/products/network/dns',
													text: true,
													event: 'empty_documentation',
													size: 's',
													ariaLabel: 'add domain',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_10 = $.text('Documentation');

														$.append($$anchor, text_10);
													},
													$$slots: { default: true }
												});

												var node_33 = $.sibling(node_32, 2);

												{
													let $0 = $.derived(() => `${base}/organization-${page.params.organization}/domains/add-domain`);

													Button(node_33, {
														secondary: true,
														get href() {
															return $.get($0);
														},
														size: 's',
														$$events: {
															click: () => {
																trackEvent(Click.DomainCreateClick, { source: 'organization_domain_overview' });
															}
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('Add domain');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});
												}

												$.append($$anchor, fragment_38);
											}
										}
									});
								}
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_36);
				};

				$.if(node_7, ($$render) => {
					if (data().domains.total) $$render(consequent_10); else if (data()?.query || data()?.search) $$render(consequent_11, 1); else $$render(alternate_2, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_34 = $.sibling(node, 2);

	{
		var consequent_12 = ($$anchor) => {
			DeleteDomainModal($$anchor, {
				get selectedDomain() {
					return $.get(selectedDomain);
				},

				get show() {
					return $.get(showDelete);
				},

				set show($$value) {
					$.set(showDelete, $$value, true);
				}
			});
		};

		$.if(node_34, ($$render) => {
			if ($.get(showDelete)) $$render(consequent_12);
		});
	}

	var node_35 = $.sibling(node_34, 2);

	{
		var consequent_13 = ($$anchor) => {
			RetryDomainModal($$anchor, {
				get selectedDomain() {
					return $.get(selectedDomain);
				},

				get show() {
					return $.get(showRetry);
				},

				set show($$value) {
					$.set(showRetry, $$value, true);
				}
			});
		};

		$.if(node_35, ($$render) => {
			if ($.get(showRetry)) $$render(consequent_13);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
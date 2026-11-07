import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let showDelete = false;
		let showRetry = false;
		let selectedDomain = null;

		const isDomainVerified = (domain) => {
			return domain.nameservers.toLowerCase() === 'appwrite';
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							justifyContent: 'space-between',
							children: ($$renderer) => {
								SearchQuery($$renderer, { placeholder: 'Search domains' });
								$$renderer.push(`<!----> `);

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										gap: 'm',
										inline: true,
										children: ($$renderer) => {
											ViewSelector($$renderer, { ui: 'new', view: View.Table, columns, hideView: true });
											$$renderer.push(`<!----> `);

											Button($$renderer, {
												href: `${base}/organization-${page.params.organization}/domains/add-domain`,
												children: ($$renderer) => {
													Icon($$renderer, { icon: IconPlus, size: 's' });
													$$renderer.push(`<!----> Add domain`);
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
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (data.domains.total) {
						$$renderer.push('<!--[0-->');

						if (Table.Root) {
							$$renderer.push('<!--[-->');

							Table.Root($$renderer, {
								columns: [
									...$.store_get($$store_subs ??= {}, '$columns', columns),
									{ id: 'actions', width: 40 }
								],
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$renderer, { root }) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(data.domains.domains);

										for (let $$index_2 = 0, $$length = each_array.length; $$index_2 < $$length; $$index_2++) {
											let domain = each_array[$$index_2];

											if (Table.Row.Link) {
												$$renderer.push('<!--[-->');

												Table.Row.Link($$renderer, {
													root,
													href: `${base}/organization-${page.params.organization}/domains/domain-${domain.$id}`,
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array_1 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

														for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
															let column = each_array_1[$$index_1];

															if (Table.Cell) {
																$$renderer.push('<!--[-->');

																Table.Cell($$renderer, {
																	column: column.id,
																	root,
																	children: ($$renderer) => {
																		if (Typography.Text) {
																			$$renderer.push('<!--[-->');

																			Typography.Text($$renderer, {
																				truncate: true,
																				children: ($$renderer) => {
																					if (column.id === 'domain') {
																						$$renderer.push('<!--[0-->');

																						if (Layout.Stack) {
																							$$renderer.push('<!--[-->');

																							Layout.Stack($$renderer, {
																								direction: 'row',
																								gap: 'xs',
																								children: ($$renderer) => {
																									Link($$renderer, {
																										external: true,
																										href: `${$.store_get($$store_subs ??= {}, '$protocol', protocol)}${domain.domain}`,
																										variant: 'quiet',
																										children: ($$renderer) => {
																											if (Typography.Text) {
																												$$renderer.push('<!--[-->');

																												Typography.Text($$renderer, {
																													truncate: true,
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->${$.escape(domain.domain)}`);
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

																									if (!isDomainVerified(domain)) {
																										$$renderer.push('<!--[0-->');

																										Badge($$renderer, {
																											variant: 'secondary',
																											type: 'error',
																											content: 'Not verified',
																											size: 'xs'
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
																					} else if (column.id === 'registrar') {
																						$$renderer.push(`<!--[1-->${$.escape(domain.registrar || '-')}`);
																					} else if (column.id === 'nameservers') {
																						$$renderer.push(`<!--[2-->${$.escape(domain.nameservers || '-')}`);
																					} else if (column.id === 'expiry_date') {
																						$$renderer.push('<!--[3-->');

																						if (domain?.expire) {
																							$$renderer.push('<!--[0-->');
																							DualTimeView($$renderer, { time: domain.expire });
																						} else {
																							$$renderer.push(`<!--[-1-->-`);
																						}

																						$$renderer.push(`<!--]-->`);
																					} else if (column.id === 'renewal') {
																						$$renderer.push('<!--[4-->');

																						if (domain?.renewal) {
																							$$renderer.push('<!--[0-->');
																							DualTimeView($$renderer, { time: domain.renewal });
																						} else {
																							$$renderer.push(`<!--[-1-->-`);
																						}

																						$$renderer.push(`<!--]-->`);
																					} else if (column.id === 'auto_renewal') {
																						$$renderer.push(`<!--[5-->${$.escape(domain?.autoRenewal ? 'On' : 'Off')}`);
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
														}

														$$renderer.push(`<!--]--> `);

														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																column: 'actions',
																root,
																children: ($$renderer) => {
																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			justifyContent: 'flex-end',
																			children: ($$renderer) => {
																				Popover($$renderer, {
																					placement: 'bottom-end',
																					padding: 'none',
																					children: $.invalid_default_snippet,
																					$$slots: {
																						default: ($$renderer, { toggle }) => {
																							Button($$renderer, {
																								text: true,
																								icon: true,
																								children: ($$renderer) => {
																									Icon($$renderer, { icon: IconDotsHorizontal, size: 's' });
																								},
																								$$slots: { default: true }
																							});
																						},

																						tooltip: ($$renderer, { toggle }) => {
																							{
																								if (ActionMenu.Root) {
																									$$renderer.push('<!--[-->');

																									ActionMenu.Root($$renderer, {
																										children: ($$renderer) => {
																											if (!isDomainVerified(domain)) {
																												$$renderer.push('<!--[0-->');

																												if (ActionMenu.Item.Button) {
																													$$renderer.push('<!--[-->');

																													ActionMenu.Item.Button($$renderer, {
																														leadingIcon: IconRefresh,
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->Retry`);
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

																											if (ActionMenu.Item.Button) {
																												$$renderer.push('<!--[-->');

																												ActionMenu.Item.Button($$renderer, {
																													status: 'danger',
																													leadingIcon: IconTrash,
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Delete`);
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
																						}
																					}
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
										}

										$$renderer.push(`<!--]-->`);
									},

									header: ($$renderer, { root }) => {
										{
											$$renderer.push(`<!--[-->`);

											const each_array_2 = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

											for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
												let { id, title } = each_array_2[$$index];

												if (Table.Header.Cell) {
													$$renderer.push('<!--[-->');

													Table.Header.Cell($$renderer, {
														column: id,
														root,
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

											$$renderer.push(`<!--]--> `);

											if (Table.Header.Cell) {
												$$renderer.push('<!--[-->');
												Table.Header.Cell($$renderer, { root, column: 'actions' });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}
									}
								}
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						PaginationWithLimit($$renderer, {
							name: 'Domains',
							limit: data.limit,
							offset: data.offset,
							total: data.domains.total
						});

						$$renderer.push(`<!---->`);
					} else if (data?.query || data?.search) {
						$$renderer.push('<!--[1-->');

						EmptySearch($$renderer, {
							hidePages: true,
							target: 'domains',
							get search() {
								return data.search;
							},

							set search($$value) {
								data.search = $$value;
								$$settled = false;
							},

							$$slots: {
								actions: ($$renderer) => {
									{
										Button($$renderer, {
											secondary: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Clear filters`);
											},
											$$slots: { default: true }
										});
									}
								}
							}
						});
					} else {
						$$renderer.push('<!--[-1-->');

						if (Card.Base) {
							$$renderer.push('<!--[-->');

							Card.Base($$renderer, {
								padding: 'none',
								children: ($$renderer) => {
									Empty($$renderer, {
										src: $.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark'
											? `${base}/images/domains/empty-domain-dark.svg`
											: `${base}/images/domains/empty-domain-light.svg`,
										title: 'Add your first domain',
										description: 'Connect a domain you own to get your project up and running.',
										$$slots: {
											actions: ($$renderer) => {
												{
													Button($$renderer, {
														external: true,
														href: 'https://appwrite.io/docs/products/network/dns',
														text: true,
														event: 'empty_documentation',
														size: 's',
														ariaLabel: 'add domain',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Documentation`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Button($$renderer, {
														secondary: true,
														href: `${base}/organization-${page.params.organization}/domains/add-domain`,
														size: 's',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Add domain`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
												}
											}
										}
									});
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

			$$renderer.push(`<!----> `);

			if (showDelete) {
				$$renderer.push('<!--[0-->');

				DeleteDomainModal($$renderer, {
					selectedDomain,
					get show() {
						return showDelete;
					},

					set show($$value) {
						showDelete = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (showRetry) {
				$$renderer.push('<!--[0-->');

				RetryDomainModal($$renderer, {
					selectedDomain,
					get show() {
						return showRetry;
					},

					set show($$value) {
						showRetry = $$value;
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
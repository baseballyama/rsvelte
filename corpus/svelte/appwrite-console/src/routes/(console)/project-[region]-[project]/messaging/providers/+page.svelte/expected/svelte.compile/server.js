import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { Button } from '$lib/elements/forms';
import { EmptySearch, PaginationWithLimit, EmptyFilter } from '$lib/components';
import { Container, ResponsiveContainerHeader } from '$lib/layout';
import { columns } from './store';
import { hasPageQueries } from '$lib/components/filters';
import CreateProviderDropdown from './createProviderDropdown.svelte';
import Table from './table.svelte';
import { base } from '$app/paths';
import { canWriteProviders } from '$lib/stores/roles';
import { Card, Empty, Icon } from '@appwrite.io/pink-svelte';
import { View } from '$lib/helpers/load';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;

		Container($$renderer, {
			children: ($$renderer) => {
				ResponsiveContainerHeader($$renderer, {
					columns,
					view: View.Table,
					hideView: true,
					hasFilters: true,
					hasSearch: true,
					filtersStyle: 'dropdown',
					analyticsSource: 'messaging_providers',
					searchPlaceholder: 'Search by name or ID',
					children: ($$renderer) => {
						if ($.store_get($$store_subs ??= {}, '$canWriteProviders', canWriteProviders)) {
							$$renderer.push('<!--[0-->');

							CreateProviderDropdown($$renderer, {
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$renderer, { toggle }) => {
										Button($$renderer, {
											event: 'create_provider',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Create provider`);
											},

											$$slots: {
												default: true,
												start: ($$renderer) => {
													Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
												}
											}
										});
									}
								}
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (data.providers.total) {
					$$renderer.push('<!--[0-->');
					Table($$renderer, { data });
					$$renderer.push(`<!----> `);

					PaginationWithLimit($$renderer, {
						name: 'Providers',
						limit: data.limit,
						offset: data.offset,
						total: data.providers.total
					});

					$$renderer.push(`<!---->`);
				} else if ($.store_get($$store_subs ??= {}, '$hasPageQueries', hasPageQueries)) {
					$$renderer.push('<!--[1-->');
					EmptyFilter($$renderer, { resource: 'providers' });
				} else if (data.search && data.search !== 'empty') {
					$$renderer.push('<!--[2-->');

					EmptySearch($$renderer, {
						target: 'providers',
						search: data.search,
						children: ($$renderer) => {
							Button($$renderer, {
								secondary: true,
								href: `${base}/project-${page.params.region}-${page.params.project}/messaging/providers`,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Clear search`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');

					if (Card.Base) {
						$$renderer.push('<!--[-->');

						Card.Base($$renderer, {
							padding: 'none',
							children: ($$renderer) => {
								Empty($$renderer, {
									title: 'Create your first provider',
									description: 'Need a hand? Learn more in our documentation.',
									$$slots: {
										actions: ($$renderer) => {
											{
												Button($$renderer, {
													external: true,
													href: 'https://appwrite.io/docs/products/messaging/providers',
													text: true,
													event: 'empty_documentation',
													size: 's',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Documentation`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												if ($.store_get($$store_subs ??= {}, '$canWriteProviders', canWriteProviders)) {
													$$renderer.push('<!--[0-->');

													CreateProviderDropdown($$renderer, {
														children: $.invalid_default_snippet,
														$$slots: {
															default: ($$renderer, { toggle }) => {
																Button($$renderer, {
																	event: 'create_provider',
																	secondary: true,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Create provider`);
																	},
																	$$slots: { default: true }
																});
															}
														}
													});
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]-->`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
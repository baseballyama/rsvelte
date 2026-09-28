import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteProviders = () => $.store_get(canWriteProviders, '$canWriteProviders', $$stores);
	const $hasPageQueries = () => $.store_get(hasPageQueries, '$hasPageQueries', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	Container($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ResponsiveContainerHeader(node, {
				get columns() {
					return columns;
				},

				get view() {
					return View.Table;
				},
				hideView: true,
				hasFilters: true,
				hasSearch: true,
				filtersStyle: 'dropdown',
				analyticsSource: 'messaging_providers',
				searchPlaceholder: 'Search by name or ID',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							CreateProviderDropdown($$anchor, {
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$anchor, $$slotProps) => {
										const toggle = $.derived(() => $$slotProps.toggle);

										Button($$anchor, {
											event: 'create_provider',
											$$events: {
												click: function (...$$args) {
													$.get(toggle)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Create provider');

												$.append($$anchor, text);
											},

											$$slots: {
												default: true,
												start: ($$anchor, $$slotProps) => {
													Icon($$anchor, {
														get icon() {
															return IconPlus;
														},
														slot: 'start',
														size: 's'
													});
												}
											}
										});
									}
								}
							});
						};

						$.if(node_1, ($$render) => {
							if ($canWriteProviders()) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_6 = root();
					var node_3 = $.first_child(fragment_6);

					Table(node_3, {
						get data() {
							return $$props.data;
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PaginationWithLimit(node_4, {
						name: 'Providers',
						get limit() {
							return $$props.data.limit;
						},

						get offset() {
							return $$props.data.offset;
						},

						get total() {
							return $$props.data.providers.total;
						}
					});

					$.append($$anchor, fragment_6);
				};

				var consequent_2 = ($$anchor) => {
					EmptyFilter($$anchor, { resource: 'providers' });
				};

				var consequent_3 = ($$anchor) => {
					EmptySearch($$anchor, {
						target: 'providers',
						get search() {
							return $$props.data.search;
						},

						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/messaging/providers`);

								Button($$anchor, {
									secondary: true,
									get href() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Clear search');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				};

				var alternate = ($$anchor) => {
					var fragment_10 = $.comment();
					var node_5 = $.first_child(fragment_10);

					$.component(node_5, () => Card.Base, ($$anchor, Card_Base) => {
						Card_Base($$anchor, {
							padding: 'none',
							children: ($$anchor, $$slotProps) => {
								Empty($$anchor, {
									title: 'Create your first provider',
									description: 'Need a hand? Learn more in our documentation.',
									$$slots: {
										actions: ($$anchor, $$slotProps) => {
											var fragment_12 = root();
											var node_6 = $.first_child(fragment_12);

											Button(node_6, {
												external: true,
												href: 'https://appwrite.io/docs/products/messaging/providers',
												text: true,
												event: 'empty_documentation',
												size: 's',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Documentation');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});

											var node_7 = $.sibling(node_6, 2);

											{
												var consequent_4 = ($$anchor) => {
													CreateProviderDropdown($$anchor, {
														children: $.invalid_default_snippet,
														$$slots: {
															default: ($$anchor, $$slotProps) => {
																const toggle = $.derived(() => $$slotProps.toggle);

																Button($$anchor, {
																	event: 'create_provider',
																	secondary: true,
																	$$events: {
																		click: function (...$$args) {
																			$.get(toggle)?.apply(this, $$args);
																		}
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('Create provider');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															}
														}
													});
												};

												$.if(node_7, ($$render) => {
													if ($canWriteProviders()) $$render(consequent_4);
												});
											}

											$.append($$anchor, fragment_12);
										}
									}
								});
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_10);
				};

				$.if(node_2, ($$render) => {
					if ($$props.data.providers.total) $$render(consequent_1); else if ($hasPageQueries()) $$render(consequent_2, 1); else if ($$props.data.search && $$props.data.search !== 'empty') $$render(consequent_3, 2); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}
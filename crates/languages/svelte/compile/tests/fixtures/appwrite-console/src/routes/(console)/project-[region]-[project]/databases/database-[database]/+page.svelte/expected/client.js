import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { EmptySearch, PaginationWithLimit, SearchQuery, ViewSelector } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { Container } from '$lib/layout';
import { showCreateEntity, tableViewColumns } from './store';
import Table from './table.svelte';
import Grid from './grid.svelte';
import { Card, Empty, Icon, Layout } from '@appwrite.io/pink-svelte';
import { app } from '$lib/stores/app';
import { canWriteTables } from '$lib/stores/roles';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { page } from '$app/state';
import { resolveRoute } from '$lib/stores/navigation';
import { getTerminologies } from '$database/(entity)';
import { withPath } from '$lib/stores/navigation.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span slot="description"> </span>`);
var root_2 = $.from_html(`<span slot="actions"><!> <!></span>`);
var root_3 = $.from_html(`<div class="empty-container svelte-nkeoo5"><!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $canWriteTables = () => $.store_get(canWriteTables, '$canWriteTables', $$stores);
	const $showCreateEntity = () => $.store_get(showCreateEntity, '$showCreateEntity', $$stores);
	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { databaseSdk, terminology } = getTerminologies();
	const entityTitle = terminology.entity.title;
	const entityLower = terminology.entity.lower;

	/**
	 * init update because `getContext`
	 * doesn't work on TypeScript context!
	 */
	tableViewColumns.update((columns) => {
		/* $id */
		columns[0].title = `${entityTitle.singular} ID`;

		return columns;
	});

	function getImageRoute(type) {
		return withPath(resolveRoute('/'), `/images/databases/empty-${terminology.type}-${type}.svg`);
	}

	const emptyPageText = $.derived(() => {
		switch (terminology.type) {
			default:

			case 'legacy':

			case 'tablesdb':
				return `Create, organize, and query structured data with ${entityTitle.plural}.`;

			case 'documentsdb':
				return `Store, manage, and query unstructured data with ${entityTitle.plural}.`;
		}
	});

	Container($$anchor, {
		databasesMainScreen: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'row',
					justifyContent: 'space-between',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								direction: 'row',
								alignItems: 'center',
								children: ($$anchor, $$slotProps) => {
									SearchQuery($$anchor, { placeholder: 'Search by name or ID' });
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
							Layout_Stack_2($$anchor, {
								direction: 'row',
								alignItems: 'center',
								justifyContent: 'flex-end',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_3 = $.first_child(fragment_4);

									{
										let $0 = $.derived(() => !$$props.data.entities.total);
										let $1 = $.derived(() => !$$props.data.entities.total);

										ViewSelector(node_3, {
											ui: 'new',
											get view() {
												return $$props.data.view;
											},

											get columns() {
												return tableViewColumns;
											},

											get hideColumns() {
												return $.get($0);
											},

											get hideView() {
												return $.get($1);
											}
										});
									}

									var node_4 = $.sibling(node_3, 2);

									{
										var consequent = ($$anchor) => {
											Button($$anchor, {
												event: 'create_table',
												$$events: { click: () => $.store_set(showCreateEntity, true) },
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, `Create ${entityLower.singular ?? ''}`));
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
										};

										$.if(node_4, ($$render) => {
											if ($canWriteTables()) $$render(consequent);
										});
									}

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_8 = root();
					var node_6 = $.first_child(fragment_8);

					{
						var consequent_1 = ($$anchor) => {
							Grid($$anchor, {
								get data() {
									return $$props.data;
								},

								get terminology() {
									return terminology;
								},

								get showCreate() {
									$.mark_store_binding();

									return $showCreateEntity();
								},

								set showCreate($$value) {
									$.store_set(showCreateEntity, $$value);
								}
							});
						};

						var alternate = ($$anchor) => {
							Table($$anchor, {
								get terminology() {
									return terminology;
								},

								get databaseSdk() {
									return databaseSdk;
								},

								get entities() {
									return $$props.data.entities;
								}
							});
						};

						$.if(node_6, ($$render) => {
							if ($$props.data.view === 'grid') $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					var node_7 = $.sibling(node_6, 2);

					PaginationWithLimit(node_7, {
						get limit() {
							return $$props.data.limit;
						},

						get offset() {
							return $$props.data.offset;
						},

						get total() {
							return $$props.data.entities.total;
						},

						get name() {
							return entityTitle.plural;
						}
					});

					$.append($$anchor, fragment_8);
				};

				var consequent_3 = ($$anchor) => {
					EmptySearch($$anchor, {
						get target() {
							return entityLower.singular;
						},
						hidePagination: true,
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', page.params));

								Button($$anchor, {
									size: 's',
									secondary: true,
									get href() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Clear Search');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				};

				var alternate_1 = ($$anchor) => {
					var fragment_13 = $.comment();
					var node_8 = $.first_child(fragment_13);

					$.component(node_8, () => Card.Base, ($$anchor, Card_Base) => {
						Card_Base($$anchor, {
							padding: 'none',
							children: ($$anchor, $$slotProps) => {
								var div = root_3();
								var node_9 = $.child(div);

								{
									let $0 = $.derived(() => getImageRoute($app().themeInUse));

									Empty(node_9, {
										get src() {
											return $.get($0);
										},

										get title() {
											return `Create your first ${entityLower.singular ?? ''}`;
										},

										$$slots: {
											description: ($$anchor, $$slotProps) => {
												var span = root_1();
												var text_2 = $.only_child(span, true);

												$.template_effect(() => $.set_text(text_2, $.get(emptyPageText)));
												$.append($$anchor, span);
											},

											actions: ($$anchor, $$slotProps) => {
												var span_1 = root_2();
												var node_10 = $.child(span_1);

												Button(node_10, {
													external: true,
													href: 'https://appwrite.io/docs/products/databases/databases',
													text: true,
													event: 'empty_documentation',
													get ariaLabel() {
														return `read ${entityLower.singular ?? ''} documentation`;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_3 = $.text('Documentation');

														$.append($$anchor, text_3);
													},
													$$slots: { default: true }
												});

												var node_11 = $.sibling(node_10, 2);

												{
													var consequent_4 = ($$anchor) => {
														Button($$anchor, {
															secondary: true,
															$$events: { click: () => $.store_set(showCreateEntity, true) },
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text();

																$.template_effect(() => $.set_text(text_4, `Create ${entityLower.singular ?? ''}`));
																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													};

													$.if(node_11, ($$render) => {
														if ($canWriteTables()) $$render(consequent_4);
													});
												}

												$.reset(span_1);
												$.append($$anchor, span_1);
											}
										}
									});
								}

								$.reset(div);
								$.append($$anchor, div);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_13);
				};

				$.if(node_5, ($$render) => {
					if ($$props.data.entities.total) $$render(consequent_2); else if ($$props.data.search) $$render(consequent_3, 1); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}
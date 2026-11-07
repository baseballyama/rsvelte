import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				databasesMainScreen: true,
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							justifyContent: 'space-between',
							children: ($$renderer) => {
								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										alignItems: 'center',
										children: ($$renderer) => {
											SearchQuery($$renderer, { placeholder: 'Search by name or ID' });
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
										alignItems: 'center',
										justifyContent: 'flex-end',
										children: ($$renderer) => {
											ViewSelector($$renderer, {
												ui: 'new',
												view: data.view,
												columns: tableViewColumns,
												hideColumns: !data.entities.total,
												hideView: !data.entities.total
											});

											$$renderer.push(`<!----> `);

											if ($.store_get($$store_subs ??= {}, '$canWriteTables', canWriteTables)) {
												$$renderer.push('<!--[0-->');

												Button($$renderer, {
													event: 'create_table',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Create ${$.escape(entityLower.singular)}`);
													},

													$$slots: {
														default: true,
														start: ($$renderer) => {
															Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
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

					if (data.entities.total) {
						$$renderer.push('<!--[0-->');

						if (data.view === 'grid') {
							$$renderer.push('<!--[0-->');

							Grid($$renderer, {
								data,
								terminology,
								get showCreate() {
									return $.store_get($$store_subs ??= {}, '$showCreateEntity', showCreateEntity);
								},

								set showCreate($$value) {
									$.store_set(showCreateEntity, $$value);
									$$settled = false;
								}
							});
						} else {
							$$renderer.push('<!--[-1-->');
							Table($$renderer, { terminology, databaseSdk, entities: data.entities });
						}

						$$renderer.push(`<!--]--> `);

						PaginationWithLimit($$renderer, {
							limit: data.limit,
							offset: data.offset,
							total: data.entities.total,
							name: entityTitle.plural
						});

						$$renderer.push(`<!---->`);
					} else if (data.search) {
						$$renderer.push('<!--[1-->');

						EmptySearch($$renderer, {
							target: entityLower.singular,
							hidePagination: true,
							children: ($$renderer) => {
								Button($$renderer, {
									size: 's',
									secondary: true,
									href: resolveRoute('/(console)/project-[region]-[project]/databases/database-[database]', page.params),
									children: ($$renderer) => {
										$$renderer.push(`<!---->Clear Search`);
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
									$$renderer.push(`<div class="empty-container svelte-nkeoo5">`);

									Empty($$renderer, {
										src: getImageRoute($.store_get($$store_subs ??= {}, '$app', app).themeInUse),
										title: `Create your first ${$.stringify(entityLower.singular)}`,
										$$slots: {
											description: ($$renderer) => {
												$$renderer.push(`<span slot="description">${$.escape(emptyPageText())}</span>`);
											},

											actions: ($$renderer) => {
												$$renderer.push(`<span slot="actions">`);

												Button($$renderer, {
													external: true,
													href: 'https://appwrite.io/docs/products/databases/databases',
													text: true,
													event: 'empty_documentation',
													ariaLabel: `read ${$.stringify(entityLower.singular)} documentation`,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Documentation`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												if ($.store_get($$store_subs ??= {}, '$canWriteTables', canWriteTables)) {
													$$renderer.push('<!--[0-->');

													Button($$renderer, {
														secondary: true,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Create ${$.escape(entityLower.singular)}`);
														},
														$$slots: { default: true }
													});
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--></span>`);
											}
										}
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
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
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
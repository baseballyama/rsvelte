import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { onDestroy } from 'svelte';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { canWriteTables } from '$lib/stores/roles';
import { Typography, Link } from '@appwrite.io/pink-svelte';
import IconAI from '../../(suggestions)/icon/aiForButton.svelte';
import { showCreateColumnSheet } from '$database/table-[table]/store';
import { IconBookOpen, IconPlus } from '@appwrite.io/pink-icons-svelte';
import { showIndexesSuggestions, showColumnsSuggestionsModal } from '$database/(suggestions)';
import { Indexes, EmptySheet, EmptySheetCards } from '$database/(entity)';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		const params = $.derived(() => ({ databaseId: page.params.database, tableId: page.params.table }));
		const tablesDB = $.derived(() => sdk.forProject(page.params.region, page.params.project).tablesDB);

		async function onCreateIndex(index) {
			await tablesDB().createIndex({
				...params(),
				key: index.key,
				type: index.type,
				columns: index.fields,
				lengths: index.lengths,
				orders: index.orders
			});
		}

		async function onDeleteIndexes(selectedKeys) {
			await Promise.all(selectedKeys.map((key) => tablesDB().deleteIndex({ ...params(), key })));
		}

		onDestroy(() => $.store_mutate($$store_subs ??= {}, '$showCreateColumnSheet', showCreateColumnSheet, $.store_get($$store_subs ??= {}, '$showCreateColumnSheet', showCreateColumnSheet).show = false));

		{
			function emptyIndexesSheetView($$renderer, toggle) {
				{
					function subtitle($$renderer) {
						if (isCloud) {
							$$renderer.push('<!--[0-->');

							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									align: 'center',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Need a hand? Learn more in the `);

										if (Link.Anchor) {
											$$renderer.push('<!--[-->');

											Link.Anchor($$renderer, {
												target: '_blank',
												href: 'https://appwrite.io/docs/products/databases/tables#indexes',
												children: ($$renderer) => {
													$$renderer.push(`<!---->docs.`);
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
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					function actions($$renderer) {
						if (isCloud) {
							$$renderer.push('<!--[0-->');

							EmptySheetCards($$renderer, {
								icon: IconAI,
								title: 'Suggest indexes',
								disabled: !data.table?.fields?.length,
								subtitle: 'Use AI to generate indexes',
								onClick: () => {
									showIndexesSuggestions.update(() => true);
								}
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						EmptySheetCards($$renderer, {
							icon: IconPlus,
							title: 'Create index',
							disabled: !data.table?.fields?.length,
							subtitle: 'Create indexes manually',
							onClick: toggle
						});

						$$renderer.push(`<!----> `);

						if (!isCloud) {
							$$renderer.push('<!--[0-->');

							EmptySheetCards($$renderer, {
								icon: IconBookOpen,
								title: 'Documentation',
								subtitle: 'Read the Appwrite docs',
								href: 'https://appwrite.io/docs/products/databases/tables#indexes'
							});
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					EmptySheet($$renderer, {
						mode: 'indexes',
						showActions: $.store_get($$store_subs ??= {}, '$canWriteTables', canWriteTables),
						subtitle,
						actions,
						$$slots: { subtitle: true, actions: true }
					});
				}
			}

			function emptyEntitiesSheetView($$renderer) {
				{
					function subtitle($$renderer) {
						if (isCloud) {
							$$renderer.push('<!--[0-->');

							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									align: 'center',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Need a hand? Learn more in the `);

										if (Link.Anchor) {
											$$renderer.push('<!--[-->');

											Link.Anchor($$renderer, {
												target: '_blank',
												href: 'https://appwrite.io/docs/products/databases/tables#columns',
												children: ($$renderer) => {
													$$renderer.push(`<!---->docs.`);
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
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					function actions($$renderer) {
						if (isCloud) {
							$$renderer.push('<!--[0-->');

							EmptySheetCards($$renderer, {
								icon: IconAI,
								title: 'Suggest columns',
								subtitle: 'Use AI to generate columns',
								onClick: () => {
									$.store_set(showColumnsSuggestionsModal, true);
								}
							});

							$$renderer.push(`<!----> `);

							EmptySheetCards($$renderer, {
								icon: IconPlus,
								title: 'Create column',
								subtitle: 'Create columns manually',
								onClick: () => {
									$.store_mutate($$store_subs ??= {}, '$showCreateColumnSheet', showCreateColumnSheet, $.store_get($$store_subs ??= {}, '$showCreateColumnSheet', showCreateColumnSheet).show = true);
								}
							});

							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');

							EmptySheetCards($$renderer, {
								icon: IconPlus,
								title: 'Create column',
								subtitle: 'Create columns manually',
								onClick: () => {
									$.store_mutate($$store_subs ??= {}, '$showCreateColumnSheet', showCreateColumnSheet, $.store_get($$store_subs ??= {}, '$showCreateColumnSheet', showCreateColumnSheet).show = true);
								}
							});

							$$renderer.push(`<!----> `);

							EmptySheetCards($$renderer, {
								icon: IconBookOpen,
								title: 'Documentation',
								subtitle: 'Read the Appwrite docs',
								href: 'https://appwrite.io/docs/products/databases/tables#columns'
							});

							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!--]-->`);
					}

					EmptySheet($$renderer, {
						mode: 'indexes',
						title: 'You have no columns yet',
						showActions: $.store_get($$store_subs ??= {}, '$canWriteTables', canWriteTables),
						subtitle,
						actions,
						$$slots: { subtitle: true, actions: true }
					});
				}
			}

			Indexes($$renderer, {
				onCreateIndex,
				onDeleteIndexes,
				entity: data.table,
				emptyIndexesSheetView,
				emptyEntitiesSheetView,
				$$slots: { emptyIndexesSheetView: true, emptyEntitiesSheetView: true }
			});
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
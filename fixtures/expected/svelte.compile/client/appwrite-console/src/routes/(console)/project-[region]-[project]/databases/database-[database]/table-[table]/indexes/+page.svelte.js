import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`Need a hand? Learn more in the <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $showCreateColumnSheet = () => $.store_get(showCreateColumnSheet, '$showCreateColumnSheet', $$stores);
	const $canWriteTables = () => $.store_get(canWriteTables, '$canWriteTables', $$stores);
	const $showColumnsSuggestionsModal = () => $.store_get(showColumnsSuggestionsModal, '$showColumnsSuggestionsModal', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const params = $.derived(() => ({ databaseId: page.params.database, tableId: page.params.table }));
	const tablesDB = $.derived(() => sdk.forProject(page.params.region, page.params.project).tablesDB);

	async function onCreateIndex(index) {
		await $.get(tablesDB).createIndex({
			...$.get(params),
			key: index.key,
			type: index.type,
			columns: index.fields,
			lengths: index.lengths,
			orders: index.orders
		});
	}

	async function onDeleteIndexes(selectedKeys) {
		await Promise.all(selectedKeys.map((key) => $.get(tablesDB).deleteIndex({ ...$.get(params), key })));
	}

	onDestroy(() => $.store_mutate(showCreateColumnSheet, $.untrack($showCreateColumnSheet).show = false, $.untrack($showCreateColumnSheet)));

	{
		const emptyIndexesSheetView = ($$anchor, toggle = $.noop) => {
			{
				const subtitle = ($$anchor) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.component(node_1, () => Typography.Text, ($$anchor, Typography_Text) => {
								Typography_Text($$anchor, {
									align: 'center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_4 = root();
										var node_2 = $.sibling($.first_child(fragment_4));

										$.component(node_2, () => Link.Anchor, ($$anchor, Link_Anchor) => {
											Link_Anchor($$anchor, {
												target: '_blank',
												href: 'https://appwrite.io/docs/products/databases/tables#indexes',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('docs.');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						};

						$.if(node, ($$render) => {
							if (isCloud) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				};

				const actions = ($$anchor) => {
					var fragment_5 = root_1();
					var node_3 = $.first_child(fragment_5);

					{
						var consequent_1 = ($$anchor) => {
							{
								let $0 = $.derived(() => !$$props.data.table?.fields?.length);

								EmptySheetCards($$anchor, {
									get icon() {
										return IconAI;
									},
									title: 'Suggest indexes',
									get disabled() {
										return $.get($0);
									},
									subtitle: 'Use AI to generate indexes',
									onClick: () => {
										showIndexesSuggestions.update(() => true);
									}
								});
							}
						};

						$.if(node_3, ($$render) => {
							if (isCloud) $$render(consequent_1);
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						let $0 = $.derived(() => !$$props.data.table?.fields?.length);

						EmptySheetCards(node_4, {
							get icon() {
								return IconPlus;
							},
							title: 'Create index',
							get disabled() {
								return $.get($0);
							},
							subtitle: 'Create indexes manually',
							get onClick() {
								return toggle();
							}
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						var consequent_2 = ($$anchor) => {
							EmptySheetCards($$anchor, {
								get icon() {
									return IconBookOpen;
								},
								title: 'Documentation',
								subtitle: 'Read the Appwrite docs',
								href: 'https://appwrite.io/docs/products/databases/tables#indexes'
							});
						};

						$.if(node_5, ($$render) => {
							if (!isCloud) $$render(consequent_2);
						});
					}

					$.append($$anchor, fragment_5);
				};

				EmptySheet($$anchor, {
					mode: 'indexes',
					get showActions() {
						return $canWriteTables();
					},
					subtitle,
					actions,
					$$slots: { subtitle: true, actions: true }
				});
			}
		};

		const emptyEntitiesSheetView = ($$anchor) => {
			{
				const subtitle = ($$anchor) => {
					var fragment_9 = $.comment();
					var node_6 = $.first_child(fragment_9);

					{
						var consequent_3 = ($$anchor) => {
							var fragment_10 = $.comment();
							var node_7 = $.first_child(fragment_10);

							$.component(node_7, () => Typography.Text, ($$anchor, Typography_Text_1) => {
								Typography_Text_1($$anchor, {
									align: 'center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_11 = root();
										var node_8 = $.sibling($.first_child(fragment_11));

										$.component(node_8, () => Link.Anchor, ($$anchor, Link_Anchor_1) => {
											Link_Anchor_1($$anchor, {
												target: '_blank',
												href: 'https://appwrite.io/docs/products/databases/tables#columns',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('docs.');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_10);
						};

						$.if(node_6, ($$render) => {
							if (isCloud) $$render(consequent_3);
						});
					}

					$.append($$anchor, fragment_9);
				};

				const actions = ($$anchor) => {
					var fragment_12 = $.comment();
					var node_9 = $.first_child(fragment_12);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_13 = root_2();
							var node_10 = $.first_child(fragment_13);

							EmptySheetCards(node_10, {
								get icon() {
									return IconAI;
								},
								title: 'Suggest columns',
								subtitle: 'Use AI to generate columns',
								onClick: () => {
									$.store_set(showColumnsSuggestionsModal, true);
								}
							});

							var node_11 = $.sibling(node_10, 2);

							EmptySheetCards(node_11, {
								get icon() {
									return IconPlus;
								},
								title: 'Create column',
								subtitle: 'Create columns manually',
								onClick: () => {
									$.store_mutate(showCreateColumnSheet, $.untrack($showCreateColumnSheet).show = true, $.untrack($showCreateColumnSheet));
								}
							});

							$.append($$anchor, fragment_13);
						};

						var alternate = ($$anchor) => {
							var fragment_14 = root_2();
							var node_12 = $.first_child(fragment_14);

							EmptySheetCards(node_12, {
								get icon() {
									return IconPlus;
								},
								title: 'Create column',
								subtitle: 'Create columns manually',
								onClick: () => {
									$.store_mutate(showCreateColumnSheet, $.untrack($showCreateColumnSheet).show = true, $.untrack($showCreateColumnSheet));
								}
							});

							var node_13 = $.sibling(node_12, 2);

							EmptySheetCards(node_13, {
								get icon() {
									return IconBookOpen;
								},
								title: 'Documentation',
								subtitle: 'Read the Appwrite docs',
								href: 'https://appwrite.io/docs/products/databases/tables#columns'
							});

							$.append($$anchor, fragment_14);
						};

						$.if(node_9, ($$render) => {
							if (isCloud) $$render(consequent_4); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_12);
				};

				EmptySheet($$anchor, {
					mode: 'indexes',
					title: 'You have no columns yet',
					get showActions() {
						return $canWriteTables();
					},
					subtitle,
					actions,
					$$slots: { subtitle: true, actions: true }
				});
			}
		};

		Indexes($$anchor, {
			onCreateIndex,
			onDeleteIndexes,
			get entity() {
				return $$props.data.table;
			},
			emptyIndexesSheetView,
			emptyEntitiesSheetView,
			$$slots: { emptyIndexesSheetView: true, emptyEntitiesSheetView: true }
		});
	}

	$.pop();
	$$cleanup();
}
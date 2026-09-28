import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

import {
	Indexes,
	EmptySheet,
	EmptySheetCards,
	toDatabaseType,
	useDatabaseSdk
} from '$database/(entity)';

import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import CreateIndexForm from './createIndex.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		let createIndexRef;
		const databaseType = $.derived(() => toDatabaseType(data.database.type));
		const databaseSdk = useDatabaseSdk(page.params.region, page.params.project, databaseType());

		async function onCreateIndex(index) {
			await databaseSdk.createIndex({
				databaseId: page.params.database,
				entityId: page.params.collection,
				key: index.key,
				type: index.type,
				attributes: index.fields,
				lengths: index.lengths,
				orders: index.orders
			});
		}

		async function onDeleteIndexes(selectedKeys) {
			await Promise.all(selectedKeys.map((key) => databaseSdk.deleteIndex({
				databaseId: page.params.database,
				entityId: page.params.collection,
				key
			})));
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function createIndexForm($$renderer) {
					CreateIndexForm($$renderer, {
						entity: data.collection,
						databaseType: databaseType(),
						onCreateIndex,
						showCreateIndex: true
					});
				}

				function emptyIndexesSheetView($$renderer, toggle) {
					{
						function actions($$renderer) {
							EmptySheetCards($$renderer, {
								icon: IconPlus,
								title: 'Create index',
								subtitle: 'Create indexes manually',
								onClick: toggle
							});
						}

						EmptySheet($$renderer, {
							mode: 'indexes',
							type: databaseType(),
							actions,
							$$slots: { actions: true }
						});
					}
				}

				Indexes($$renderer, {
					onCreateIndex,
					onDeleteIndexes,
					entity: data.collection,
					get createIndexRef() {
						return createIndexRef;
					},

					set createIndexRef($$value) {
						createIndexRef = $$value;
						$$settled = false;
					},
					createIndexForm,
					emptyIndexesSheetView,
					$$slots: { createIndexForm: true, emptyIndexesSheetView: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}
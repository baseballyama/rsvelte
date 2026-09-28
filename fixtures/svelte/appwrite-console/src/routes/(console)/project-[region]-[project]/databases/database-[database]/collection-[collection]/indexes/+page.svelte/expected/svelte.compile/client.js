import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let createIndexRef;
	const databaseType = $.derived(() => toDatabaseType($$props.data.database.type));
	const databaseSdk = useDatabaseSdk(page.params.region, page.params.project, $.get(databaseType));

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

	{
		const createIndexForm = ($$anchor) => {
			$.bind_this(
				CreateIndexForm($$anchor, {
					get entity() {
						return $$props.data.collection;
					},

					get databaseType() {
						return $.get(databaseType);
					},
					onCreateIndex,
					showCreateIndex: true
				}),
				($$value) => createIndexRef = $$value,
				() => createIndexRef
			);
		};

		const emptyIndexesSheetView = ($$anchor, toggle = $.noop) => {
			{
				const actions = ($$anchor) => {
					EmptySheetCards($$anchor, {
						get icon() {
							return IconPlus;
						},
						title: 'Create index',
						subtitle: 'Create indexes manually',
						get onClick() {
							return toggle();
						}
					});
				};

				EmptySheet($$anchor, {
					mode: 'indexes',
					get type() {
						return $.get(databaseType);
					},
					actions,
					$$slots: { actions: true }
				});
			}
		};

		Indexes($$anchor, {
			onCreateIndex,
			onDeleteIndexes,
			get entity() {
				return $$props.data.collection;
			},

			get createIndexRef() {
				return createIndexRef;
			},

			set createIndexRef($$value) {
				createIndexRef = $$value;
			},
			createIndexForm,
			emptyIndexesSheetView,
			$$slots: { createIndexForm: true, emptyIndexesSheetView: true }
		});
	}

	$.pop();
}
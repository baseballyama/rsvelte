import * as $ from 'svelte/internal/server';
import { Divider, Popover, ActionMenu } from '@appwrite.io/pink-svelte';

import {
	IconArrowLeft,
	IconArrowRight,
	IconClipboardCopy,
	IconDuplicate,
	IconKey,
	IconLink,
	IconPencil,
	IconSortAscending,
	IconSortDescending,
	IconTrash
} from '@appwrite.io/pink-icons-svelte';

import { databaseColumnSheetOptions } from './store';
import { isRelationship } from './rows/store';

export default function SheetOptions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// Only allow sort for these columns
		const internalColumns = ['$sequence', '$id', '$createdAt', '$updatedAt'];

		const headerMenuItems = [
			{ label: 'Update', icon: IconPencil, action: 'update' },
			{
				label: 'Create column left',
				icon: IconArrowLeft,
				action: 'column-left'
			},

			{
				label: 'Create column right',
				icon: IconArrowRight,
				action: 'column-right'
			},

			{
				label: 'Duplicate',
				icon: IconDuplicate,
				action: 'duplicate-header'
			},
			{ divider: true },
			{
				label: 'Create index',
				icon: IconPencil,
				action: 'create-index'
			},

			{
				label: 'Sort ascending',
				icon: IconSortAscending,
				action: 'sort-asc'
			},

			{
				label: 'Sort descending',
				icon: IconSortDescending,
				action: 'sort-desc'
			},
			{ divider: true },
			{
				label: 'Delete',
				icon: IconTrash,
				action: 'delete',
				danger: true
			}
		];

		const rowMenuItems = [
			{ label: 'Update', icon: IconPencil, action: 'update' },
			{
				label: 'Duplicate',
				icon: IconDuplicate,
				action: 'duplicate-row'
			},
			{ divider: true },
			{
				label: 'Manage permissions',
				icon: IconKey,
				action: 'permissions'
			},
			{ divider: true },
			{ label: 'Copy URL', icon: IconLink, action: 'copy-url' },
			{
				label: 'Copy as JSON',
				icon: IconClipboardCopy,
				action: 'copy-json'
			},
			{ divider: true },
			{
				label: 'Delete',
				icon: IconTrash,
				action: 'delete',
				danger: true
			}
		];

		let {
			column,
			columnId = null,
			children,
			onSelect,
			onVisibilityChanged,
			type
		} = $$props;

		function handleSelect(action, hide) {
			hide();
			$.store_mutate($$store_subs ??= {}, '$databaseColumnSheetOptions', databaseColumnSheetOptions, $.store_get($$store_subs ??= {}, '$databaseColumnSheetOptions', databaseColumnSheetOptions).column = column);

			if (action === 'column-left') {
				$.store_mutate($$store_subs ??= {}, '$databaseColumnSheetOptions', databaseColumnSheetOptions, $.store_get($$store_subs ??= {}, '$databaseColumnSheetOptions', databaseColumnSheetOptions).direction = { neighbour: columnId, to: 'left' });
			} else if (action === 'column-right') {
				$.store_mutate($$store_subs ??= {}, '$databaseColumnSheetOptions', databaseColumnSheetOptions, $.store_get($$store_subs ??= {}, '$databaseColumnSheetOptions', databaseColumnSheetOptions).direction = { neighbour: columnId, to: 'right' });
			}

			onSelect(action, columnId);
		}

		function shouldShow(item) {
			const isSequence = columnId === '$sequence';
			const isSystemColumn = internalColumns.includes(columnId);

			if (type === 'header') {
				if (isSequence) {
					return ['sort-asc', 'sort-desc'].includes(item?.action);
				}

				if (['delete', 'update', 'duplicate-header'].includes(item?.action) && isSystemColumn) {
					return false;
				}

				// hide column-left and create-index for $id (first column, already indexed)
				if (columnId === '$id' && ['column-left', 'create-index'].includes(item?.action)) {
					return false;
				}

				// hide sort options for relationship columns
				if (isRelationship(column) && ['sort-asc', 'sort-desc'].includes(item?.action)) {
					return false;
				}
			}

			return true;
		}

		function cleanMenu(items) {
			const visible = items.filter((item) => item.divider || shouldShow(item));

			return visible.filter((item, i, arr) => {
				const prev = arr[i - 1];
				const next = arr[i + 1];

				if (item.divider) {
					return prev && !prev.divider && next && !next.divider;
				}

				return true;
			});
		}

		let htmlSpanElement = null;

		Popover($$renderer, {
			padding: 'none',
			placement: 'bottom-start',
			portal: true,
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { toggle }) => {
					children($$renderer, toggle);
					$$renderer.push(`<!---->`);
				},

				tooltip: ($$renderer, { hide }) => {
					{
						const menuItems = cleanMenu(type === 'header' ? headerMenuItems : rowMenuItems);

						$$renderer.push(`<span></span> <div class="action-menu-root">`);

						if (ActionMenu.Root) {
							$$renderer.push('<!--[-->');

							ActionMenu.Root($$renderer, {
								width: '180px',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(menuItems);

									for (let index = 0, $$length = each_array.length; index < $$length; index++) {
										let item = each_array[index];

										if (item.divider) {
											$$renderer.push('<!--[0-->');

											const isLastDivider = index === menuItems.length - 2;

											$$renderer.push(`<div${$.attr_style('', {
												'margin-inline': '-1rem',
												'padding-block-start': '0.5rem',
												'padding-block-end': isLastDivider ? '0.25rem' : '0.5rem'
											})}>`);

											Divider($$renderer, {});
											$$renderer.push(`<!----></div>`);
										} else if (shouldShow(item)) {
											$$renderer.push('<!--[1-->');

											if (ActionMenu.Item.Button) {
												$$renderer.push('<!--[-->');

												ActionMenu.Item.Button($$renderer, {
													leadingIcon: item.icon,
													status: item.danger ? 'danger' : undefined,
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(item.label)}`);
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

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div>`);
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
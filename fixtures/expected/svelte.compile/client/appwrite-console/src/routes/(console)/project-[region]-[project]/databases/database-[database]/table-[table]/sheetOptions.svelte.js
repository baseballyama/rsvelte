import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<span></span> <div class="action-menu-root"><!></div>`, 1);

export default function SheetOptions($$anchor, $$props) {
	$.push($$props, true);

	const $databaseColumnSheetOptions = () => $.store_get(databaseColumnSheetOptions, '$databaseColumnSheetOptions', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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

	let columnId = $.prop($$props, 'columnId', 3, null);

	function handleSelect(action, hide) {
		hide();
		$.store_mutate(databaseColumnSheetOptions, $.untrack($databaseColumnSheetOptions).column = $$props.column, $.untrack($databaseColumnSheetOptions));

		if (action === 'column-left') {
			$.store_mutate(databaseColumnSheetOptions, $.untrack($databaseColumnSheetOptions).direction = { neighbour: columnId(), to: 'left' }, $.untrack($databaseColumnSheetOptions));
		} else if (action === 'column-right') {
			$.store_mutate(databaseColumnSheetOptions, $.untrack($databaseColumnSheetOptions).direction = { neighbour: columnId(), to: 'right' }, $.untrack($databaseColumnSheetOptions));
		}

		$$props.onSelect(action, columnId());
	}

	function shouldShow(item) {
		const isSequence = columnId() === '$sequence';
		const isSystemColumn = internalColumns.includes(columnId());

		if ($$props.type === 'header') {
			if (isSequence) {
				return ['sort-asc', 'sort-desc'].includes(item?.action);
			}

			if (['delete', 'update', 'duplicate-header'].includes(item?.action) && isSystemColumn) {
				return false;
			}

			// hide column-left and create-index for $id (first column, already indexed)
			if (columnId() === '$id' && ['column-left', 'create-index'].includes(item?.action)) {
				return false;
			}

			// hide sort options for relationship columns
			if (isRelationship($$props.column) && ['sort-asc', 'sort-desc'].includes(item?.action)) {
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

	let htmlSpanElement = $.state(null);

	$.user_effect(() => {
		const visible = $.get(htmlSpanElement) !== null;

		$$props.onVisibilityChanged?.(visible);
	});

	Popover($$anchor, {
		padding: 'none',
		placement: 'bottom-start',
		portal: true,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const toggle = $.derived(() => $$slotProps.toggle);
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children, () => $.get(toggle));
				$.append($$anchor, fragment_1);
			},

			tooltip: ($$anchor, $$slotProps) => {
				const hide = $.derived(() => $$slotProps.hide);
				const menuItems = $.derived(() => cleanMenu($$props.type === 'header' ? headerMenuItems : rowMenuItems));
				var fragment_2 = root_1();
				var span = $.first_child(fragment_2);

				$.bind_this(span, ($$value) => $.set(htmlSpanElement, $$value), () => $.get(htmlSpanElement));

				var div = $.sibling(span, 2);
				var node_1 = $.child(div);

				$.component(node_1, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
					ActionMenu_Root($$anchor, {
						width: '180px',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							$.each(node_2, 17, () => $.get(menuItems), $.index, ($$anchor, item, index) => {
								var fragment_4 = $.comment();
								var node_3 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										const isLastDivider = $.derived(() => index === $.get(menuItems).length - 2);
										var div_1 = root();
										let styles;
										var node_4 = $.child(div_1);

										Divider(node_4, {});
										$.reset(div_1);

										$.template_effect(() => styles = $.set_style(div_1, '', styles, {
											'margin-inline': '-1rem',
											'padding-block-start': '0.5rem',
											'padding-block-end': $.get(isLastDivider) ? '0.25rem' : '0.5rem'
										}));

										$.append($$anchor, div_1);
									};

									var consequent_1 = ($$anchor) => {
										var fragment_5 = $.comment();
										var node_5 = $.first_child(fragment_5);

										{
											let $0 = $.derived(() => $.get(item).danger ? 'danger' : undefined);

											$.component(node_5, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
												ActionMenu_Item_Button($$anchor, {
													get leadingIcon() {
														return $.get(item).icon;
													},

													get status() {
														return $.get($0);
													},

													$$events: {
														click: () => $.get(item).action && handleSelect($.get(item).action, $.get(hide))
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text();

														$.template_effect(() => $.set_text(text, $.get(item).label));
														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_5);
									};

									var d = $.derived(() => shouldShow($.get(item)));

									$.if(node_3, ($$render) => {
										if ($.get(item).divider) $$render(consequent); else if ($.get(d)) $$render(consequent_1, 1);
									});
								}

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);
				$.append($$anchor, fragment_2);
			}
		}
	});

	$.pop();
	$$cleanup();
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/elements/forms';
import { Container } from '$lib/layout';

import {
	ActionMenu,
	Badge,
	Divider,
	FloatingActionBar,
	Icon,
	Layout,
	Link,
	Popover,
	Selector,
	Spreadsheet,
	Tooltip,
	Typography
} from '@appwrite.io/pink-svelte';

import { isRelationship, isSpatialType, isTextType } from '../rows/store';

import {
	columns,
	indexes,
	isTablesCsvImportInProgress,
	reorderItems,
	showCreateIndexSheet,
	INTERNAL_ACTIONS_COLUMN_ID
} from '../store';

import EditColumn from './edit.svelte';
import DeleteColumn from './deleteColumn.svelte';
import { columnOptions } from './store';

import {
	IconArrowSmRight,
	IconDotsHorizontal,
	IconLink,
	IconLocationMarker,
	IconPencil,
	IconPlus,
	IconSwitchHorizontal,
	IconTrash,
	IconViewList,
	IconLockClosed,
	IconFingerPrint,
	IconMail
} from '@appwrite.io/pink-icons-svelte';

import { onDestroy, onMount } from 'svelte';
import { Click, trackEvent } from '$lib/actions/analytics';
import { isSmallViewport } from '$lib/stores/viewport';
import { SideSheet, SpreadsheetContainer, FailedModal, CsvDisabled } from '$database/(entity)';
import { showCreateColumnSheet } from '../store';
import { preferences } from '$lib/stores/preferences';
import { page } from '$app/state';
import { debounce } from '$lib/helpers/debounce';

import {
	LARGE_NUMBER_THRESHOLD,
	LARGE_NUMBER_THRESHOLD_NUM,
	toExponential
} from '$lib/helpers/numbers';

import { realtime } from '$lib/stores/sdk';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { isWaterfallFromFaker } from '$database/store';

var root_1 = $.from_html(`<div slot="tooltip">Encrypted</div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div slot="tooltip" style="white-space: pre-line;"> </div>`);
var root_5 = $.from_html(`<!>  <!>`, 1);
var root_6 = $.from_html(`<div><!></div> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <span> </span>`, 1);
var root_9 = $.from_html(`<div><!></div>`);
var root_10 = $.from_html(`<div class="floating-action-bar svelte-udu459"><!></div>`);
var root_11 = $.from_html(`<!> <div class="databases-spreadsheet"><!> <!></div> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get(columns, '$columns', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const $isWaterfallFromFaker = () => $.store_get(isWaterfallFromFaker, '$isWaterfallFromFaker', $$stores);
	const $showCreateColumnSheet = () => $.store_get(showCreateColumnSheet, '$showCreateColumnSheet', $$stores);
	const $showCreateIndexSheet = () => $.store_get(showCreateIndexSheet, '$showCreateIndexSheet', $$stores);
	const $indexes = () => $.store_get(indexes, '$indexes', $$stores);
	const $isTablesCsvImportInProgress = () => $.store_get(isTablesCsvImportInProgress, '$isTablesCsvImportInProgress', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const updatedColumnsForSheet = $.derived(() => {
		const baseAttrs = [
			{
				key: '$id',
				type: 'string',
				required: true,
				name: '$id',
				selectable: false,
				system: true
			},
			...$columns(),
			{
				key: '$createdAt',
				type: 'datetime',
				required: true,
				name: '$createdAt',
				selectable: false,
				system: true
			},

			{
				key: '$updatedAt',
				type: 'datetime',
				required: true,
				name: '$updatedAt',
				selectable: false,
				system: true
			}
		];

		return reorderItems(baseAttrs, $.get(columnsOrder));
	});

	let error = $.state('');
	let showDropdown = $.proxy([]);
	let showFailed = $.state(false);
	let showDelete = $.state(false);
	let selectedColumns = $.state($.proxy([]));
	let selectedColumn = $.state(null);
	let columnIndexMap = $.proxy({});
	let columnsOrder = $.state($.proxy([]));
	let columnsWidth = $.state(null);
	const tableId = page.params.table;
	const organizationId = $$props.data.organization.$id ?? $$props.data.project.teamId;
	let showEdit = $.state(false);
	let editColumn;

	const columnFormatIcon = {
		ip: IconLocationMarker,
		url: IconLink,
		email: IconMail,
		enum: IconViewList
	};

	const emptyCellsLimit = $.derived(() => $isSmallViewport() ? 14 : 17);

	const emptyCellsCount = $.derived(() => $.get(updatedColumnsForSheet).length >= $.get(emptyCellsLimit)
		? 0
		: $.get(emptyCellsLimit) - $.get(updatedColumnsForSheet).length);

	onMount(() => {
		$.set(columnsOrder, preferences.getColumnOrder(tableId), true);
		$.set(columnsWidth, preferences.getColumnWidths(tableId + '#columns'), true);

		return realtime.forProject(page.params.region, ['project', 'console'], async (response) => {
			if (response.events.includes('databases.*.tables.*.columns.*.delete') || response.events.includes('databases.*.tables.*.columns.*.update') && !$isWaterfallFromFaker()) {
				await invalidate(Dependencies.TABLE);
			}
		});
	});

	function getColumnStatusBadge(status) {
		switch (status) {
			case 'processing':
				return 'warning';

			case 'deleting':

			case 'stuck':

			case 'failed':
				return 'error';

			default:
				return undefined;
		}
	}

	function formatLargeNumber(num) {
		// type-safe abs comparison
		if (typeof num === 'bigint') {
			const absNum = num < 0n ? -num : num;

			if (absNum < LARGE_NUMBER_THRESHOLD) {
				return num.toString();
			}
		} else {
			const absNum = Math.abs(num);

			if (absNum < LARGE_NUMBER_THRESHOLD_NUM) {
				return num.toString();
			}
		}

		return toExponential(num);
	}

	function getMinMaxSizeForColumn(column) {
		if ((column.type === 'string' || column.type === 'varchar') && !column['format'] && column.key !== '$id') {
			const stringColumn = column;

			return { display: `Size: ${stringColumn.size}` };
		} else if (column.type === 'bigint' || column.type === 'integer' || column.type === 'double') {
			const numbersColumn = column;
			const { min, max } = numbersColumn;
			const isMinBigInt = typeof min === 'bigint';
			const isMaxBigInt = typeof max === 'bigint';
			const hasValidMin = isMinBigInt || min > Number.MIN_SAFE_INTEGER;
			const hasValidMax = isMaxBigInt || max < Number.MAX_SAFE_INTEGER;
			let display;
			let tooltip;

			if (hasValidMin && hasValidMax) {
				display = `Min: ${formatLargeNumber(min)}, Max: ${formatLargeNumber(max)}`;

				const shouldShowTooltip = (isMinBigInt
					? (min < 0n ? -min : min) >= LARGE_NUMBER_THRESHOLD
					: Math.abs(min) >= LARGE_NUMBER_THRESHOLD_NUM) || (isMaxBigInt
					? (max < 0n ? -max : max) >= LARGE_NUMBER_THRESHOLD
					: Math.abs(max) >= LARGE_NUMBER_THRESHOLD_NUM);

				if (shouldShowTooltip) {
					tooltip = `Min: ${min.toLocaleString()}\nMax: ${max.toLocaleString()}`;
				}
			} else if (hasValidMin) {
				display = `Min: ${formatLargeNumber(min)}`;

				const shouldShowTooltip = isMinBigInt
					? (min < 0n ? -min : min) >= LARGE_NUMBER_THRESHOLD
					: Math.abs(min) >= LARGE_NUMBER_THRESHOLD_NUM;

				if (shouldShowTooltip) {
					tooltip = `Min: ${min.toLocaleString()}`;
				}
			} else if (hasValidMax) {
				display = `Max: ${formatLargeNumber(max)}`;

				const shouldShowTooltip = isMaxBigInt
					? (max < 0n ? -max : max) >= LARGE_NUMBER_THRESHOLD
					: Math.abs(max) >= LARGE_NUMBER_THRESHOLD_NUM;

				if (shouldShowTooltip) {
					tooltip = `Max: ${max.toLocaleString()}`;
				}
			}

			return display ? { display, tooltip } : undefined;
		} else {
			return undefined;
		}
	}

	function getRelationshipTypeForColumn(column) {
		if (!isRelationship(column)) {
			return null;
		}

		const relationshipMap = {
			oneToOne: 'One to one',
			oneToMany: 'One to many',
			manyToOne: 'Many to one',
			manyToMany: 'Many to many'
		};

		const relationType = column.relationType;
		const formattedType = relationshipMap[relationType] || relationType;

		return `Type: ${formattedType}`;
	}

	function isSystemColumnKey(column) {
		return column.key.startsWith('$');
	}

	function getColumnWidth(columnId, defaultWidth) {
		const savedWidth = $.get(columnsWidth)?.[columnId];

		if (!savedWidth) return defaultWidth;

		return savedWidth.resized;
	}

	function saveColumnsWidth({ columnId, newWidth }) {
		const existing = $.get(columnsWidth)?.[columnId];

		const fixed = existing
			? typeof existing?.fixed === 'number' ? existing.fixed : existing?.fixed?.min
			: newWidth;

		$.set(
			columnsWidth,
			{
				...$.get(columnsWidth) ?? {},
				[columnId]: { fixed, resized: Math.ceil(newWidth) }
			},
			true
		);

		saveColumnWidthsToPreferences({ columnId, newWidth, fixedWidth: fixed });
	}

	const saveColumnWidthsToPreferences = debounce(
		(column) => {
			if (!organizationId) return;

			preferences.saveColumnWidths(organizationId, tableId + '#columns', {
				[column.columnId]: {
					fixed: column.fixedWidth,
					resized: Math.ceil(column.newWidth)
				}
			});
		},
		1000
	);

	onDestroy(() => $.store_mutate(showCreateColumnSheet, $.untrack($showCreateColumnSheet).show = false, $.untrack($showCreateColumnSheet)));

	const spreadsheetColumns = $.derived(() => [
		{
			id: 'key',
			width: getColumnWidth('key', 380),
			minimumWidth: 380,
			resizable: true
		},
		{ id: 'type', width: 150, minimumWidth: 150, resizable: false },
		{
			id: 'indexed',
			width: getColumnWidth('indexed', 150),
			minimumWidth: 150,
			resizable: true
		},

		{
			id: 'default',
			width: getColumnWidth('default', 200),
			minimumWidth: 200,
			resizable: true
		},

		{
			id: INTERNAL_ACTIONS_COLUMN_ID,
			width: 40,
			isAction: true,
			resizable: false
		}
	]);

	$.user_effect(() => {
		if (!$showCreateIndexSheet().show && $showCreateIndexSheet().column) {
			const columnKey = $showCreateIndexSheet().column;
			const isActuallyIndexed = $indexes().some((index) => index.columns.includes(columnKey));

			if (!isActuallyIndexed) {
				columnIndexMap[columnKey] = false;
			}
		}
	});

	var fragment = root_11();
	var node = $.first_child(fragment);

	Container(node, {
		expanded: true,
		get expandHeightButton() {
			return $isSmallViewport();
		},
		style: 'background: var(--bgcolor-neutral-primary)',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					direction: 'row',
					justifyContent: 'flex-end',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								Button($$anchor, {
									size: 's',
									secondary: true,
									get disabled() {
										return $isTablesCsvImportInProgress();
									},
									event: 'create_attribute',
									$$events: {
										click: () => $.store_mutate(showCreateColumnSheet, $.untrack($showCreateColumnSheet).show = true, $.untrack($showCreateColumnSheet))
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Create column');

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

							$.if(node_2, ($$render) => {
								if ($.get(updatedColumnsForSheet)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_3 = $.child(div);

	SpreadsheetContainer(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = $.comment();
			var node_4 = $.first_child(fragment_5);

			$.component(node_4, () => Spreadsheet.Root, ($$anchor, Spreadsheet_Root) => {
				Spreadsheet_Root($$anchor, {
					height: '100%',
					allowSelection: true,
					get emptyCells() {
						return $.get(emptyCellsCount);
					},

					get columns() {
						return $.get(spreadsheetColumns);
					},
					bottomActionClick: () => $.store_mutate(showCreateColumnSheet, $.untrack($showCreateColumnSheet).show = true, $.untrack($showCreateColumnSheet)),
					get selectedRows() {
						return $.get(selectedColumns);
					},

					set selectedRows($$value) {
						$.set(selectedColumns, $$value, true);
					},
					$$events: { columnsResize: (resize) => saveColumnsWidth(resize.detail) },
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							const root = $.derived(() => $$slotProps.root);
							var fragment_6 = $.comment();
							var node_5 = $.first_child(fragment_6);

							$.each(node_5, 19, () => $.get(updatedColumnsForSheet), (column) => column.key, ($$anchor, column, index) => {
								const isId = $.derived(() => $.get(column).key === '$id');
								const option = $.derived(() => columnOptions.find((option) => option.type === $.get(column).type && option.format === ('format' in $.get(column) && $.get(column).format ? $.get(column).format : undefined)));
								const isSelectable = $.derived(() => $.get(column)['system'] || $.get(column).type === 'relationship' ? 'disabled' : true);
								var fragment_7 = $.comment();
								var node_6 = $.first_child(fragment_7);

								$.component(node_6, () => Spreadsheet.Row.Base, ($$anchor, Spreadsheet_Row_Base) => {
									Spreadsheet_Row_Base($$anchor, {
										get root() {
											return $.get(root);
										},

										get select() {
											return $.get(isSelectable);
										},

										get id() {
											return $.get(column).key;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_8 = root_7();
											var node_7 = $.first_child(fragment_8);

											$.component(node_7, () => Spreadsheet.Cell, ($$anchor, Spreadsheet_Cell) => {
												Spreadsheet_Cell($$anchor, {
													column: 'key',
													get root() {
														return $.get(root);
													},
													isEditable: false,
													children: ($$anchor, $$slotProps) => {
														var fragment_9 = $.comment();
														var node_8 = $.first_child(fragment_9);

														$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
															Layout_Stack_1($$anchor, {
																direction: 'row',
																alignItems: 'center',
																justifyContent: 'space-between',
																style: 'min-width:0',
																children: ($$anchor, $$slotProps) => {
																	const minMaxSize = $.derived(() => getMinMaxSizeForColumn($.get(column)));
																	const relationType = $.derived(() => getRelationshipTypeForColumn($.get(column)));
																	var fragment_10 = root_5();
																	var node_9 = $.first_child(fragment_10);

																	$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
																		Layout_Stack_2($$anchor, {
																			gap: 's',
																			inline: true,
																			direction: 'row',
																			alignItems: 'center',
																			style: 'min-width:0; flex:1 1 auto;',
																			children: ($$anchor, $$slotProps) => {
																				var fragment_11 = root_2();
																				var node_10 = $.first_child(fragment_11);

																				{
																					var consequent_1 = ($$anchor) => {
																						{
																							let $0 = $.derived(() => $.get(column)?.twoWay ? IconSwitchHorizontal : IconArrowSmRight);

																							Icon($$anchor, {
																								size: 's',
																								get icon() {
																									return $.get($0);
																								}
																							});
																						}
																					};

																					var d = $.derived(() => isRelationship($.get(column)));

																					var consequent_2 = ($$anchor) => {
																						const icon = $.derived(() => columnFormatIcon[$.get(column)?.format]);

																						Icon($$anchor, {
																							get icon() {
																								return $.get(icon);
																							},
																							size: 's'
																						});
																					};

																					var consequent_3 = ($$anchor) => {
																						Icon($$anchor, {
																							get icon() {
																								return IconFingerPrint;
																							},
																							size: 's'
																						});
																					};

																					var alternate = ($$anchor) => {
																						{
																							let $0 = $.derived(() => $.get(option)?.icon ?? IconViewList);

																							Icon($$anchor, {
																								get icon() {
																									return $.get($0);
																								},
																								size: 's'
																							});
																						}
																					};

																					$.if(node_10, ($$render) => {
																						if ($.get(d)) $$render(consequent_1); else if ('format' in $.get(column) && $.get(column).format) $$render(consequent_2, 1); else if ($.get(column).key === '$id') $$render(consequent_3, 2); else $$render(alternate, -1);
																					});
																				}

																				var node_11 = $.sibling(node_10, 2);

																				$.component(node_11, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																					Layout_Stack_3($$anchor, {
																						gap: 's',
																						inline: true,
																						direction: 'row',
																						alignItems: 'center',
																						style: 'min-width:0; flex:1 1 auto; overflow:hidden;',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_16 = root_3();
																							var node_12 = $.first_child(fragment_16);

																							$.component(node_12, () => Typography.Text, ($$anchor, Typography_Text) => {
																								Typography_Text($$anchor, {
																									truncate: true,
																									children: ($$anchor, $$slotProps) => {
																										var fragment_17 = $.comment();
																										var node_13 = $.first_child(fragment_17);

																										{
																											var consequent_4 = ($$anchor) => {
																												var text_1 = $.text();

																												$.template_effect(() => $.set_text(text_1, $.get(column).key));
																												$.append($$anchor, text_1);
																											};

																											var d_1 = $.derived(() => isSystemColumnKey($.get(column)));

																											var alternate_1 = ($$anchor) => {
																												var text_2 = $.text();

																												$.template_effect(() => $.set_text(text_2, `${$.get(column).key ?? ''}${($.get(column).array ? '[]' : undefined) ?? ''}`));
																												$.append($$anchor, text_2);
																											};

																											$.if(node_13, ($$render) => {
																												if ($.get(d_1)) $$render(consequent_4); else $$render(alternate_1, -1);
																											});
																										}

																										$.append($$anchor, fragment_17);
																									},
																									$$slots: { default: true }
																								});
																							});

																							var node_14 = $.sibling(node_12, 2);

																							{
																								var consequent_5 = ($$anchor) => {
																									Tooltip($$anchor, {
																										portal: true,
																										children: ($$anchor, $$slotProps) => {
																											Icon($$anchor, {
																												size: 's',
																												get icon() {
																													return IconLockClosed;
																												},
																												color: '--fgcolor-neutral-tertiary'
																											});
																										},

																										$$slots: {
																											default: true,
																											tooltip: ($$anchor, $$slotProps) => {
																												var div_1 = root_1();

																												$.append($$anchor, div_1);
																											}
																										}
																									});
																								};

																								var d_2 = $.derived(() => isTextType($.get(column)) && 'encrypt' in $.get(column) && $.get(column).encrypt);

																								$.if(node_14, ($$render) => {
																									if ($.get(d_2)) $$render(consequent_5);
																								});
																							}

																							var node_15 = $.sibling(node_14, 2);

																							{
																								var consequent_7 = ($$anchor) => {
																									var fragment_22 = root_2();
																									var node_16 = $.first_child(fragment_22);

																									{
																										let $0 = $.derived(() => getColumnStatusBadge($.get(column).status));

																										Badge(node_16, {
																											size: 's',
																											variant: 'secondary',
																											get content() {
																												return $.get(column).status;
																											},

																											get type() {
																												return $.get($0);
																											}
																										});
																									}

																									var node_17 = $.sibling(node_16, 2);

																									{
																										var consequent_6 = ($$anchor) => {
																											var fragment_23 = $.comment();
																											var node_18 = $.first_child(fragment_23);

																											$.component(node_18, () => Link.Button, ($$anchor, Link_Button) => {
																												Link_Button($$anchor, {
																													variant: 'muted',
																													$$events: {
																														click: (e) => {
																															e.preventDefault();
																															$.set(error, $.get(column).error, true);
																															$.set(showFailed, true);
																														}
																													},

																													children: ($$anchor, $$slotProps) => {
																														$.next();

																														var text_3 = $.text('Details');

																														$.append($$anchor, text_3);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_23);
																										};

																										$.if(node_17, ($$render) => {
																											if ($.get(column).error) $$render(consequent_6);
																										});
																									}

																									$.append($$anchor, fragment_22);
																								};

																								var consequent_8 = ($$anchor) => {
																									Badge($$anchor, { size: 'xs', variant: 'secondary', content: 'required' });
																								};

																								$.if(node_15, ($$render) => {
																									if ($.get(column).status !== 'available') $$render(consequent_7); else if ($.get(column).required) $$render(consequent_8, 1);
																								});
																							}

																							$.append($$anchor, fragment_16);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_11);
																			},
																			$$slots: { default: true }
																		});
																	});

																	var node_19 = $.sibling(node_9, 2);

																	{
																		var consequent_10 = ($$anchor) => {
																			var fragment_25 = $.comment();
																			var node_20 = $.first_child(fragment_25);

																			{
																				var consequent_9 = ($$anchor) => {
																					Tooltip($$anchor, {
																						portal: true,
																						maxWidth: 'fit-content',
																						placement: 'top',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_27 = $.comment();
																							var node_21 = $.first_child(fragment_27);

																							$.component(node_21, () => Typography.Caption, ($$anchor, Typography_Caption) => {
																								Typography_Caption($$anchor, {
																									variant: '400',
																									color: '--fgcolor-neutral-tertiary',
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_4 = $.text();

																										$.template_effect(() => $.set_text(text_4, $.get(minMaxSize).display));
																										$.append($$anchor, text_4);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_27);
																						},

																						$$slots: {
																							default: true,
																							tooltip: ($$anchor, $$slotProps) => {
																								var div_2 = root_4();
																								var text_5 = $.only_child(div_2, true);

																								$.template_effect(() => $.set_text(text_5, $.get(minMaxSize).tooltip));
																								$.append($$anchor, div_2);
																							}
																						}
																					});
																				};

																				var alternate_2 = ($$anchor) => {
																					var fragment_29 = $.comment();
																					var node_22 = $.first_child(fragment_29);

																					$.component(node_22, () => Typography.Caption, ($$anchor, Typography_Caption_1) => {
																						Typography_Caption_1($$anchor, {
																							variant: '400',
																							color: '--fgcolor-neutral-tertiary',
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_6 = $.text();

																								$.template_effect(() => $.set_text(text_6, $.get(minMaxSize).display));
																								$.append($$anchor, text_6);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_29);
																				};

																				$.if(node_20, ($$render) => {
																					if ($.get(minMaxSize).tooltip) $$render(consequent_9); else $$render(alternate_2, -1);
																				});
																			}

																			$.append($$anchor, fragment_25);
																		};

																		var consequent_11 = ($$anchor) => {
																			var fragment_31 = $.comment();
																			var node_23 = $.first_child(fragment_31);

																			$.component(node_23, () => Typography.Caption, ($$anchor, Typography_Caption_2) => {
																				Typography_Caption_2($$anchor, {
																					variant: '400',
																					color: '--fgcolor-neutral-tertiary',
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_7 = $.text();

																						$.template_effect(() => $.set_text(text_7, $.get(relationType)));
																						$.append($$anchor, text_7);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_31);
																		};

																		$.if(node_19, ($$render) => {
																			if ($.get(minMaxSize)) $$render(consequent_10); else if ($.get(relationType)) $$render(consequent_11, 1);
																		});
																	}

																	$.append($$anchor, fragment_10);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_9);
													},
													$$slots: { default: true }
												});
											});

											var node_24 = $.sibling(node_7, 2);

											$.component(node_24, () => Spreadsheet.Cell, ($$anchor, Spreadsheet_Cell_1) => {
												Spreadsheet_Cell_1($$anchor, {
													column: 'type',
													get root() {
														return $.get(root);
													},
													isEditable: false,
													children: ($$anchor, $$slotProps) => {
														const columnType = $.derived(() => $.get(column)['format'] ? $.get(column)['format'] : $.get(column).type);

														$.next();

														var text_8 = $.text();

														$.template_effect(($0) => $.set_text(text_8, $0), [() => $.get(columnType).toLowerCase()]);
														$.append($$anchor, text_8);
													},
													$$slots: { default: true }
												});
											});

											var node_25 = $.sibling(node_24, 2);

											$.component(node_25, () => Spreadsheet.Cell, ($$anchor, Spreadsheet_Cell_2) => {
												Spreadsheet_Cell_2($$anchor, {
													column: 'indexed',
													get root() {
														return $.get(root);
													},
													isEditable: false,
													children: ($$anchor, $$slotProps) => {
														var fragment_34 = $.comment();
														var node_26 = $.first_child(fragment_34);

														{
															var consequent_12 = ($$anchor) => {
																const isActuallyIndexed = $.derived(() => $.get(isId) || $indexes().some((index) => index.columns.includes($.get(column).key)));
																const checked = $.derived(() => $.get(isId) || $.get(isActuallyIndexed) || !!columnIndexMap[$.get(column).key]);
																var fragment_35 = $.comment();
																var node_27 = $.first_child(fragment_35);

																$.component(node_27, () => Selector.Checkbox, ($$anchor, Selector_Checkbox) => {
																	Selector_Checkbox($$anchor, {
																		size: 's',
																		get checked() {
																			return $.get(checked);
																		},

																		get disabled() {
																			return $.get(isActuallyIndexed);
																		},

																		$$events: {
																			change: (e) => {
																				if (!$.get(isActuallyIndexed)) {
																					if (e.detail) {
																						columnIndexMap[$.get(column).key] = true;
																						$.store_mutate(showCreateIndexSheet, $.untrack($showCreateIndexSheet).show = true, $.untrack($showCreateIndexSheet));
																						$.store_mutate(showCreateIndexSheet, $.untrack($showCreateIndexSheet).column = $.get(column).key, $.untrack($showCreateIndexSheet));
																					}
																				}
																			}
																		}
																	});
																});

																$.append($$anchor, fragment_35);
															};

															var d_3 = $.derived(() => !isRelationship($.get(column)));

															$.if(node_26, ($$render) => {
																if ($.get(d_3)) $$render(consequent_12);
															});
														}

														$.append($$anchor, fragment_34);
													},
													$$slots: { default: true }
												});
											});

											var node_28 = $.sibling(node_25, 2);

											$.component(node_28, () => Spreadsheet.Cell, ($$anchor, Spreadsheet_Cell_3) => {
												Spreadsheet_Cell_3($$anchor, {
													column: 'default',
													get root() {
														return $.get(root);
													},
													isEditable: false,
													children: ($$anchor, $$slotProps) => {
														const _default = $.derived(() => $.get(column).required
															? '-'
															: $.get(column)?.default !== null && $.get(column)?.default !== undefined ? $.get(column)?.default : null);

														var fragment_36 = $.comment();
														var node_29 = $.first_child(fragment_36);

														{
															var consequent_13 = ($$anchor) => {
																Badge($$anchor, { variant: 'secondary', content: 'NULL', size: 'xs' });
															};

															var consequent_14 = ($$anchor) => {
																var text_9 = $.text();

																$.template_effect(($0) => $.set_text(text_9, $0), [() => JSON.stringify($.get(_default))]);
																$.append($$anchor, text_9);
															};

															var d_4 = $.derived(() => isSpatialType($.get(column)));

															var alternate_3 = ($$anchor) => {
																var text_10 = $.text();

																$.template_effect(() => $.set_text(text_10, $.get(_default)));
																$.append($$anchor, text_10);
															};

															$.if(node_29, ($$render) => {
																if ($.get(_default) === null) $$render(consequent_13); else if ($.get(d_4)) $$render(consequent_14, 1); else $$render(alternate_3, -1);
															});
														}

														$.append($$anchor, fragment_36);
													},
													$$slots: { default: true }
												});
											});

											var node_30 = $.sibling(node_28, 2);

											$.component(node_30, () => Spreadsheet.Cell, ($$anchor, Spreadsheet_Cell_4) => {
												Spreadsheet_Cell_4($$anchor, {
													get column() {
														return INTERNAL_ACTIONS_COLUMN_ID;
													},

													get root() {
														return $.get(root);
													},
													isEditable: false,
													children: ($$anchor, $$slotProps) => {
														var fragment_40 = $.comment();
														var node_31 = $.first_child(fragment_40);

														{
															var consequent_15 = ($$anchor) => {
																CsvDisabled($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		Button($$anchor, {
																			disabled: true,
																			text: true,
																			icon: true,
																			ariaLabel: 'more options',
																			children: ($$anchor, $$slotProps) => {
																				Icon($$anchor, {
																					get icon() {
																						return IconDotsHorizontal;
																					},
																					size: 's'
																				});
																			},
																			$$slots: { default: true }
																		});
																	},
																	$$slots: { default: true }
																});
															};

															var consequent_19 = ($$anchor) => {
																Popover($$anchor, {
																	padding: 'none',
																	placement: 'bottom-end',
																	portal: true,
																	children: $.invalid_default_snippet,
																	$$slots: {
																		default: ($$anchor, $$slotProps) => {
																			const toggle = $.derived(() => $$slotProps.toggle);

																			Button($$anchor, {
																				text: true,
																				icon: true,
																				ariaLabel: 'more options',
																				$$events: {
																					click: function (...$$args) {
																						$.get(toggle)?.apply(this, $$args);
																					}
																				},

																				children: ($$anchor, $$slotProps) => {
																					Icon($$anchor, {
																						get icon() {
																							return IconDotsHorizontal;
																						},
																						size: 's'
																					});
																				},
																				$$slots: { default: true }
																			});
																		},

																		tooltip: ($$anchor, $$slotProps) => {
																			var fragment_47 = $.comment();
																			var node_32 = $.first_child(fragment_47);
																			const toggle = $.derived(() => $$slotProps.toggle);

																			$.component(node_32, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
																				ActionMenu_Root($$anchor, {
																					slot: 'tooltip',
																					children: $.invalid_default_snippet,
																					$$slots: {
																						default: ($$anchor, $$slotProps) => {
																							var fragment_48 = root_3();
																							var node_33 = $.first_child(fragment_48);

																							{
																								var consequent_16 = ($$anchor) => {
																									var fragment_49 = $.comment();
																									var node_34 = $.first_child(fragment_49);

																									$.component(node_34, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
																										ActionMenu_Item_Button($$anchor, {
																											get leadingIcon() {
																												return IconPencil;
																											},

																											$$events: {
																												click: (event) => {
																													$.get(toggle)(event);
																													$.set(showEdit, true);
																													$.set(selectedColumn, $.get(column), true);
																													showDropdown[$.get(index)] = false;
																												}
																											},

																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_11 = $.text('Update');

																												$.append($$anchor, text_11);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_49);
																								};

																								$.if(node_33, ($$render) => {
																									if (!$.get(column)['system']) $$render(consequent_16);
																								});
																							}

																							var node_35 = $.sibling(node_33, 2);

																							{
																								var consequent_17 = ($$anchor) => {
																									var fragment_50 = $.comment();
																									var node_36 = $.first_child(fragment_50);

																									$.component(node_36, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_1) => {
																										ActionMenu_Item_Button_1($$anchor, {
																											get leadingIcon() {
																												return IconPlus;
																											},

																											$$events: {
																												click: (event) => {
																													$.get(toggle)(event);
																													showDropdown[$.get(index)] = false;
																													$.store_mutate(showCreateIndexSheet, $.untrack($showCreateIndexSheet).show = true, $.untrack($showCreateIndexSheet));
																													$.store_mutate(showCreateIndexSheet, $.untrack($showCreateIndexSheet).column = $.get(column).key, $.untrack($showCreateIndexSheet));
																												}
																											},

																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_12 = $.text('Create index');

																												$.append($$anchor, text_12);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_50);
																								};

																								var d_5 = $.derived(() => !isRelationship($.get(column)));

																								$.if(node_35, ($$render) => {
																									if ($.get(d_5)) $$render(consequent_17);
																								});
																							}

																							var node_37 = $.sibling(node_35, 2);

																							{
																								var consequent_18 = ($$anchor) => {
																									var fragment_51 = root_6();
																									var div_3 = $.first_child(fragment_51);

																									$.set_style(div_3, '', {}, { 'padding-block': '0.25rem' });

																									var node_38 = $.child(div_3);

																									Divider(node_38, {});
																									$.reset(div_3);

																									var node_39 = $.sibling(div_3, 2);

																									$.component(node_39, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_2) => {
																										ActionMenu_Item_Button_2($$anchor, {
																											status: 'danger',
																											get leadingIcon() {
																												return IconTrash;
																											},

																											$$events: {
																												click: (event) => {
																													$.get(toggle)(event);
																													$.set(showDelete, true);
																													showDropdown[$.get(index)] = false;
																													$.set(selectedColumn, $.get(column), true);
																													trackEvent(Click.DatabaseColumnDelete);
																												}
																											},

																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_13 = $.text('Delete');

																												$.append($$anchor, text_13);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_51);
																								};

																								$.if(node_37, ($$render) => {
																									if ($.get(column).status !== 'processing' && !$.get(column)['system']) $$render(consequent_18);
																								});
																							}

																							$.append($$anchor, fragment_48);
																						}
																					}
																				});
																			});

																			$.append($$anchor, fragment_47);
																		}
																	}
																});
															};

															$.if(node_31, ($$render) => {
																if ($isTablesCsvImportInProgress()) $$render(consequent_15); else if (!$.get(isId)) $$render(consequent_19, 1);
															});
														}

														$.append($$anchor, fragment_40);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_7);
							});

							$.append($$anchor, fragment_6);
						},

						header: ($$anchor, $$slotProps) => {
							const root = $.derived(() => $$slotProps.root);
							var fragment_52 = root_7();
							var node_40 = $.first_child(fragment_52);

							$.component(node_40, () => Spreadsheet.Header.Cell, ($$anchor, Spreadsheet_Header_Cell) => {
								Spreadsheet_Header_Cell($$anchor, {
									column: 'key',
									get root() {
										return $.get(root);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_14 = $.text('Column name');

										$.append($$anchor, text_14);
									},
									$$slots: { default: true }
								});
							});

							var node_41 = $.sibling(node_40, 2);

							$.component(node_41, () => Spreadsheet.Header.Cell, ($$anchor, Spreadsheet_Header_Cell_1) => {
								Spreadsheet_Header_Cell_1($$anchor, {
									column: 'type',
									get root() {
										return $.get(root);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_15 = $.text('Type');

										$.append($$anchor, text_15);
									},
									$$slots: { default: true }
								});
							});

							var node_42 = $.sibling(node_41, 2);

							$.component(node_42, () => Spreadsheet.Header.Cell, ($$anchor, Spreadsheet_Header_Cell_2) => {
								Spreadsheet_Header_Cell_2($$anchor, {
									column: 'indexed',
									get root() {
										return $.get(root);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_16 = $.text('Indexed');

										$.append($$anchor, text_16);
									},
									$$slots: { default: true }
								});
							});

							var node_43 = $.sibling(node_42, 2);

							$.component(node_43, () => Spreadsheet.Header.Cell, ($$anchor, Spreadsheet_Header_Cell_3) => {
								Spreadsheet_Header_Cell_3($$anchor, {
									column: 'default',
									get root() {
										return $.get(root);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_17 = $.text('Default value');

										$.append($$anchor, text_17);
									},
									$$slots: { default: true }
								});
							});

							var node_44 = $.sibling(node_43, 2);

							$.component(node_44, () => Spreadsheet.Header.Cell, ($$anchor, Spreadsheet_Header_Cell_4) => {
								Spreadsheet_Header_Cell_4($$anchor, {
									get column() {
										return INTERNAL_ACTIONS_COLUMN_ID;
									},

									get root() {
										return $.get(root);
									}
								});
							});

							$.append($$anchor, fragment_52);
						},

						footer: ($$anchor, $$slotProps) => {
							var fragment_53 = $.comment();
							var node_45 = $.first_child(fragment_53);

							$.component(node_45, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
								Layout_Stack_4($$anchor, {
									direction: 'row',
									alignContent: 'center',
									alignItems: 'center',
									justifyContent: 'space-between',
									children: ($$anchor, $$slotProps) => {
										var fragment_54 = $.comment();
										var node_46 = $.first_child(fragment_54);

										$.component(node_46, () => Typography.Text, ($$anchor, Typography_Text_1) => {
											Typography_Text_1($$anchor, {
												variant: 'm-400',
												color: '--fgcolor-neutral-secondary',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_18 = $.text();

													$.template_effect(() => $.set_text(text_18, `${$.get(updatedColumnsForSheet).length ?? ''} columns`));
													$.append($$anchor, text_18);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_54);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_53);
						}
					}
				});
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_47 = $.sibling(node_3, 2);

	{
		var consequent_20 = ($$anchor) => {
			var div_4 = root_10();
			var node_48 = $.child(div_4);

			FloatingActionBar(node_48, {
				$$slots: {
					start: ($$anchor, $$slotProps) => {
						var div_5 = root_9();

						$.set_style(div_5, '', {}, { width: 'max-content' });

						var node_49 = $.child(div_5);

						$.component(node_49, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
							Layout_Stack_5($$anchor, {
								direction: 'row',
								alignItems: 'center',
								gap: 'm',
								children: ($$anchor, $$slotProps) => {
									var fragment_56 = root_8();
									var node_50 = $.first_child(fragment_56);

									{
										let $0 = $.derived(() => $.get(selectedColumns).length.toString());

										Badge(node_50, {
											get content() {
												return $.get($0);
											}
										});
									}

									var span = $.sibling(node_50, 2);

									$.set_style(span, '', {}, { 'font-size': '14px' });

									var text_19 = $.only_child(span);

									$.template_effect(() => $.set_text(text_19, `${$.get(selectedColumns).length > 1 ? 'columns' : 'column'}
                                selected`));

									$.append($$anchor, fragment_56);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_5);
						$.append($$anchor, div_5);
					},

					end: ($$anchor, $$slotProps) => {
						var fragment_57 = root_2();
						var node_51 = $.first_child(fragment_57);

						Button(node_51, {
							text: true,
							$$events: { click: () => $.set(selectedColumns, [], true) },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_20 = $.text('Cancel');

								$.append($$anchor, text_20);
							},
							$$slots: { default: true }
						});

						var node_52 = $.sibling(node_51, 2);

						Button(node_52, {
							secondary: true,
							$$events: { click: () => $.set(showDelete, true) },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_21 = $.text('Delete');

								$.append($$anchor, text_21);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_57);
					}
				}
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_47, ($$render) => {
			if ($.get(selectedColumns).length > 0) $$render(consequent_20);
		});
	}

	$.reset(div);

	var node_53 = $.sibling(div, 2);

	{
		var consequent_21 = ($$anchor) => {
			DeleteColumn($$anchor, {
				get table() {
					return $$props.data.table;
				},

				get showDelete() {
					return $.get(showDelete);
				},

				set showDelete($$value) {
					$.set(showDelete, $$value, true);
				},

				get selectedColumn() {
					return $.get(selectedColumn);
				},

				set selectedColumn($$value) {
					$.set(selectedColumn, $$value, true);
				}
			});
		};

		var consequent_22 = ($$anchor) => {
			DeleteColumn($$anchor, {
				get table() {
					return $$props.data.table;
				},

				get showDelete() {
					return $.get(showDelete);
				},

				set showDelete($$value) {
					$.set(showDelete, $$value, true);
				},

				get selectedColumn() {
					return $.get(selectedColumns);
				},

				set selectedColumn($$value) {
					$.set(selectedColumns, $$value, true);
				}
			});
		};

		$.if(node_53, ($$render) => {
			if ($.get(selectedColumn)) $$render(consequent_21); else if ($.get(selectedColumns) && $.get(selectedColumns).length) $$render(consequent_22, 1);
		});
	}

	var node_54 = $.sibling(node_53, 2);

	SideSheet(node_54, {
		title: 'Edit column',
		submit: {
			text: 'Update',
			onClick: async () => await editColumn.submit()
		},

		get show() {
			return $.get(showEdit);
		},

		set show($$value) {
			$.set(showEdit, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				EditColumn($$anchor, {
					showEdit: true,
					isModal: false,
					get selectedColumn() {
						return $.get(selectedColumn);
					}
				}),
				($$value) => editColumn = $$value,
				() => editColumn
			);
		},
		$$slots: { default: true }
	});

	var node_55 = $.sibling(node_54, 2);

	FailedModal(node_55, {
		title: 'Create column',
		header: 'Creation failed',
		get error() {
			return $.get(error);
		},

		get show() {
			return $.get(showFailed);
		},

		set show($$value) {
			$.set(showFailed, $$value, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;

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
				...$.store_get($$store_subs ??= {}, '$columns', columns),
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

			return reorderItems(baseAttrs, columnsOrder);
		});

		let error = '';
		let showDropdown = [];
		let showFailed = false;
		let showDelete = false;
		let selectedColumns = [];
		let selectedColumn = null;
		let columnIndexMap = {};
		let columnsOrder = [];
		let columnsWidth = null;
		const tableId = page.params.table;
		const organizationId = data.organization.$id ?? data.project.teamId;
		let showEdit = false;
		let editColumn;

		const columnFormatIcon = {
			ip: IconLocationMarker,
			url: IconLink,
			email: IconMail,
			enum: IconViewList
		};

		const emptyCellsLimit = $.derived(() => $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 14 : 17);

		const emptyCellsCount = $.derived(() => updatedColumnsForSheet().length >= emptyCellsLimit()
			? 0
			: emptyCellsLimit() - updatedColumnsForSheet().length);

		onMount(() => {
			columnsOrder = preferences.getColumnOrder(tableId);
			columnsWidth = preferences.getColumnWidths(tableId + '#columns');

			return realtime.forProject(page.params.region, ['project', 'console'], async (response) => {
				if (response.events.includes('databases.*.tables.*.columns.*.delete') || response.events.includes('databases.*.tables.*.columns.*.update') && !$.store_get($$store_subs ??= {}, '$isWaterfallFromFaker', isWaterfallFromFaker)) {
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
			const savedWidth = columnsWidth?.[columnId];

			if (!savedWidth) return defaultWidth;

			return savedWidth.resized;
		}

		function saveColumnsWidth({ columnId, newWidth }) {
			const existing = columnsWidth?.[columnId];

			const fixed = existing
				? typeof existing?.fixed === 'number' ? existing.fixed : existing?.fixed?.min
				: newWidth;

			columnsWidth = {
				...columnsWidth ?? {},
				[columnId]: { fixed, resized: Math.ceil(newWidth) }
			};

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

		onDestroy(() => $.store_mutate($$store_subs ??= {}, '$showCreateColumnSheet', showCreateColumnSheet, $.store_get($$store_subs ??= {}, '$showCreateColumnSheet', showCreateColumnSheet).show = false));

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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Container($$renderer, {
				expanded: true,
				expandHeightButton: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport),
				style: 'background: var(--bgcolor-neutral-primary)',
				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							justifyContent: 'flex-end',
							children: ($$renderer) => {
								if (updatedColumnsForSheet()) {
									$$renderer.push('<!--[0-->');

									Button($$renderer, {
										size: 's',
										secondary: true,
										disabled: $.store_get($$store_subs ??= {}, '$isTablesCsvImportInProgress', isTablesCsvImportInProgress),
										event: 'create_attribute',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Create column`);
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

			$$renderer.push(`<!----> <div class="databases-spreadsheet">`);

			SpreadsheetContainer($$renderer, {
				children: ($$renderer) => {
					if (Spreadsheet.Root) {
						$$renderer.push('<!--[-->');

						Spreadsheet.Root($$renderer, {
							height: '100%',
							allowSelection: true,
							emptyCells: emptyCellsCount(),
							columns: spreadsheetColumns(),
							bottomActionClick: () => $.store_mutate($$store_subs ??= {}, '$showCreateColumnSheet', showCreateColumnSheet, $.store_get($$store_subs ??= {}, '$showCreateColumnSheet', showCreateColumnSheet).show = true),
							get selectedRows() {
								return selectedColumns;
							},

							set selectedRows($$value) {
								selectedColumns = $$value;
								$$settled = false;
							},
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$renderer, { root }) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(updatedColumnsForSheet());

									for (let index = 0, $$length = each_array.length; index < $$length; index++) {
										let column = each_array[index];
										const isId = column.key === '$id';
										const option = columnOptions.find((option) => option.type === column.type && option.format === ('format' in column && column.format ? column.format : undefined));
										const isSelectable = column['system'] || column.type === 'relationship' ? 'disabled' : true;

										if (Spreadsheet.Row.Base) {
											$$renderer.push('<!--[-->');

											Spreadsheet.Row.Base($$renderer, {
												root,
												select: isSelectable,
												id: column.key,
												children: ($$renderer) => {
													if (Spreadsheet.Cell) {
														$$renderer.push('<!--[-->');

														Spreadsheet.Cell($$renderer, {
															column: 'key',
															root,
															isEditable: false,
															children: ($$renderer) => {
																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		direction: 'row',
																		alignItems: 'center',
																		justifyContent: 'space-between',
																		style: 'min-width:0',
																		children: ($$renderer) => {
																			const minMaxSize = getMinMaxSizeForColumn(column);
																			const relationType = getRelationshipTypeForColumn(column);

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					gap: 's',
																					inline: true,
																					direction: 'row',
																					alignItems: 'center',
																					style: 'min-width:0; flex:1 1 auto;',
																					children: ($$renderer) => {
																						if (isRelationship(column)) {
																							$$renderer.push('<!--[0-->');

																							Icon($$renderer, {
																								size: 's',
																								icon: column?.twoWay ? IconSwitchHorizontal : IconArrowSmRight
																							});
																						} else if ('format' in column && column.format) {
																							$$renderer.push('<!--[1-->');

																							const icon = columnFormatIcon[column?.format];

																							Icon($$renderer, { icon, size: 's' });
																						} else if (column.key === '$id') {
																							$$renderer.push('<!--[2-->');
																							Icon($$renderer, { icon: IconFingerPrint, size: 's' });
																						} else {
																							$$renderer.push('<!--[-1-->');
																							Icon($$renderer, { icon: option?.icon ?? IconViewList, size: 's' });
																						}

																						$$renderer.push(`<!--]--> `);

																						if (Layout.Stack) {
																							$$renderer.push('<!--[-->');

																							Layout.Stack($$renderer, {
																								gap: 's',
																								inline: true,
																								direction: 'row',
																								alignItems: 'center',
																								style: 'min-width:0; flex:1 1 auto; overflow:hidden;',
																								children: ($$renderer) => {
																									if (Typography.Text) {
																										$$renderer.push('<!--[-->');

																										Typography.Text($$renderer, {
																											truncate: true,
																											children: ($$renderer) => {
																												if (isSystemColumnKey(column)) {
																													$$renderer.push(`<!--[0-->${$.escape(column.key)}`);
																												} else {
																													$$renderer.push(`<!--[-1-->${$.escape(column.key)}${$.escape(column.array ? '[]' : undefined)}`);
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

																									$$renderer.push(` `);

																									if (isTextType(column) && 'encrypt' in column && column.encrypt) {
																										$$renderer.push('<!--[0-->');

																										Tooltip($$renderer, {
																											portal: true,
																											children: ($$renderer) => {
																												Icon($$renderer, {
																													size: 's',
																													icon: IconLockClosed,
																													color: '--fgcolor-neutral-tertiary'
																												});
																											},

																											$$slots: {
																												default: true,
																												tooltip: ($$renderer) => {
																													$$renderer.push(`<div slot="tooltip">Encrypted</div>`);
																												}
																											}
																										});
																									} else {
																										$$renderer.push('<!--[-1-->');
																									}

																									$$renderer.push(`<!--]--> `);

																									if (column.status !== 'available') {
																										$$renderer.push('<!--[0-->');

																										Badge($$renderer, {
																											size: 's',
																											variant: 'secondary',
																											content: column.status,
																											type: getColumnStatusBadge(column.status)
																										});

																										$$renderer.push(`<!----> `);

																										if (column.error) {
																											$$renderer.push('<!--[0-->');

																											if (Link.Button) {
																												$$renderer.push('<!--[-->');

																												Link.Button($$renderer, {
																													variant: 'muted',
																													children: ($$renderer) => {
																														$$renderer.push(`<!---->Details`);
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
																									} else if (column.required) {
																										$$renderer.push('<!--[1-->');
																										Badge($$renderer, { size: 'xs', variant: 'secondary', content: 'required' });
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

																			$$renderer.push(`  `);

																			if (minMaxSize) {
																				$$renderer.push('<!--[0-->');

																				if (minMaxSize.tooltip) {
																					$$renderer.push('<!--[0-->');

																					Tooltip($$renderer, {
																						portal: true,
																						maxWidth: 'fit-content',
																						placement: 'top',
																						children: ($$renderer) => {
																							if (Typography.Caption) {
																								$$renderer.push('<!--[-->');

																								Typography.Caption($$renderer, {
																									variant: '400',
																									color: '--fgcolor-neutral-tertiary',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->${$.escape(minMaxSize.display)}`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}
																						},

																						$$slots: {
																							default: true,
																							tooltip: ($$renderer) => {
																								$$renderer.push(`<div slot="tooltip" style="white-space: pre-line;">${$.escape(minMaxSize.tooltip)}</div>`);
																							}
																						}
																					});
																				} else {
																					$$renderer.push('<!--[-1-->');

																					if (Typography.Caption) {
																						$$renderer.push('<!--[-->');

																						Typography.Caption($$renderer, {
																							variant: '400',
																							color: '--fgcolor-neutral-tertiary',
																							children: ($$renderer) => {
																								$$renderer.push(`<!---->${$.escape(minMaxSize.display)}`);
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
																			} else if (relationType) {
																				$$renderer.push('<!--[1-->');

																				if (Typography.Caption) {
																					$$renderer.push('<!--[-->');

																					Typography.Caption($$renderer, {
																						variant: '400',
																						color: '--fgcolor-neutral-tertiary',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(relationType)}`);
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

													if (Spreadsheet.Cell) {
														$$renderer.push('<!--[-->');

														Spreadsheet.Cell($$renderer, {
															column: 'type',
															root,
															isEditable: false,
															children: ($$renderer) => {
																const columnType = column['format'] ? column['format'] : column.type;

																$$renderer.push(`<!---->${$.escape(columnType.toLowerCase())}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Spreadsheet.Cell) {
														$$renderer.push('<!--[-->');

														Spreadsheet.Cell($$renderer, {
															column: 'indexed',
															root,
															isEditable: false,
															children: ($$renderer) => {
																if (!isRelationship(column)) {
																	$$renderer.push('<!--[0-->');

																	const isActuallyIndexed = isId || $.store_get($$store_subs ??= {}, '$indexes', indexes).some((index) => index.columns.includes(column.key));
																	const checked = isId || isActuallyIndexed || !!columnIndexMap[column.key];

																	if (Selector.Checkbox) {
																		$$renderer.push('<!--[-->');
																		Selector.Checkbox($$renderer, { size: 's', checked, disabled: isActuallyIndexed });
																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}
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

													$$renderer.push(` `);

													if (Spreadsheet.Cell) {
														$$renderer.push('<!--[-->');

														Spreadsheet.Cell($$renderer, {
															column: 'default',
															root,
															isEditable: false,
															children: ($$renderer) => {
																const _default = column.required
																	? '-'
																	: column?.default !== null && column?.default !== undefined ? column?.default : null;

																if (_default === null) {
																	$$renderer.push('<!--[0-->');
																	Badge($$renderer, { variant: 'secondary', content: 'NULL', size: 'xs' });
																} else if (isSpatialType(column)) {
																	$$renderer.push(`<!--[1-->${$.escape(JSON.stringify(_default))}`);
																} else {
																	$$renderer.push(`<!--[-1-->${$.escape(_default)}`);
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

													$$renderer.push(` `);

													if (Spreadsheet.Cell) {
														$$renderer.push('<!--[-->');

														Spreadsheet.Cell($$renderer, {
															column: INTERNAL_ACTIONS_COLUMN_ID,
															root,
															isEditable: false,
															children: ($$renderer) => {
																if ($.store_get($$store_subs ??= {}, '$isTablesCsvImportInProgress', isTablesCsvImportInProgress)) {
																	$$renderer.push('<!--[0-->');

																	CsvDisabled($$renderer, {
																		children: ($$renderer) => {
																			Button($$renderer, {
																				disabled: true,
																				text: true,
																				icon: true,
																				ariaLabel: 'more options',
																				children: ($$renderer) => {
																					Icon($$renderer, { icon: IconDotsHorizontal, size: 's' });
																				},
																				$$slots: { default: true }
																			});
																		},
																		$$slots: { default: true }
																	});
																} else if (!isId) {
																	$$renderer.push('<!--[1-->');

																	Popover($$renderer, {
																		padding: 'none',
																		placement: 'bottom-end',
																		portal: true,
																		children: $.invalid_default_snippet,
																		$$slots: {
																			default: ($$renderer, { toggle }) => {
																				Button($$renderer, {
																					text: true,
																					icon: true,
																					ariaLabel: 'more options',
																					children: ($$renderer) => {
																						Icon($$renderer, { icon: IconDotsHorizontal, size: 's' });
																					},
																					$$slots: { default: true }
																				});
																			},

																			tooltip: ($$renderer, { toggle }) => {
																				if (ActionMenu.Root) {
																					$$renderer.push('<!--[-->');

																					ActionMenu.Root($$renderer, {
																						slot: 'tooltip',
																						children: ($$renderer) => {
																							if (!column['system']) {
																								$$renderer.push('<!--[0-->');

																								if (ActionMenu.Item.Button) {
																									$$renderer.push('<!--[-->');

																									ActionMenu.Item.Button($$renderer, {
																										leadingIcon: IconPencil,
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Update`);
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

																							$$renderer.push(`<!--]--> `);

																							if (!isRelationship(column)) {
																								$$renderer.push('<!--[0-->');

																								if (ActionMenu.Item.Button) {
																									$$renderer.push('<!--[-->');

																									ActionMenu.Item.Button($$renderer, {
																										leadingIcon: IconPlus,
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Create index`);
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

																							$$renderer.push(`<!--]--> `);

																							if (column.status !== 'processing' && !column['system']) {
																								$$renderer.push(`<!--[0--><div${$.attr_style('', { 'padding-block': '0.25rem' })}>`);
																								Divider($$renderer, {});
																								$$renderer.push(`<!----></div> `);

																								if (ActionMenu.Item.Button) {
																									$$renderer.push('<!--[-->');

																									ActionMenu.Item.Button($$renderer, {
																										status: 'danger',
																										leadingIcon: IconTrash,
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Delete`);
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
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}
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
									}

									$$renderer.push(`<!--]-->`);
								},

								header: ($$renderer, { root }) => {
									{
										if (Spreadsheet.Header.Cell) {
											$$renderer.push('<!--[-->');

											Spreadsheet.Header.Cell($$renderer, {
												column: 'key',
												root,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Column name`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Spreadsheet.Header.Cell) {
											$$renderer.push('<!--[-->');

											Spreadsheet.Header.Cell($$renderer, {
												column: 'type',
												root,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Type`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Spreadsheet.Header.Cell) {
											$$renderer.push('<!--[-->');

											Spreadsheet.Header.Cell($$renderer, {
												column: 'indexed',
												root,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Indexed`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Spreadsheet.Header.Cell) {
											$$renderer.push('<!--[-->');

											Spreadsheet.Header.Cell($$renderer, {
												column: 'default',
												root,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Default value`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Spreadsheet.Header.Cell) {
											$$renderer.push('<!--[-->');
											Spreadsheet.Header.Cell($$renderer, { column: INTERNAL_ACTIONS_COLUMN_ID, root });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}
								},

								footer: ($$renderer) => {
									{
										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												direction: 'row',
												alignContent: 'center',
												alignItems: 'center',
												justifyContent: 'space-between',
												children: ($$renderer) => {
													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															variant: 'm-400',
															color: '--fgcolor-neutral-secondary',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(updatedColumnsForSheet().length)} columns`);
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
									}
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (selectedColumns.length > 0) {
				$$renderer.push(`<!--[0--><div class="floating-action-bar svelte-udu459">`);

				FloatingActionBar($$renderer, {
					$$slots: {
						start: ($$renderer) => {
							{
								$$renderer.push(`<div${$.attr_style('', { width: 'max-content' })}>`);

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										direction: 'row',
										alignItems: 'center',
										gap: 'm',
										children: ($$renderer) => {
											Badge($$renderer, { content: selectedColumns.length.toString() });

											$$renderer.push(`<!----> <span${$.attr_style('', { 'font-size': '14px' })}>${$.escape(selectedColumns.length > 1 ? 'columns' : 'column')}
                                selected</span>`);
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
						},

						end: ($$renderer) => {
							{
								Button($$renderer, {
									text: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Cancel`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Button($$renderer, {
									secondary: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Delete`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							}
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (selectedColumn) {
				$$renderer.push('<!--[0-->');

				DeleteColumn($$renderer, {
					table: data.table,
					get showDelete() {
						return showDelete;
					},

					set showDelete($$value) {
						showDelete = $$value;
						$$settled = false;
					},

					get selectedColumn() {
						return selectedColumn;
					},

					set selectedColumn($$value) {
						selectedColumn = $$value;
						$$settled = false;
					}
				});
			} else if (selectedColumns && selectedColumns.length) {
				$$renderer.push('<!--[1-->');

				DeleteColumn($$renderer, {
					table: data.table,
					get showDelete() {
						return showDelete;
					},

					set showDelete($$value) {
						showDelete = $$value;
						$$settled = false;
					},

					get selectedColumn() {
						return selectedColumns;
					},

					set selectedColumn($$value) {
						selectedColumns = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			SideSheet($$renderer, {
				title: 'Edit column',
				submit: {
					text: 'Update',
					onClick: async () => await editColumn.submit()
				},

				get show() {
					return showEdit;
				},

				set show($$value) {
					showEdit = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					EditColumn($$renderer, { showEdit: true, isModal: false, selectedColumn });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			FailedModal($$renderer, {
				title: 'Create column',
				header: 'Creation failed',
				error,
				get show() {
					return showFailed;
				},

				set show($$value) {
					showFailed = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
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
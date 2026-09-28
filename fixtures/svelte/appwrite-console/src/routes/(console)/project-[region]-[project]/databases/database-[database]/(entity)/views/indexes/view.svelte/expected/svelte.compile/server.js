import * as $ from 'svelte/internal/server';
import { Container } from '$lib/layout';
import Delete from './delete.svelte';
import { Button } from '$lib/elements/forms';
import Overview from './overview.svelte';
import CreateIndex from './create.svelte';
import FailedModal from '../failedModal.svelte';
import { canWriteTables } from '$lib/stores/roles';

import {
	ActionMenu,
	Badge,
	Divider,
	FloatingActionBar,
	Icon,
	Layout,
	Link,
	Popover,
	Spreadsheet,
	Typography
} from '@appwrite.io/pink-svelte';

import { IconDotsHorizontal, IconEye, IconPlus, IconTrash } from '@appwrite.io/pink-icons-svelte';
import { onMount } from 'svelte';
import { Click, trackEvent } from '$lib/actions/analytics';
import { isSmallViewport } from '$lib/stores/viewport';
import { SpreadsheetContainer, SideSheet, getTerminologies } from '$database/(entity)';
import { preferences } from '$lib/stores/preferences';
import { debounce } from '$lib/helpers/debounce';
import { page } from '$app/state';
import { realtime } from '$lib/stores/sdk';
import { invalidate } from '$app/navigation';

export default function View($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			entity,
			onCreateIndex,
			onDeleteIndexes,
			emptyIndexesSheetView,
			emptyEntitiesSheetView,
			createIndexForm,
			createIndexRef = void 0
		} = $$props;

		let showCreateIndex = false;
		let selectedIndex = null;
		let createIndex;
		let selectedIndexes = [];
		let error = '';
		let showFailed = false;
		let showDelete = false;
		let showOverview = false;
		let columnsWidth = null;
		const organizationId = $.derived(() => page.data.organization?.$id ?? page.data.project?.teamId);

		const spreadsheetColumns = $.derived(() => [
			{
				id: 'key',
				width: getColumnWidth('key', $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 250 : 280),
				minimumWidth: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 250 : 280,
				resizable: true
			},

			{
				id: 'type',
				width: getColumnWidth('type', 120),
				minimumWidth: 120,
				resizable: true
			},

			{
				id: 'columns',
				width: getColumnWidth('columns', 200),
				minimumWidth: 200,
				resizable: true
			},

			// { id: 'orders' }, // design doesn't have orders atm
			{
				id: 'lengths',
				width: getColumnWidth('lengths', 180),
				minimumWidth: 180,
				resizable: true
			},
			{ id: 'actions', width: 40, isAction: true, resizable: false }
		]);

		const emptyCellsLimit = $.derived(() => $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 14 : 17);
		const emptyCellsCount = $.derived(() => entity.indexes.length >= emptyCellsLimit() ? 0 : emptyCellsLimit() - entity.indexes.length);
		const { dependencies, terminology } = getTerminologies();

		onMount(() => {
			columnsWidth = preferences.getColumnWidths(entity.$id + '#indexes');

			// example: databases.*.tables.*.indexes.*
			// example: documentsdb.*.collections.indexes.*
			// this is needed because `documentsdb` doesn't use `database` prefix don't exist
			const derivedEventsForIndex = `${terminology.type}.*.${terminology.entity.lower.plural}.*.indexes.*`;

			const indexEvents = terminology.type === 'documentsdb'
				? [derivedEventsForIndex]
				: ['databases.*.tables.*.indexes.*', derivedEventsForIndex];

			return realtime.forProject(page.params.region, ['project', 'console'], (response) => {
				if (indexEvents.some((event) => response.events.includes(event))) {
					invalidate(dependencies.entity.singular);
				}
			});
		});

		function getEntityStatusBadge(status) {
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
				if (!organizationId()) return;

				preferences.saveColumnWidths(organizationId(), entity.$id + '#indexes', {
					[column.columnId]: {
						fixed: column.fixedWidth,
						resized: Math.ceil(column.newWidth)
					}
				});
			},
			1000
		);

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
								if ($.store_get($$store_subs ??= {}, '$canWriteTables', canWriteTables)) {
									$$renderer.push('<!--[0-->');

									Button($$renderer, {
										secondary: true,
										event: 'create_index',
										disabled: !createIndexForm && !entity.fields?.length,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Create index`);
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

			if (!terminology.schema || entity.fields?.length) {
				$$renderer.push('<!--[0-->');

				if (entity.indexes.length) {
					$$renderer.push('<!--[0-->');

					SpreadsheetContainer($$renderer, {
						children: ($$renderer) => {
							if (Spreadsheet.Root) {
								$$renderer.push('<!--[-->');

								Spreadsheet.Root($$renderer, {
									height: '100%',
									allowSelection: true,
									columns: spreadsheetColumns(),
									emptyCells: emptyCellsCount(),
									bottomActionClick: () => showCreateIndex = true,
									get selectedRows() {
										return selectedIndexes;
									},

									set selectedRows($$value) {
										selectedIndexes = $$value;
										$$settled = false;
									},
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$renderer, { root }) => {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(entity.indexes);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let index = each_array[$$index];

												if (Spreadsheet.Row.Base) {
													$$renderer.push('<!--[-->');

													Spreadsheet.Row.Base($$renderer, {
														root,
														id: index.key,
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
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(index.key)} `);

																					if (index.status !== 'available') {
																						$$renderer.push('<!--[0-->');

																						Badge($$renderer, {
																							size: 's',
																							variant: 'secondary',
																							content: index.status,
																							type: getEntityStatusBadge(index.status)
																						});

																						$$renderer.push(`<!----> `);

																						if (index.error) {
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
																		$$renderer.push(`<!---->${$.escape(index.type)}`);
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
																	column: 'columns',
																	root,
																	isEditable: false,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(index.fields.join(', '))}`);
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
																	column: 'lengths',
																	root,
																	isEditable: false,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(index.lengths)}`);
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
																	column: 'actions',
																	root,
																	children: ($$renderer) => {
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
																								if (ActionMenu.Item.Button) {
																									$$renderer.push('<!--[-->');

																									ActionMenu.Item.Button($$renderer, {
																										leadingIcon: IconEye,
																										children: ($$renderer) => {
																											$$renderer.push(`<!---->Overview`);
																										},
																										$$slots: { default: true }
																									});

																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}

																								$$renderer.push(` <div${$.attr_style('', { 'padding-block': '0.25rem' })}>`);
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
															$$renderer.push(`<!---->Key`);
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
														column: 'columns',
														root,
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(terminology.field.title.singular)}`);
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
														column: 'lengths',
														root,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Lengths`);
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
													Spreadsheet.Header.Cell($$renderer, { column: 'actions', root });
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
																		const length = entity.indexes.length;

																		$$renderer.push(`<!---->${$.escape(length)}
                                ${$.escape(length === 1 ? 'index' : 'indexes')}`);
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
				} else {
					$$renderer.push('<!--[-1-->');
					emptyIndexesSheetView($$renderer, () => showCreateIndex = true);
					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
				emptyEntitiesSheetView?.($$renderer, () => showCreateIndex = true);
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--> `);

			if (selectedIndexes.length > 0) {
				$$renderer.push(`<!--[0--><div class="floating-action-bar svelte-14osvzr">`);

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
											Badge($$renderer, { content: selectedIndexes.length.toString() });

											$$renderer.push(`<!----> <span${$.attr_style('', { 'font-size': '14px' })}>${$.escape(selectedIndexes.length > 1 ? 'indexes' : 'index')}
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

			SideSheet($$renderer, {
				title: 'Create index',
				submit: {
					text: 'Create',
					onClick: async () => createIndexForm
						? await createIndexRef?.create()
						: await createIndex.create()
				},

				get show() {
					return showCreateIndex;
				},

				set show($$value) {
					showCreateIndex = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (createIndexForm) {
						$$renderer.push('<!--[0-->');
						createIndexForm($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
						CreateIndex($$renderer, { entity, onCreateIndex, showCreateIndex });
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (selectedIndex) {
				$$renderer.push('<!--[0-->');

				Delete($$renderer, {
					onDeleteIndexes,
					get showDelete() {
						return showDelete;
					},

					set showDelete($$value) {
						showDelete = $$value;
						$$settled = false;
					},

					get selectedIndex() {
						return selectedIndex;
					},

					set selectedIndex($$value) {
						selectedIndex = $$value;
						$$settled = false;
					}
				});
			} else if (selectedIndexes && selectedIndexes.length) {
				$$renderer.push('<!--[1-->');

				Delete($$renderer, {
					onDeleteIndexes,
					get showDelete() {
						return showDelete;
					},

					set showDelete($$value) {
						showDelete = $$value;
						$$settled = false;
					},

					get selectedIndex() {
						return selectedIndexes;
					},

					set selectedIndex($$value) {
						selectedIndexes = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			SideSheet($$renderer, {
				title: 'Preview index',
				get show() {
					return showOverview;
				},

				set show($$value) {
					showOverview = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Overview($$renderer, { selectedIndex });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			FailedModal($$renderer, {
				error,
				title: 'Create index',
				header: 'Creation failed',
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

		$.bind_props($$props, { createIndexRef });
	});
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(` <!>`, 1);
var root_3 = $.from_html(`<!> <div><!></div> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <span> </span>`, 1);
var root_6 = $.from_html(`<div><!></div>`);
var root_7 = $.from_html(`<div class="floating-action-bar svelte-14osvzr"><!></div>`);
var root_8 = $.from_html(`<!> <div class="databases-spreadsheet"><!> <!></div> <!> <!> <!> <!>`, 1);

export default function View($$anchor, $$props) {
	$.push($$props, true);

	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const $canWriteTables = () => $.store_get(canWriteTables, '$canWriteTables', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showCreateIndex = $.state(false);
	let selectedIndex = $.state(null);
	let createIndex;
	let selectedIndexes = $.state($.proxy([]));
	let error = $.state('');
	let showFailed = $.state(false);
	let showDelete = $.state(false);
	let showOverview = $.state(false);
	let columnsWidth = $.state(null);
	const organizationId = $.derived(() => page.data.organization?.$id ?? page.data.project?.teamId);

	const spreadsheetColumns = $.derived(() => [
		{
			id: 'key',
			width: getColumnWidth('key', $isSmallViewport() ? 250 : 280),
			minimumWidth: $isSmallViewport() ? 250 : 280,
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

	const emptyCellsLimit = $.derived(() => $isSmallViewport() ? 14 : 17);

	const emptyCellsCount = $.derived(() => $$props.entity.indexes.length >= $.get(emptyCellsLimit)
		? 0
		: $.get(emptyCellsLimit) - $$props.entity.indexes.length);

	const { dependencies, terminology } = getTerminologies();

	onMount(() => {
		$.set(columnsWidth, preferences.getColumnWidths($$props.entity.$id + '#indexes'), true);

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
			if (!$.get(organizationId)) return;

			preferences.saveColumnWidths($.get(organizationId), $$props.entity.$id + '#indexes', {
				[column.columnId]: {
					fixed: column.fixedWidth,
					resized: Math.ceil(column.newWidth)
				}
			});
		},
		1000
	);

	var fragment = root_8();
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
								{
									let $0 = $.derived(() => !$$props.createIndexForm && !$$props.entity.fields?.length);

									Button($$anchor, {
										secondary: true,
										event: 'create_index',
										get disabled() {
											return $.get($0);
										},
										$$events: { click: () => $.set(showCreateIndex, true) },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text('Create index');

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
								}
							};

							$.if(node_2, ($$render) => {
								if ($canWriteTables()) $$render(consequent);
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

	{
		var consequent_4 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_4 = $.first_child(fragment_5);

			{
				var consequent_3 = ($$anchor) => {
					SpreadsheetContainer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_5 = $.first_child(fragment_7);

							$.component(node_5, () => Spreadsheet.Root, ($$anchor, Spreadsheet_Root) => {
								Spreadsheet_Root($$anchor, {
									height: '100%',
									allowSelection: true,
									get columns() {
										return $.get(spreadsheetColumns);
									},

									get emptyCells() {
										return $.get(emptyCellsCount);
									},
									bottomActionClick: () => $.set(showCreateIndex, true),
									get selectedRows() {
										return $.get(selectedIndexes);
									},

									set selectedRows($$value) {
										$.set(selectedIndexes, $$value, true);
									},
									$$events: { columnsResize: (resize) => saveColumnsWidth(resize.detail) },
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$anchor, $$slotProps) => {
											const root = $.derived(() => $$slotProps.root);
											var fragment_8 = $.comment();
											var node_6 = $.first_child(fragment_8);

											$.each(node_6, 17, () => $$props.entity.indexes, (index) => index.key, ($$anchor, index) => {
												var fragment_9 = $.comment();
												var node_7 = $.first_child(fragment_9);

												$.component(node_7, () => Spreadsheet.Row.Base, ($$anchor, Spreadsheet_Row_Base) => {
													Spreadsheet_Row_Base($$anchor, {
														get root() {
															return $.get(root);
														},

														get id() {
															return $.get(index).key;
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_10 = root_4();
															var node_8 = $.first_child(fragment_10);

															$.component(node_8, () => Spreadsheet.Cell, ($$anchor, Spreadsheet_Cell) => {
																Spreadsheet_Cell($$anchor, {
																	column: 'key',
																	get root() {
																		return $.get(root);
																	},
																	isEditable: false,
																	children: ($$anchor, $$slotProps) => {
																		var fragment_11 = $.comment();
																		var node_9 = $.first_child(fragment_11);

																		$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
																			Layout_Stack_1($$anchor, {
																				direction: 'row',
																				alignItems: 'center',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var fragment_12 = root_2();
																					var text_1 = $.first_child(fragment_12);
																					var node_10 = $.sibling(text_1);

																					{
																						var consequent_2 = ($$anchor) => {
																							var fragment_13 = root_1();
																							var node_11 = $.first_child(fragment_13);

																							{
																								let $0 = $.derived(() => getEntityStatusBadge($.get(index).status));

																								Badge(node_11, {
																									size: 's',
																									variant: 'secondary',
																									get content() {
																										return $.get(index).status;
																									},

																									get type() {
																										return $.get($0);
																									}
																								});
																							}

																							var node_12 = $.sibling(node_11, 2);

																							{
																								var consequent_1 = ($$anchor) => {
																									var fragment_14 = $.comment();
																									var node_13 = $.first_child(fragment_14);

																									$.component(node_13, () => Link.Button, ($$anchor, Link_Button) => {
																										Link_Button($$anchor, {
																											variant: 'muted',
																											$$events: {
																												click: (e) => {
																													e.preventDefault();
																													$.set(error, $.get(index).error, true);
																													$.set(showFailed, true);
																												}
																											},

																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_2 = $.text('Details');

																												$.append($$anchor, text_2);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_14);
																								};

																								$.if(node_12, ($$render) => {
																									if ($.get(index).error) $$render(consequent_1);
																								});
																							}

																							$.append($$anchor, fragment_13);
																						};

																						$.if(node_10, ($$render) => {
																							if ($.get(index).status !== 'available') $$render(consequent_2);
																						});
																					}

																					$.template_effect(() => $.set_text(text_1, `${$.get(index).key ?? ''} `));
																					$.append($$anchor, fragment_12);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_11);
																	},
																	$$slots: { default: true }
																});
															});

															var node_14 = $.sibling(node_8, 2);

															$.component(node_14, () => Spreadsheet.Cell, ($$anchor, Spreadsheet_Cell_1) => {
																Spreadsheet_Cell_1($$anchor, {
																	column: 'type',
																	get root() {
																		return $.get(root);
																	},
																	isEditable: false,
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text();

																		$.template_effect(() => $.set_text(text_3, $.get(index).type));
																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_15 = $.sibling(node_14, 2);

															$.component(node_15, () => Spreadsheet.Cell, ($$anchor, Spreadsheet_Cell_2) => {
																Spreadsheet_Cell_2($$anchor, {
																	column: 'columns',
																	get root() {
																		return $.get(root);
																	},
																	isEditable: false,
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text();

																		$.template_effect(($0) => $.set_text(text_4, $0), [() => $.get(index).fields.join(', ')]);
																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															var node_16 = $.sibling(node_15, 2);

															$.component(node_16, () => Spreadsheet.Cell, ($$anchor, Spreadsheet_Cell_3) => {
																Spreadsheet_Cell_3($$anchor, {
																	column: 'lengths',
																	get root() {
																		return $.get(root);
																	},
																	isEditable: false,
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_5 = $.text();

																		$.template_effect(() => $.set_text(text_5, $.get(index).lengths));
																		$.append($$anchor, text_5);
																	},
																	$$slots: { default: true }
																});
															});

															var node_17 = $.sibling(node_16, 2);

															$.component(node_17, () => Spreadsheet.Cell, ($$anchor, Spreadsheet_Cell_4) => {
																Spreadsheet_Cell_4($$anchor, {
																	column: 'actions',
																	get root() {
																		return $.get(root);
																	},

																	children: ($$anchor, $$slotProps) => {
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
																					var fragment_21 = $.comment();
																					var node_18 = $.first_child(fragment_21);
																					const toggle = $.derived(() => $$slotProps.toggle);

																					$.component(node_18, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
																						ActionMenu_Root($$anchor, {
																							slot: 'tooltip',
																							children: $.invalid_default_snippet,
																							$$slots: {
																								default: ($$anchor, $$slotProps) => {
																									var fragment_22 = root_3();
																									var node_19 = $.first_child(fragment_22);

																									$.component(node_19, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
																										ActionMenu_Item_Button($$anchor, {
																											get leadingIcon() {
																												return IconEye;
																											},

																											$$events: {
																												click: () => {
																													$.get(toggle)();
																													$.set(selectedIndex, $.get(index), true);
																													$.set(showOverview, true);
																												}
																											},

																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_6 = $.text('Overview');

																												$.append($$anchor, text_6);
																											},
																											$$slots: { default: true }
																										});
																									});

																									var div_1 = $.sibling(node_19, 2);

																									$.set_style(div_1, '', {}, { 'padding-block': '0.25rem' });

																									var node_20 = $.child(div_1);

																									Divider(node_20, {});
																									$.reset(div_1);

																									var node_21 = $.sibling(div_1, 2);

																									$.component(node_21, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_1) => {
																										ActionMenu_Item_Button_1($$anchor, {
																											status: 'danger',
																											get leadingIcon() {
																												return IconTrash;
																											},

																											$$events: {
																												click: () => {
																													$.get(toggle)();
																													$.set(showDelete, true);
																													$.set(selectedIndex, $.get(index), true);
																													trackEvent(Click.DatabaseIndexDelete);
																												}
																											},

																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_7 = $.text('Delete');

																												$.append($$anchor, text_7);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_22);
																								}
																							}
																						});
																					});

																					$.append($$anchor, fragment_21);
																				}
																			}
																		});
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_9);
											});

											$.append($$anchor, fragment_8);
										},

										header: ($$anchor, $$slotProps) => {
											const root = $.derived(() => $$slotProps.root);
											var fragment_23 = root_4();
											var node_22 = $.first_child(fragment_23);

											$.component(node_22, () => Spreadsheet.Header.Cell, ($$anchor, Spreadsheet_Header_Cell) => {
												Spreadsheet_Header_Cell($$anchor, {
													column: 'key',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_8 = $.text('Key');

														$.append($$anchor, text_8);
													},
													$$slots: { default: true }
												});
											});

											var node_23 = $.sibling(node_22, 2);

											$.component(node_23, () => Spreadsheet.Header.Cell, ($$anchor, Spreadsheet_Header_Cell_1) => {
												Spreadsheet_Header_Cell_1($$anchor, {
													column: 'type',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_9 = $.text('Type');

														$.append($$anchor, text_9);
													},
													$$slots: { default: true }
												});
											});

											var node_24 = $.sibling(node_23, 2);

											$.component(node_24, () => Spreadsheet.Header.Cell, ($$anchor, Spreadsheet_Header_Cell_2) => {
												Spreadsheet_Header_Cell_2($$anchor, {
													column: 'columns',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_10 = $.text();

														$.template_effect(() => $.set_text(text_10, terminology.field.title.singular));
														$.append($$anchor, text_10);
													},
													$$slots: { default: true }
												});
											});

											var node_25 = $.sibling(node_24, 2);

											$.component(node_25, () => Spreadsheet.Header.Cell, ($$anchor, Spreadsheet_Header_Cell_3) => {
												Spreadsheet_Header_Cell_3($$anchor, {
													column: 'lengths',
													get root() {
														return $.get(root);
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_11 = $.text('Lengths');

														$.append($$anchor, text_11);
													},
													$$slots: { default: true }
												});
											});

											var node_26 = $.sibling(node_25, 2);

											$.component(node_26, () => Spreadsheet.Header.Cell, ($$anchor, Spreadsheet_Header_Cell_4) => {
												Spreadsheet_Header_Cell_4($$anchor, {
													column: 'actions',
													get root() {
														return $.get(root);
													}
												});
											});

											$.append($$anchor, fragment_23);
										},

										footer: ($$anchor, $$slotProps) => {
											var fragment_25 = $.comment();
											var node_27 = $.first_child(fragment_25);

											$.component(node_27, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
												Layout_Stack_2($$anchor, {
													direction: 'row',
													alignContent: 'center',
													alignItems: 'center',
													justifyContent: 'space-between',
													children: ($$anchor, $$slotProps) => {
														var fragment_26 = $.comment();
														var node_28 = $.first_child(fragment_26);

														$.component(node_28, () => Typography.Text, ($$anchor, Typography_Text) => {
															Typography_Text($$anchor, {
																variant: 'm-400',
																color: '--fgcolor-neutral-secondary',
																children: ($$anchor, $$slotProps) => {
																	const length = $.derived(() => $$props.entity.indexes.length);

																	$.next();

																	var text_12 = $.text();

																	$.template_effect(() => $.set_text(text_12, `${$.get(length) ?? ''}
                                ${$.get(length) === 1 ? 'index' : 'indexes'}`));

																	$.append($$anchor, text_12);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_26);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_25);
										}
									}
								});
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				};

				var alternate = ($$anchor) => {
					var fragment_28 = $.comment();
					var node_29 = $.first_child(fragment_28);

					$.snippet(node_29, () => $$props.emptyIndexesSheetView, () => () => $.set(showCreateIndex, true));
					$.append($$anchor, fragment_28);
				};

				$.if(node_4, ($$render) => {
					if ($$props.entity.indexes.length) $$render(consequent_3); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_5);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_29 = $.comment();
			var node_30 = $.first_child(fragment_29);

			$.snippet(node_30, () => $$props.emptyEntitiesSheetView ?? $.noop, () => () => $.set(showCreateIndex, true));
			$.append($$anchor, fragment_29);
		};

		$.if(node_3, ($$render) => {
			if (!terminology.schema || $$props.entity.fields?.length) $$render(consequent_4); else $$render(alternate_1, -1);
		});
	}

	var node_31 = $.sibling(node_3, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_2 = root_7();
			var node_32 = $.child(div_2);

			FloatingActionBar(node_32, {
				$$slots: {
					start: ($$anchor, $$slotProps) => {
						var div_3 = root_6();

						$.set_style(div_3, '', {}, { width: 'max-content' });

						var node_33 = $.child(div_3);

						$.component(node_33, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
							Layout_Stack_3($$anchor, {
								direction: 'row',
								alignItems: 'center',
								gap: 'm',
								children: ($$anchor, $$slotProps) => {
									var fragment_30 = root_5();
									var node_34 = $.first_child(fragment_30);

									{
										let $0 = $.derived(() => $.get(selectedIndexes).length.toString());

										Badge(node_34, {
											get content() {
												return $.get($0);
											}
										});
									}

									var span = $.sibling(node_34, 2);

									$.set_style(span, '', {}, { 'font-size': '14px' });

									var text_13 = $.only_child(span);

									$.template_effect(() => $.set_text(text_13, `${$.get(selectedIndexes).length > 1 ? 'indexes' : 'index'}
                                selected`));

									$.append($$anchor, fragment_30);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_3);
						$.append($$anchor, div_3);
					},

					end: ($$anchor, $$slotProps) => {
						var fragment_31 = root_1();
						var node_35 = $.first_child(fragment_31);

						Button(node_35, {
							text: true,
							$$events: { click: () => $.set(selectedIndexes, [], true) },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_14 = $.text('Cancel');

								$.append($$anchor, text_14);
							},
							$$slots: { default: true }
						});

						var node_36 = $.sibling(node_35, 2);

						Button(node_36, {
							secondary: true,
							$$events: { click: () => $.set(showDelete, true) },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_15 = $.text('Delete');

								$.append($$anchor, text_15);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_31);
					}
				}
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_31, ($$render) => {
			if ($.get(selectedIndexes).length > 0) $$render(consequent_5);
		});
	}

	$.reset(div);

	var node_37 = $.sibling(div, 2);

	SideSheet(node_37, {
		title: 'Create index',
		submit: {
			text: 'Create',
			onClick: async () => $$props.createIndexForm
				? await $$props.createIndexRef?.create()
				: await createIndex.create()
		},

		get show() {
			return $.get(showCreateIndex);
		},

		set show($$value) {
			$.set(showCreateIndex, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_32 = $.comment();
			var node_38 = $.first_child(fragment_32);

			{
				var consequent_6 = ($$anchor) => {
					var fragment_33 = $.comment();
					var node_39 = $.first_child(fragment_33);

					$.snippet(node_39, () => $$props.createIndexForm);
					$.append($$anchor, fragment_33);
				};

				var alternate_2 = ($$anchor) => {
					$.bind_this(
						CreateIndex($$anchor, {
							get entity() {
								return $$props.entity;
							},

							get onCreateIndex() {
								return $$props.onCreateIndex;
							},

							get showCreateIndex() {
								return $.get(showCreateIndex);
							}
						}),
						($$value) => createIndex = $$value,
						() => createIndex
					);
				};

				$.if(node_38, ($$render) => {
					if ($$props.createIndexForm) $$render(consequent_6); else $$render(alternate_2, -1);
				});
			}

			$.append($$anchor, fragment_32);
		},
		$$slots: { default: true }
	});

	var node_40 = $.sibling(node_37, 2);

	{
		var consequent_7 = ($$anchor) => {
			Delete($$anchor, {
				get onDeleteIndexes() {
					return $$props.onDeleteIndexes;
				},

				get showDelete() {
					return $.get(showDelete);
				},

				set showDelete($$value) {
					$.set(showDelete, $$value, true);
				},

				get selectedIndex() {
					return $.get(selectedIndex);
				},

				set selectedIndex($$value) {
					$.set(selectedIndex, $$value, true);
				}
			});
		};

		var consequent_8 = ($$anchor) => {
			Delete($$anchor, {
				get onDeleteIndexes() {
					return $$props.onDeleteIndexes;
				},

				get showDelete() {
					return $.get(showDelete);
				},

				set showDelete($$value) {
					$.set(showDelete, $$value, true);
				},

				get selectedIndex() {
					return $.get(selectedIndexes);
				},

				set selectedIndex($$value) {
					$.set(selectedIndexes, $$value, true);
				}
			});
		};

		$.if(node_40, ($$render) => {
			if ($.get(selectedIndex)) $$render(consequent_7); else if ($.get(selectedIndexes) && $.get(selectedIndexes).length) $$render(consequent_8, 1);
		});
	}

	var node_41 = $.sibling(node_40, 2);

	SideSheet(node_41, {
		title: 'Preview index',
		get show() {
			return $.get(showOverview);
		},

		set show($$value) {
			$.set(showOverview, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			Overview($$anchor, {
				get selectedIndex() {
					return $.get(selectedIndex);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_42 = $.sibling(node_41, 2);

	FailedModal(node_42, {
		get error() {
			return $.get(error);
		},
		title: 'Create index',
		header: 'Creation failed',
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
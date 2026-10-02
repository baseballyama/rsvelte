import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { resolve } from '$app/paths';
import { page } from '$app/state';
import { goto } from '$app/navigation';
import { Wizard } from '$lib/layout';
import { Fieldset, Layout, Icon, Divider, Tooltip } from '@appwrite.io/pink-svelte';
import { Button, InputSelect, InputCheckbox, Form } from '$lib/elements/forms';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { IconInfo } from '@appwrite.io/pink-icons-svelte';
import { table } from '../store';
import { queries } from '$lib/components/filters/store';
import { TagList } from '$lib/components/filters';
import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
import { toLocalDateTimeISO } from '$lib/helpers/date';
import { writable } from 'svelte/store';
import { isSmallViewport } from '$lib/stores/viewport';

var root = $.from_html(`<!> <span><!></span> <!>`, 1);
var root_1 = $.from_html(`<div style="min-width: 0;"><!></div>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<span slot="tooltip">Define how to separate values in the exported file.</span>`);
var root_5 = $.from_html(`<div><!></div> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $table = () => $.store_get(table, '$table', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const $queries = () => $.store_get(queries, '$queries', $$stores);
	const $isSubmitting = () => $.store_get($.get(isSubmitting), '$isSubmitting', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showExitModal = $.state(false);
	let formComponent;
	let isSubmitting = $.state($.proxy(writable(false)));
	let localQueries = $.state($.proxy(new Map()));
	const localTags = $.derived(() => Array.from($.get(localQueries).keys()));
	const timestamp = toLocalDateTimeISO(Date.now()).replace(/[:.]/g, '-').split('T').join('_').slice(0, -4);
	const filename = `${$table().name}_${timestamp}.csv`;
	let selectedColumns = $.state($.proxy({}));
	let showAllColumns = $.state(false);
	const delimiterMap = { Comma: ',', Semicolon: ';', Tab: '\t', Pipe: '|' };
	let delimiter = $.state('Comma');
	let includeHeader = $.state(true);
	let exportWithFilters = $.state(false);
	const columnLimit = $.derived(() => $isSmallViewport() ? 6 : 9);

	const visibleColumns = $.derived(() => $.get(showAllColumns)
		? $table().columns
		: $table().columns.slice(0, $.get(columnLimit)));

	const hasMoreColumns = $.derived(() => $table().columns.length > $.get(columnLimit));
	const selectedColumnCount = $.derived(() => Object.values($.get(selectedColumns)).filter(Boolean).length);

	const tableUrl = $.derived(() => {
		const queryParam = page.url.searchParams.get('query');

		const url = resolve('/(console)/project-[region]-[project]/databases/database-[database]/table-[table]', {
			region: page.params.region,
			project: page.params.project,
			database: page.params.database,
			table: page.params.table
		});

		return queryParam
			? `${url}?query=${encodeURIComponent(queryParam)}`
			: url;
	});

	function removeLocalFilter(tag) {
		$.get(localQueries).delete(tag);
		$.set(localQueries, new Map($.get(localQueries)), true);
	}

	function initializeColumns() {
		$.set(selectedColumns, Object.fromEntries($table().columns.map((col) => [col.key, true])), true);
	}

	function selectAllColumns() {
		$.set(selectedColumns, Object.fromEntries($table().columns.map((col) => [col.key, true])), true);
	}

	function deselectAllColumns() {
		$.set(selectedColumns, Object.fromEntries($table().columns.map((col) => [col.key, false])), true);
	}

	async function handleExport() {
		const selectedCols = Object.entries($.get(selectedColumns)).filter(([_, selected]) => selected).map(([key]) => key);

		if (selectedCols.length === 0) {
			addNotification({
				type: 'error',
				message: 'Please select at least one column to export'
			});

			return;
		}

		try {
			await sdk.forProject(page.params.region, page.params.project).migrations.createCSVExport({
				databaseId: page.params.database,
				collectionId: page.params.table,
				filename,
				columns: selectedCols,
				queries: $.get(exportWithFilters) ? Array.from($.get(localQueries).values()) : [],
				delimiter: delimiterMap[$.get(delimiter)],
				header: $.get(includeHeader),
				notify: true
			});

			addNotification({ type: 'success', message: 'CSV export has started' });
			trackEvent(Submit.DatabaseExportCsv);
			await goto($.get(tableUrl));
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
			trackError(error, Submit.DatabaseExportCsv);
		}
	}

	onMount(() => {
		initializeColumns();
		$.set(localQueries, new Map($queries()), true);
	});

	Wizard($$anchor, {
		title: 'Export CSV',
		columnSize: 's',
		get href() {
			return $.get(tableUrl);
		},
		confirmExit: true,
		column: true,
		get showExitModal() {
			return $.get(showExitModal);
		},

		set showExitModal($$value) {
			$.set(showExitModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				Form($$anchor, {
					onSubmit: handleExport,
					get isSubmitting() {
						return $.get(isSubmitting);
					},

					set isSubmitting($$value) {
						$.store_unsub($.set(isSubmitting, $$value, true), '$isSubmitting', $$stores);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node = $.first_child(fragment_2);

						$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
							Layout_Stack($$anchor, {
								gap: 'xxl',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_6();
									var node_1 = $.first_child(fragment_3);

									Fieldset(node_1, {
										legend: 'Columns',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_2 = $.first_child(fragment_4);

											$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
												Layout_Stack_1($$anchor, {
													gap: 'l',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_3();
														var node_3 = $.first_child(fragment_5);

														$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
															Layout_Stack_2($$anchor, {
																direction: 'row',
																gap: 's',
																alignItems: 'center',
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = root();
																	var node_4 = $.first_child(fragment_6);

																	Button(node_4, {
																		compact: true,
																		$$events: { click: selectAllColumns },
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text = $.text('Select all');

																			$.append($$anchor, text);
																		},
																		$$slots: { default: true }
																	});

																	var span = $.sibling(node_4, 2);

																	$.set_style(span, '', {}, { height: '20px' });

																	var node_5 = $.child(span);

																	Divider(node_5, { vertical: true });
																	$.reset(span);

																	var node_6 = $.sibling(span, 2);

																	Button(node_6, {
																		compact: true,
																		$$events: { click: deselectAllColumns },
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_1 = $.text('Deselect all');

																			$.append($$anchor, text_1);
																		},
																		$$slots: { default: true }
																	});

																	$.append($$anchor, fragment_6);
																},
																$$slots: { default: true }
															});
														});

														var node_7 = $.sibling(node_3, 2);

														$.component(node_7, () => Layout.Grid, ($$anchor, Layout_Grid) => {
															Layout_Grid($$anchor, {
																columns: 3,
																columnsS: 1,
																gap: 'l',
																children: ($$anchor, $$slotProps) => {
																	var fragment_7 = $.comment();
																	var node_8 = $.first_child(fragment_7);

																	$.each(node_8, 17, () => $.get(visibleColumns), (column) => column.key, ($$anchor, column) => {
																		var div = root_1();
																		var node_9 = $.child(div);

																		{
																			let $0 = $.derived(() => `column-${$.get(column).key}`);

																			InputCheckbox(node_9, {
																				get id() {
																					return $.get($0);
																				},

																				get label() {
																					return $.get(column).key;
																				},
																				truncate: true,
																				get checked() {
																					return $.get(selectedColumns)[$.get(column).key];
																				},

																				set checked($$value) {
																					$.get(selectedColumns)[$.get(column).key] = $$value;
																				}
																			});
																		}

																		$.reset(div);
																		$.append($$anchor, div);
																	});

																	$.append($$anchor, fragment_7);
																},
																$$slots: { default: true }
															});
														});

														var node_10 = $.sibling(node_7, 2);

														{
															var consequent = ($$anchor) => {
																var div_1 = root_2();

																$.set_style(div_1, '', {}, { 'margin-bottom': '-0.5rem' });

																var node_11 = $.child(div_1);

																Button(node_11, {
																	compact: true,
																	$$events: { click: () => $.set(showAllColumns, !$.get(showAllColumns)) },
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text();

																		$.template_effect(() => $.set_text(text_2, $.get(showAllColumns) ? 'Show less' : 'Show more'));
																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});

																$.reset(div_1);
																$.append($$anchor, div_1);
															};

															$.if(node_10, ($$render) => {
																if ($.get(hasMoreColumns)) $$render(consequent);
															});
														}

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});

									var node_12 = $.sibling(node_1, 2);

									Fieldset(node_12, {
										legend: 'Export options',
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = $.comment();
											var node_13 = $.first_child(fragment_9);

											$.component(node_13, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
												Layout_Stack_3($$anchor, {
													gap: 'l',
													children: ($$anchor, $$slotProps) => {
														var fragment_10 = root_3();
														var node_14 = $.first_child(fragment_10);

														InputSelect(node_14, {
															id: 'delimiter',
															label: 'Delimiter',
															options: [
																{ value: 'Comma', label: 'Comma' },
																{ value: 'Semicolon', label: 'Semicolon' },
																{ value: 'Tab', label: 'Tab' },
																{ value: 'Pipe', label: 'Pipe' }
															],

															get value() {
																return $.get(delimiter);
															},

															set value($$value) {
																$.set(delimiter, $$value, true);
															},

															$$slots: {
																info: ($$anchor, $$slotProps) => {
																	var fragment_11 = $.comment();
																	var node_15 = $.first_child(fragment_11);

																	$.component(node_15, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																		Layout_Stack_4($$anchor, {
																			direction: 'row',
																			gap: 'none',
																			alignItems: 'center',
																			slot: 'info',
																			children: ($$anchor, $$slotProps) => {
																				Tooltip($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						Icon($$anchor, {
																							size: 's',
																							get icon() {
																								return IconInfo;
																							}
																						});
																					},

																					$$slots: {
																						default: true,
																						tooltip: ($$anchor, $$slotProps) => {
																							var span_1 = root_4();

																							$.append($$anchor, span_1);
																						}
																					}
																				});
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_11);
																}
															}
														});

														var node_16 = $.sibling(node_14, 2);

														InputCheckbox(node_16, {
															id: 'includeHeader',
															label: 'Include header row',
															description: 'Column names will be added as the first row in the CSV',
															get checked() {
																return $.get(includeHeader);
															},

															set checked($$value) {
																$.set(includeHeader, $$value, true);
															}
														});

														var node_17 = $.sibling(node_16, 2);

														$.component(node_17, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
															Layout_Stack_5($$anchor, {
																gap: 'm',
																children: ($$anchor, $$slotProps) => {
																	var fragment_14 = root_5();
																	var div_2 = $.first_child(fragment_14);
																	let classes;
																	var node_18 = $.child(div_2);

																	{
																		let $0 = $.derived(() => $.get(localTags).length === 0);

																		InputCheckbox(node_18, {
																			id: 'exportWithFilters',
																			label: 'Export with filters',
																			description: 'Export rows that match the current table filters',
																			get disabled() {
																				return $.get($0);
																			},

																			get checked() {
																				return $.get(exportWithFilters);
																			},

																			set checked($$value) {
																				$.set(exportWithFilters, $$value, true);
																			}
																		});
																	}

																	$.reset(div_2);

																	var node_19 = $.sibling(div_2, 2);

																	{
																		var consequent_1 = ($$anchor) => {
																			var fragment_15 = $.comment();
																			var node_20 = $.first_child(fragment_15);

																			$.component(node_20, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
																				Layout_Stack_6($$anchor, {
																					direction: 'row',
																					gap: 'xs',
																					alignItems: 'center',
																					style: 'padding-left: 1.75rem;',
																					wrap: 'wrap',
																					children: ($$anchor, $$slotProps) => {
																						TagList($$anchor, {
																							get tags() {
																								return $.get(localTags);
																							},

																							$$events: {
																								remove: (e) => {
																									removeLocalFilter(e.detail);
																								}
																							}
																						});
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_15);
																		};

																		$.if(node_19, ($$render) => {
																			if ($.get(localTags).length > 0) $$render(consequent_1);
																		});
																	}

																	$.template_effect(() => classes = $.set_class(div_2, 1, 'svelte-2vtk84', null, classes, { 'disabled-checkbox': $.get(localTags).length === 0 }));
																	$.append($$anchor, fragment_14);
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
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}),
				($$value) => formComponent = $$value,
				() => formComponent
			);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_17 = $.comment();
				var node_21 = $.first_child(fragment_17);

				$.component(node_21, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
					Layout_Stack_7($$anchor, {
						justifyContent: 'flex-end',
						direction: 'row',
						children: ($$anchor, $$slotProps) => {
							var fragment_18 = root_6();
							var node_22 = $.first_child(fragment_18);

							Button(node_22, {
								fullWidthMobile: true,
								secondary: true,
								$$events: { click: () => $.set(showExitModal, true) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Cancel');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_23 = $.sibling(node_22, 2);

							{
								let $0 = $.derived(() => $isSubmitting() || $.get(selectedColumnCount) === 0);

								Button(node_23, {
									fullWidthMobile: true,
									get disabled() {
										return $.get($0);
									},
									$$events: { click: () => formComponent.triggerSubmit() },
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Export');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_18);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_17);
			}
		}
	});

	$.pop();
	$$cleanup();
}
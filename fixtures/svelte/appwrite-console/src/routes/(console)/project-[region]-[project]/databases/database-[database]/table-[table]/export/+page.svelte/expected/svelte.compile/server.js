import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let showExitModal = false;
		let formComponent;
		let isSubmitting = writable(false);
		let localQueries = new Map();
		const localTags = $.derived(() => Array.from(localQueries.keys()));
		const timestamp = toLocalDateTimeISO(Date.now()).replace(/[:.]/g, '-').split('T').join('_').slice(0, -4);
		const filename = `${$.store_get($$store_subs ??= {}, '$table', table).name}_${timestamp}.csv`;
		let selectedColumns = {};
		let showAllColumns = false;
		const delimiterMap = { Comma: ',', Semicolon: ';', Tab: '\t', Pipe: '|' };
		let delimiter = 'Comma';
		let includeHeader = true;
		let exportWithFilters = false;
		const columnLimit = $.derived(() => $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 6 : 9);

		const visibleColumns = $.derived(() => showAllColumns
			? $.store_get($$store_subs ??= {}, '$table', table).columns
			: $.store_get($$store_subs ??= {}, '$table', table).columns.slice(0, columnLimit()));

		const hasMoreColumns = $.derived(() => $.store_get($$store_subs ??= {}, '$table', table).columns.length > columnLimit());
		const selectedColumnCount = $.derived(() => Object.values(selectedColumns).filter(Boolean).length);

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
			localQueries.delete(tag);
			localQueries = new Map(localQueries);
		}

		function initializeColumns() {
			selectedColumns = Object.fromEntries($.store_get($$store_subs ??= {}, '$table', table).columns.map((col) => [col.key, true]));
		}

		function selectAllColumns() {
			selectedColumns = Object.fromEntries($.store_get($$store_subs ??= {}, '$table', table).columns.map((col) => [col.key, true]));
		}

		function deselectAllColumns() {
			selectedColumns = Object.fromEntries($.store_get($$store_subs ??= {}, '$table', table).columns.map((col) => [col.key, false]));
		}

		async function handleExport() {
			const selectedCols = Object.entries(selectedColumns).filter(([_, selected]) => selected).map(([key]) => key);

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
					queries: exportWithFilters ? Array.from(localQueries.values()) : [],
					delimiter: delimiterMap[delimiter],
					header: includeHeader,
					notify: true
				});

				addNotification({ type: 'success', message: 'CSV export has started' });
				trackEvent(Submit.DatabaseExportCsv);
				await goto(tableUrl());
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
				trackError(error, Submit.DatabaseExportCsv);
			}
		}

		onMount(() => {
			initializeColumns();
			localQueries = new Map($.store_get($$store_subs ??= {}, '$queries', queries));
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Wizard($$renderer, {
				title: 'Export CSV',
				columnSize: 's',
				href: tableUrl(),
				confirmExit: true,
				column: true,
				get showExitModal() {
					return showExitModal;
				},

				set showExitModal($$value) {
					showExitModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Form($$renderer, {
						onSubmit: handleExport,
						get isSubmitting() {
							return isSubmitting;
						},

						set isSubmitting($$value) {
							isSubmitting = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xxl',
									children: ($$renderer) => {
										Fieldset($$renderer, {
											legend: 'Columns',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 'l',
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	direction: 'row',
																	gap: 's',
																	alignItems: 'center',
																	children: ($$renderer) => {
																		Button($$renderer, {
																			compact: true,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Select all`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----> <span${$.attr_style('', { height: '20px' })}>`);
																		Divider($$renderer, { vertical: true });
																		$$renderer.push(`<!----></span> `);

																		Button($$renderer, {
																			compact: true,
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Deselect all`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!---->`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Layout.Grid) {
																$$renderer.push('<!--[-->');

																Layout.Grid($$renderer, {
																	columns: 3,
																	columnsS: 1,
																	gap: 'l',
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array = $.ensure_array_like(visibleColumns());

																		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																			let column = each_array[$$index];

																			$$renderer.push(`<div style="min-width: 0;">`);

																			InputCheckbox($$renderer, {
																				id: `column-${column.key}`,
																				label: column.key,
																				truncate: true,
																				get checked() {
																					return selectedColumns[column.key];
																				},

																				set checked($$value) {
																					selectedColumns[column.key] = $$value;
																					$$settled = false;
																				}
																			});

																			$$renderer.push(`<!----></div>`);
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

															if (hasMoreColumns()) {
																$$renderer.push(`<!--[0--><div${$.attr_style('', { 'margin-bottom': '-0.5rem' })}>`);

																Button($$renderer, {
																	compact: true,
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(showAllColumns ? 'Show less' : 'Show more')}`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----></div>`);
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

										$$renderer.push(`<!----> `);

										Fieldset($$renderer, {
											legend: 'Export options',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 'l',
														children: ($$renderer) => {
															InputSelect($$renderer, {
																id: 'delimiter',
																label: 'Delimiter',
																options: [
																	{ value: 'Comma', label: 'Comma' },
																	{ value: 'Semicolon', label: 'Semicolon' },
																	{ value: 'Tab', label: 'Tab' },
																	{ value: 'Pipe', label: 'Pipe' }
																],

																get value() {
																	return delimiter;
																},

																set value($$value) {
																	delimiter = $$value;
																	$$settled = false;
																},

																$$slots: {
																	info: ($$renderer) => {
																		if (Layout.Stack) {
																			$$renderer.push('<!--[-->');

																			Layout.Stack($$renderer, {
																				direction: 'row',
																				gap: 'none',
																				alignItems: 'center',
																				slot: 'info',
																				children: ($$renderer) => {
																					Tooltip($$renderer, {
																						children: ($$renderer) => {
																							Icon($$renderer, { size: 's', icon: IconInfo });
																						},

																						$$slots: {
																							default: true,
																							tooltip: ($$renderer) => {
																								$$renderer.push(`<span slot="tooltip">Define how to separate values in the exported file.</span>`);
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
																	}
																}
															});

															$$renderer.push(`<!----> `);

															InputCheckbox($$renderer, {
																id: 'includeHeader',
																label: 'Include header row',
																description: 'Column names will be added as the first row in the CSV',
																get checked() {
																	return includeHeader;
																},

																set checked($$value) {
																	includeHeader = $$value;
																	$$settled = false;
																}
															});

															$$renderer.push(`<!----> `);

															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 'm',
																	children: ($$renderer) => {
																		$$renderer.push(`<div${$.attr_class('svelte-2vtk84', void 0, { 'disabled-checkbox': localTags().length === 0 })}>`);

																		InputCheckbox($$renderer, {
																			id: 'exportWithFilters',
																			label: 'Export with filters',
																			description: 'Export rows that match the current table filters',
																			disabled: localTags().length === 0,
																			get checked() {
																				return exportWithFilters;
																			},

																			set checked($$value) {
																				exportWithFilters = $$value;
																				$$settled = false;
																			}
																		});

																		$$renderer.push(`<!----></div> `);

																		if (localTags().length > 0) {
																			$$renderer.push('<!--[0-->');

																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					direction: 'row',
																					gap: 'xs',
																					alignItems: 'center',
																					style: 'padding-left: 1.75rem;',
																					wrap: 'wrap',
																					children: ($$renderer) => {
																						TagList($$renderer, { tags: localTags() });
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
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
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
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									justifyContent: 'flex-end',
									direction: 'row',
									children: ($$renderer) => {
										Button($$renderer, {
											fullWidthMobile: true,
											secondary: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Cancel`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											fullWidthMobile: true,
											disabled: $.store_get($$store_subs ??= {}, '$isSubmitting', isSubmitting) || selectedColumnCount() === 0,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Export`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
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
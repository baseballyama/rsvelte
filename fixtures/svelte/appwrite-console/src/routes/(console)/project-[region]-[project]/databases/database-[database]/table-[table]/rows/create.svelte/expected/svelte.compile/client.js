import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { addNotification } from '$lib/stores/notifications';
import { writable } from 'svelte/store';
import ColumnForm from './columns/columnForm.svelte';
import { ID } from '@appwrite.io/console';
import { Permissions } from '$lib/components/permissions';
import { spreadsheetRenderKey } from '$database/store';
import { Alert, Layout, Typography, Selector } from '@appwrite.io/pink-svelte';
import { SideSheet, toRelationalField } from '$database/(entity)';
import { invalidate } from '$app/navigation';
import { Dependencies } from '$lib/constants';
import { tick } from 'svelte';
import { isRelationship, isRelationshipToMany, buildPayload } from './store';
import { hash } from '$lib/helpers/string';

var root = $.from_html(`Users will be able to access this row if they have been granted <b>either row or table permissions</b>.`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div><!></div> <!>`, 1);
var root_3 = $.from_html(`<div class="sheet-container"><!></div>`);

export default function Create($$anchor, $$props) {
	$.push($$props, true);

	const $createRow = () => $.store_get(createRow, '$createRow', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let showSheet = $.prop($$props, 'showSheet', 15, false),
		existingData = $.prop($$props, 'existingData', 15, null);

	let createMore = $.state(false);
	let isSubmitting = $.state(false);
	let columnFormWrapper = $.state(null);
	let createRow = writable(computeInitialCreateRow());

	function resetCreateRow() {
		createRow.set(computeInitialCreateRow());
	}

	function computeInitialCreateRow() {
		const availableColumns = $$props.table.fields.map(toRelationalField).filter((column) => column.status === 'available');

		return {
			id: null,
			row: existingData()
				? existingData()
				: availableColumns.reduce(
					(acc, field) => {
						acc[field.key] = field.array ? [] : null;

						return acc;
					},
					{}
				),
			permissions: existingData()?.$permissions ?? [],
			columns: availableColumns
		};
	}

	// for one to *, we need the IDs,
	// for many to *, we need the full row object.
	function prepareRowPayload(createRowObject) {
		const { row, columns } = createRowObject;
		const payload = structuredClone(row);

		for (const column of columns) {
			if (isRelationship(column) && !isRelationshipToMany(column)) {
				const key = column.key;
				const value = payload[key];

				if (value && typeof value === 'object') {
					if (Array.isArray(value)) {
						payload[key] = value.map((item) => item && typeof item === 'object' && '$id' in item ? item.$id : null).filter(Boolean);
					} else {
						payload[key] = value['$id'];
					}
				}
			}
		}

		return buildPayload(columns, payload);
	}

	async function create() {
		$.set(isSubmitting, true);
		$.store_mutate(createRow, $.untrack($createRow).row = prepareRowPayload($createRow()), $.untrack($createRow));

		try {
			const row = await sdk.forProject(page.params.region, page.params.project).tablesDB.createRow({
				databaseId: page.params.database,
				tableId: page.params.table,
				rowId: $createRow().id ?? ID.unique(),
				data: $createRow().row,
				permissions: $createRow().permissions
			});

			addNotification({ message: 'Row has been created', type: 'success' });
			trackEvent(Submit.RowCreate, { customId: !!$createRow().id });
			await invalidate(Dependencies.ROWS);

			// re-render spreadsheet on addition!
			spreadsheetRenderKey.set(hash(row.$id));

			if ($.get(createMore)) {
				resetCreateRow();
				existingData(null);
				await tick();
				focusFirstInput();

				return true; // keep sheet open
			}

			return false; // close sheet
		} catch(error) {
			addNotification({ message: error.message, type: 'error' });
			trackError(error, Submit.RowCreate);

			return true; // keep open on error
		} finally {
			$.set(isSubmitting, false);
		}
	}

	function focusFirstInput() {
		const firstInput = $.get(columnFormWrapper)?.querySelector('input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])');

		firstInput?.focus({ preventScroll: true });
	}

	$.user_effect(() => {
		if (showSheet()) {
			focusFirstInput();
			resetCreateRow();
		} else {
			$.set(createMore, false);
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_3();
			var node_1 = $.child(div);

			{
				const footer = ($$anchor) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
						Layout_Stack($$anchor, {
							inline: true,
							direction: 'row',
							alignItems: 'center',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Selector.Switch, ($$anchor, Selector_Switch) => {
									Selector_Switch($$anchor, {
										id: 'create-more',
										label: 'Create more',
										get checked() {
											return $.get(createMore);
										},

										set checked($$value) {
											$.set(createMore, $$value, true);
										}
									});
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				};

				let $0 = $.derived(() => `${existingData() ? 'Duplicate' : 'Create'} row`);

				let $1 = $.derived(() => ({
					text: 'Create',
					disabled: $.get(isSubmitting),
					onClick: async () => await create()
				}));

				SideSheet(node_1, {
					get title() {
						return $.get($0);
					},
					closeOnBlur: false,
					get submit() {
						return $.get($1);
					},

					get show() {
						return showSheet();
					},

					set show($$value) {
						showSheet($$value);
					},
					footer,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_4 = $.first_child(fragment_3);

						$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								gap: 'xxl',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_2();
									var div_1 = $.first_child(fragment_4);
									var node_5 = $.child(div_1);

									ColumnForm(node_5, {
										get columns() {
											return $createRow().columns;
										},

										get customId() {
											return $createRow().id;
										},

										set customId($$value) {
											$.store_mutate(createRow, $.untrack($createRow).id = $$value, $.untrack($createRow));
										},

										get formValues() {
											return $createRow().row;
										},

										set formValues($$value) {
											$.store_mutate(createRow, $.untrack($createRow).row = $$value, $.untrack($createRow));
										}
									});

									$.reset(div_1);
									$.bind_this(div_1, ($$value) => $.set(columnFormWrapper, $$value), () => $.get(columnFormWrapper));

									var node_6 = $.sibling(div_1, 2);

									$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
										Layout_Stack_2($$anchor, {
											gap: 'xl',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();
												var node_7 = $.first_child(fragment_5);

												$.component(node_7, () => Typography.Text, ($$anchor, Typography_Text) => {
													Typography_Text($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('Choose which permission scopes to grant your application. It is best\n                        practice to allow only the permissions you need to meet your project goals.');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												var node_8 = $.sibling(node_7, 2);

												{
													var consequent = ($$anchor) => {
														var fragment_6 = root_1();
														var node_9 = $.first_child(fragment_6);

														$.component(node_9, () => Alert.Inline, ($$anchor, Alert_Inline) => {
															Alert_Inline($$anchor, {
																status: 'info',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var fragment_7 = root();

																	$.next(2);
																	$.append($$anchor, fragment_7);
																},

																$$slots: {
																	default: true,
																	title: ($$anchor, $$slotProps) => {
																		var text_1 = $.text('Row security is enabled');

																		$.append($$anchor, text_1);
																	}
																}
															});
														});

														var node_10 = $.sibling(node_9, 2);

														Permissions(node_10, {
															get permissions() {
																return $createRow().permissions;
															},

															set permissions($$value) {
																$.store_mutate(createRow, $.untrack($createRow).permissions = $$value, $.untrack($createRow));
															}
														});

														$.append($$anchor, fragment_6);
													};

													var alternate = ($$anchor) => {
														var fragment_8 = $.comment();
														var node_11 = $.first_child(fragment_8);

														$.component(node_11, () => Alert.Inline, ($$anchor, Alert_Inline_1) => {
															Alert_Inline_1($$anchor, {
																status: 'info',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('If you want to assign row permissions, navigate to Table settings and enable\n                            row security. Otherwise, only table permissions will be used.');

																	$.append($$anchor, text_2);
																},

																$$slots: {
																	default: true,
																	title: ($$anchor, $$slotProps) => {
																		var text_3 = $.text('Row security is disabled');

																		$.append($$anchor, text_3);
																	}
																}
															});
														});

														$.append($$anchor, fragment_8);
													};

													$.if(node_8, ($$render) => {
														if ($$props.table.recordSecurity) $$render(consequent); else $$render(alternate, -1);
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
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { footer: true, default: true }
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($createRow()) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
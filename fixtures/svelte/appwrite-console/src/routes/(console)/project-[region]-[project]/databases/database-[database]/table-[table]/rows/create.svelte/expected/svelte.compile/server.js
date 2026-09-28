import * as $ from 'svelte/internal/server';
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

export default function Create($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { table, showSheet = false, existingData = null } = $$props;
		let createMore = false;
		let isSubmitting = false;
		let columnFormWrapper = null;
		let createRow = writable(computeInitialCreateRow());

		function resetCreateRow() {
			createRow.set(computeInitialCreateRow());
		}

		function computeInitialCreateRow() {
			const availableColumns = table.fields.map(toRelationalField).filter((column) => column.status === 'available');

			return {
				id: null,
				row: existingData
					? existingData
					: availableColumns.reduce(
						(acc, field) => {
							acc[field.key] = field.array ? [] : null;

							return acc;
						},
						{}
					),
				permissions: existingData?.$permissions ?? [],
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
			isSubmitting = true;
			$.store_mutate($$store_subs ??= {}, '$createRow', createRow, $.store_get($$store_subs ??= {}, '$createRow', createRow).row = prepareRowPayload($.store_get($$store_subs ??= {}, '$createRow', createRow)));

			try {
				const row = await sdk.forProject(page.params.region, page.params.project).tablesDB.createRow({
					databaseId: page.params.database,
					tableId: page.params.table,
					rowId: $.store_get($$store_subs ??= {}, '$createRow', createRow).id ?? ID.unique(),
					data: $.store_get($$store_subs ??= {}, '$createRow', createRow).row,
					permissions: $.store_get($$store_subs ??= {}, '$createRow', createRow).permissions
				});

				addNotification({ message: 'Row has been created', type: 'success' });

				trackEvent(Submit.RowCreate, {
					customId: !!$.store_get($$store_subs ??= {}, '$createRow', createRow).id
				});

				await invalidate(Dependencies.ROWS);

				// re-render spreadsheet on addition!
				spreadsheetRenderKey.set(hash(row.$id));

				if (createMore) {
					resetCreateRow();
					existingData = null;
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
				isSubmitting = false;
			}
		}

		function focusFirstInput() {
			const firstInput = columnFormWrapper?.querySelector('input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])');

			firstInput?.focus({ preventScroll: true });
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if ($.store_get($$store_subs ??= {}, '$createRow', createRow)) {
				$$renderer.push(`<!--[0--><div class="sheet-container">`);

				{
					function footer($$renderer) {
						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								inline: true,
								direction: 'row',
								alignItems: 'center',
								children: ($$renderer) => {
									if (Selector.Switch) {
										$$renderer.push('<!--[-->');

										Selector.Switch($$renderer, {
											id: 'create-more',
											label: 'Create more',
											get checked() {
												return createMore;
											},

											set checked($$value) {
												createMore = $$value;
												$$settled = false;
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

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					SideSheet($$renderer, {
						title: `${existingData ? 'Duplicate' : 'Create'} row`,
						closeOnBlur: false,
						submit: {
							text: 'Create',
							disabled: isSubmitting,
							onClick: async () => await create()
						},

						get show() {
							return showSheet;
						},

						set show($$value) {
							showSheet = $$value;
							$$settled = false;
						},
						footer,
						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xxl',
									children: ($$renderer) => {
										$$renderer.push(`<div>`);

										ColumnForm($$renderer, {
											columns: $.store_get($$store_subs ??= {}, '$createRow', createRow).columns,
											get customId() {
												return $.store_get($$store_subs ??= {}, '$createRow', createRow).id;
											},

											set customId($$value) {
												$.store_mutate($$store_subs ??= {}, '$createRow', createRow, $.store_get($$store_subs ??= {}, '$createRow', createRow).id = $$value);
												$$settled = false;
											},

											get formValues() {
												return $.store_get($$store_subs ??= {}, '$createRow', createRow).row;
											},

											set formValues($$value) {
												$.store_mutate($$store_subs ??= {}, '$createRow', createRow, $.store_get($$store_subs ??= {}, '$createRow', createRow).row = $$value);
												$$settled = false;
											}
										});

										$$renderer.push(`<!----></div> `);

										if (Layout.Stack) {
											$$renderer.push('<!--[-->');

											Layout.Stack($$renderer, {
												gap: 'xl',
												children: ($$renderer) => {
													if (Typography.Text) {
														$$renderer.push('<!--[-->');

														Typography.Text($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Choose which permission scopes to grant your application. It is best
                        practice to allow only the permissions you need to meet your project goals.`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (table.recordSecurity) {
														$$renderer.push('<!--[0-->');

														if (Alert.Inline) {
															$$renderer.push('<!--[-->');

															Alert.Inline($$renderer, {
																status: 'info',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Users will be able to access this row if they have been granted <b>either row or table permissions</b>.`);
																},

																$$slots: {
																	default: true,
																	title: ($$renderer) => {
																		{
																			$$renderer.push(`Row security is enabled`);
																		}
																	}
																}
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														Permissions($$renderer, {
															get permissions() {
																return $.store_get($$store_subs ??= {}, '$createRow', createRow).permissions;
															},

															set permissions($$value) {
																$.store_mutate($$store_subs ??= {}, '$createRow', createRow, $.store_get($$store_subs ??= {}, '$createRow', createRow).permissions = $$value);
																$$settled = false;
															}
														});

														$$renderer.push(`<!---->`);
													} else {
														$$renderer.push('<!--[-1-->');

														if (Alert.Inline) {
															$$renderer.push('<!--[-->');

															Alert.Inline($$renderer, {
																status: 'info',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->If you want to assign row permissions, navigate to Table settings and enable
                            row security. Otherwise, only table permissions will be used.`);
																},

																$$slots: {
																	default: true,
																	title: ($$renderer) => {
																		{
																			$$renderer.push(`Row security is disabled`);
																		}
																	}
																}
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
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
						$$slots: { footer: true, default: true }
					});
				}

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { showSheet, existingData });
	});
}
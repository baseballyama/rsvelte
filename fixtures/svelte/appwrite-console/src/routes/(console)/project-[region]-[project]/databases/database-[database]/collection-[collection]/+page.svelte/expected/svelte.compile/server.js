import * as $ from 'svelte/internal/server';
import { Filters, hasPageQueries, queries } from '$lib/components/filters';
import ViewSelector from '$lib/components/viewSelector.svelte';
import { Button } from '$lib/elements/forms';
import { Container } from '$lib/layout';
import { preferences } from '$lib/stores/preferences';
import { Icon, Layout, Divider, Tooltip, Selector, Typography, Dialog } from '@appwrite.io/pink-svelte';
import FilePicker from '$lib/components/filePicker.svelte';
import { page } from '$app/state';
import { addNotification } from '$lib/stores/notifications';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { isSmallViewport } from '$lib/stores/viewport';

import {
	IconChevronDown,
	IconChevronUp,
	IconPlus,
	IconViewBoards,
	IconRefresh,
	IconUpload,
	IconDownload
} from '@appwrite.io/pink-icons-svelte';

import { OnDuplicate } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { Click } from '$lib/actions/analytics';
import { expandTabs, randomDataModalState, spreadsheetRenderKey } from '$database/store';
import { invalidate } from '$app/navigation';
import { hash } from '$lib/helpers/string';
import { Dependencies } from '$lib/constants';
import { EmptySheet, EmptySheetCards, toDatabaseType } from '$database/(entity)';

import {
	isCollectionsJsonImportInProgress,
	noSqlDocument,
	collectionColumns
} from '$database/collection-[collection]/store';

import { canWriteRows } from '$lib/stores/roles';
import SpreadSheet from '$database/collection-[collection]/spreadsheet.svelte';
import ColumnDisplayNameInput from '$database/collection-[collection]/(components)/inputs/displayName.svelte';
import { Modal } from '$lib/components';
import { buildInitDoc } from './+layout.svelte';
import { writable } from 'svelte/store';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
		const filterColumns = writable([]);
		const databaseType = $.derived(() => toDatabaseType(data.database.type));
		let isRefreshing = false;
		let showImportJson = false;
		let showImportOptions = false;
		let showCustomColumnsModal = false;
		let importOnDuplicate = OnDuplicate.Fail;
		let pendingFile = null;
		let pendingLocalFile = false;
		let columnsError = null;
		let spreadsheet = null;
		let columnDisplayNameInput = null;
		const disableCreateDocument = $.derived(() => $.store_get($$store_subs ??= {}, '$isCollectionsJsonImportInProgress', isCollectionsJsonImportInProgress) || $.store_get($$store_subs ??= {}, '$noSqlDocument', noSqlDocument).isNew && ($.store_get($$store_subs ??= {}, '$noSqlDocument', noSqlDocument).hasDataChanged || $.store_get($$store_subs ??= {}, '$noSqlDocument', noSqlDocument).isDirty));

		function getExportUrl() {
			const queryParam = page.url.searchParams.get('query');

			const url = resolve('/(console)/project-[region]-[project]/databases/database-[database]/collection-[collection]/export', {
				region: page.params.region,
				project: page.params.project,
				database: page.params.database,
				collection: page.params.collection
			});

			return queryParam
				? `${url}?query=${encodeURIComponent(queryParam)}`
				: url;
		}

		function onSelect(file, localFile = false) {
			pendingFile = file;
			pendingLocalFile = localFile;
			importOnDuplicate = OnDuplicate.Fail;
			showImportOptions = true;
		}

		async function startImport() {
			if (!pendingFile) return;

			showImportOptions = false;
			$.store_set(isCollectionsJsonImportInProgress, true);

			try {
				await sdk.forProject(page.params.region, page.params.project).migrations.createJSONImport({
					bucketId: pendingFile.bucketId,
					fileId: pendingFile.$id,
					databaseId: page.params.database,
					collectionId: page.params.collection,
					internalFile: pendingLocalFile,
					onDuplicate: importOnDuplicate
				});

				addNotification({
					type: 'success',
					message: 'Documents import from JSON has started'
				});

				trackEvent(Submit.DatabaseImportJSON);
			} catch(e) {
				trackError(e, Submit.DatabaseImportJSON);
				addNotification({ type: 'error', message: e.message });
			} finally {
				$.store_set(isCollectionsJsonImportInProgress, false);
				pendingFile = null;
			}
		}

		function createFilterableColumns() {
			return [
				{ id: '$id', title: '$id', type: 'string' },
				{ id: '$createdAt', title: '$createdAt', type: 'datetime' },
				{ id: '$updatedAt', title: '$updatedAt', type: 'datetime' }
			];
		}

		function handleColumnToggle() {
			// Force spreadsheet re-render when columns are toggled
			spreadsheetRenderKey.set(hash(Date.now().toString()));
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<!---->`);

			{
				Container($$renderer, {
					expanded: true,
					expandHeightButton: true,
					style: 'background: var(--bgcolor-neutral-primary)',
					children: ($$renderer) => {
						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								direction: 'column',
								gap: 'xl',
								children: ($$renderer) => {
									if (Layout.Stack) {
										$$renderer.push('<!--[-->');

										Layout.Stack($$renderer, {
											direction: 'row',
											justifyContent: 'space-between',
											children: ($$renderer) => {
												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														gap: 's',
														children: ($$renderer) => {
															Tooltip($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<div>`);

																	ViewSelector($$renderer, {
																		onlyIcon: true,
																		ui: 'new',
																		hideView: true,
																		showAnyway: true,
																		isCustomTable: true,
																		view: data.view,
																		columns: collectionColumns,
																		disableButton: data.documents.total === 0,
																		onPreferencesUpdated: handleColumnToggle,
																		onCustomOptionClick: () => showCustomColumnsModal = true
																	});

																	$$renderer.push(`<!----></div>`);
																},

																$$slots: {
																	default: true,
																	tooltip: ($$renderer) => {
																		{
																			$$renderer.push(`Columns`);
																		}
																	}
																}
															});

															$$renderer.push(`<!----> `);

															Tooltip($$renderer, {
																children: ($$renderer) => {
																	Filters($$renderer, {
																		onlyIcon: true,
																		query: data.query,
																		columns: filterColumns,
																		schema: false,
																		analyticsSource: 'database_collections'
																	});
																},

																$$slots: {
																	default: true,
																	tooltip: ($$renderer) => {
																		{
																			$$renderer.push(`Filters`);
																		}
																	}
																}
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

												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														direction: 'row',
														alignItems: 'center',
														justifyContent: 'flex-end',
														style: `padding-right: ${$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? '0' : '40px'};`,
														children: ($$renderer) => {
															if (Layout.Stack) {
																$$renderer.push('<!--[-->');

																Layout.Stack($$renderer, {
																	gap: 's',
																	direction: 'row',
																	alignItems: 'center',
																	justifyContent: 'flex-end',
																	children: ($$renderer) => {
																		if (!$.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
																			$$renderer.push('<!--[0-->');

																			Tooltip($$renderer, {
																				maxWidth: '210px',
																				placement: 'bottom',
																				disabled: !disableCreateDocument(),
																				children: ($$renderer) => {
																					$$renderer.push(`<div>`);

																					Button($$renderer, {
																						secondary: true,
																						event: 'create_document',
																						disabled: disableCreateDocument(),
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Create document`);
																						},

																						$$slots: {
																							default: true,
																							start: ($$renderer) => {
																								Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
																							}
																						}
																					});

																					$$renderer.push(`<!----></div>`);
																				},

																				$$slots: {
																					default: true,
																					tooltip: ($$renderer) => {
																						{
																							$$renderer.push(`${$.escape($.store_get($$store_subs ??= {}, '$isCollectionsJsonImportInProgress', isCollectionsJsonImportInProgress)
																								? 'This action is disabled during import'
																								: 'Save your current document before creating a new one')}`);
																						}
																					}
																				}
																			});

																			$$renderer.push(`<!----> `);

																			Tooltip($$renderer, {
																				placement: 'top',
																				children: ($$renderer) => {
																					Button($$renderer, {
																						icon: true,
																						size: 's',
																						secondary: true,
																						class: 'small-button-dimensions',
																						disabled: $.store_get($$store_subs ??= {}, '$isCollectionsJsonImportInProgress', isCollectionsJsonImportInProgress),
																						children: ($$renderer) => {
																							Icon($$renderer, { icon: IconUpload, size: 's' });
																						},
																						$$slots: { default: true }
																					});
																				},

																				$$slots: {
																					default: true,
																					tooltip: ($$renderer) => {
																						{
																							$$renderer.push(`Import JSON`);
																						}
																					}
																				}
																			});

																			$$renderer.push(`<!----> `);

																			Tooltip($$renderer, {
																				placement: 'top',
																				children: ($$renderer) => {
																					Button($$renderer, {
																						icon: true,
																						size: 's',
																						secondary: true,
																						class: 'small-button-dimensions',
																						disabled: !data.documents.total || $.store_get($$store_subs ??= {}, '$isCollectionsJsonImportInProgress', isCollectionsJsonImportInProgress),
																						children: ($$renderer) => {
																							Icon($$renderer, { icon: IconDownload, size: 's' });
																						},
																						$$slots: { default: true }
																					});
																				},

																				$$slots: {
																					default: true,
																					tooltip: ($$renderer) => {
																						{
																							$$renderer.push(`Export JSON`);
																						}
																					}
																				}
																			});

																			$$renderer.push(`<!----> `);

																			Button($$renderer, {
																				icon: true,
																				size: 's',
																				secondary: true,
																				class: 'small-button-dimensions',
																				children: ($$renderer) => {
																					Icon($$renderer, {
																						icon: !$.store_get($$store_subs ??= {}, '$expandTabs', expandTabs) ? IconChevronDown : IconChevronUp,
																						size: 's'
																					});
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!----> `);

																			Tooltip($$renderer, {
																				disabled: isRefreshing || !data.documents.total,
																				placement: 'top',
																				children: ($$renderer) => {
																					Button($$renderer, {
																						icon: true,
																						size: 's',
																						secondary: true,
																						disabled: isRefreshing || !data.documents.total,
																						class: 'small-button-dimensions',
																						children: ($$renderer) => {
																							$$renderer.push(`<div${$.attr_class('', void 0, { 'rotating': isRefreshing })}${$.attr_style('', { 'line-height': '0px' })}>`);
																							Icon($$renderer, { icon: IconRefresh, size: 's' });
																							$$renderer.push(`<!----></div>`);
																						},
																						$$slots: { default: true }
																					});
																				},

																				$$slots: {
																					default: true,
																					tooltip: ($$renderer) => {
																						{
																							$$renderer.push(`Refresh`);
																						}
																					}
																				}
																			});

																			$$renderer.push(`<!---->`);
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

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if ($.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport)) {
										$$renderer.push('<!--[0-->');

										Button($$renderer, {
											secondary: true,
											event: 'create_document',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Create document`);
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

				if (data.documents.total || $.store_get($$store_subs ??= {}, '$noSqlDocument', noSqlDocument).isDirty) {
					$$renderer.push('<!--[0-->');
					Divider($$renderer, {});
					$$renderer.push(`<!----> `);
					SpreadSheet($$renderer, { data });
					$$renderer.push(`<!---->`);
				} else if ($.store_get($$store_subs ??= {}, '$hasPageQueries', hasPageQueries)) {
					$$renderer.push('<!--[1-->');

					{
						function actions($$renderer) {
							Button($$renderer, {
								size: 's',
								secondary: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Clear filters`);
								},
								$$slots: { default: true }
							});
						}

						EmptySheet($$renderer, {
							mode: 'records-filtered',
							title: 'There are no documents that match your filters',
							actions,
							$$slots: { actions: true }
						});
					}
				} else {
					$$renderer.push('<!--[-1-->');

					{
						function actions($$renderer) {
							EmptySheetCards($$renderer, {
								icon: IconViewBoards,
								title: 'Generate sample data',
								subtitle: 'Generate data for testing',
								onClick: () => {
									$.store_mutate($$store_subs ??= {}, '$randomDataModalState', randomDataModalState, $.store_get($$store_subs ??= {}, '$randomDataModalState', randomDataModalState).show = true);
									$.store_mutate($$store_subs ??= {}, '$randomDataModalState', randomDataModalState, $.store_get($$store_subs ??= {}, '$randomDataModalState', randomDataModalState).columns = true);
									$.store_mutate($$store_subs ??= {}, '$randomDataModalState', randomDataModalState, $.store_get($$store_subs ??= {}, '$randomDataModalState', randomDataModalState).managed = false);
								}
							});

							$$renderer.push(`<!----> `);

							EmptySheetCards($$renderer, {
								icon: IconPlus,
								title: 'Create document',
								subtitle: 'Manually add documents',
								onClick: () => {
									noSqlDocument.create(buildInitDoc());
								}
							});

							$$renderer.push(`<!---->`);
						}

						EmptySheet($$renderer, {
							mode: 'records',
							type: databaseType(),
							showActions: $.store_get($$store_subs ??= {}, '$canWriteRows', canWriteRows),
							actions,
							$$slots: { actions: true }
						});
					}
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!----> `);

			if (showImportJson) {
				$$renderer.push('<!--[0-->');

				FilePicker($$renderer, {
					onSelect,
					showLocalFileBucket: true,
					localFileBucketTitle: 'Upload JSON file',
					mimeTypeQuery: 'application/json,.json',
					allowedExtension: 'json',
					gridImageDimensions: { imageHeight: 32, imageWidth: 32 },
					get show() {
						return showImportJson;
					},

					set show($$value) {
						showImportJson = $$value;
						$$settled = false;
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Dialog($$renderer, {
				title: 'Import options',
				get open() {
					return showImportOptions;
				},

				set open($$value) {
					showImportOptions = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							gap: 'l',
							children: ($$renderer) => {
								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										variant: 'm-400',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Choose how to handle documents that already exist in this collection.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Layout.Stack) {
									$$renderer.push('<!--[-->');

									Layout.Stack($$renderer, {
										gap: 'm',
										children: ($$renderer) => {
											if (Selector.Radio) {
												$$renderer.push('<!--[-->');

												Selector.Radio($$renderer, {
													size: 's',
													name: 'importOnDuplicate',
													value: OnDuplicate.Fail,
													label: 'Fail on duplicate (default)',
													get group() {
														return importOnDuplicate;
													},

													set group($$value) {
														importOnDuplicate = $$value;
														$$settled = false;
													},

													$$slots: {
														description: ($$renderer) => {
															{
																$$renderer.push(`Import aborts on the first document with a matching ID.`);
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

											if (Selector.Radio) {
												$$renderer.push('<!--[-->');

												Selector.Radio($$renderer, {
													size: 's',
													name: 'importOnDuplicate',
													value: OnDuplicate.Skip,
													label: 'Skip existing documents',
													get group() {
														return importOnDuplicate;
													},

													set group($$value) {
														importOnDuplicate = $$value;
														$$settled = false;
													},

													$$slots: {
														description: ($$renderer) => {
															{
																$$renderer.push(`Documents with matching IDs will be silently skipped.`);
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

											if (Selector.Radio) {
												$$renderer.push('<!--[-->');

												Selector.Radio($$renderer, {
													size: 's',
													name: 'importOnDuplicate',
													value: OnDuplicate.Overwrite,
													label: 'Overwrite existing documents',
													get group() {
														return importOnDuplicate;
													},

													set group($$value) {
														importOnDuplicate = $$value;
														$$settled = false;
													},

													$$slots: {
														description: ($$renderer) => {
															{
																$$renderer.push(`Documents with matching IDs will be updated with the imported data.`);
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

				$$slots: {
					default: true,
					footer: ($$renderer) => {
						{
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									direction: 'row',
									gap: 's',
									justifyContent: 'flex-end',
									children: ($$renderer) => {
										Button($$renderer, {
											text: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Cancel`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Start import`);
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

			$$renderer.push(`<!----> `);

			Modal($$renderer, {
				title: 'Custom columns',
				onSubmit: async () => {
					await columnDisplayNameInput?.updateDisplayNames();
				},

				get error() {
					return columnsError;
				},

				set error($$value) {
					columnsError = $$value;
					$$settled = false;
				},

				get show() {
					return showCustomColumnsModal;
				},

				set show($$value) {
					showCustomColumnsModal = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					ColumnDisplayNameInput($$renderer, {
						databaseType: data.database.type,
						collectionId: page.params.collection,
						onSuccess: () => {
							columnsError = null;
							showCustomColumnsModal = false;
							spreadsheet?.refreshColumns?.();
						},

						onFailure: (error) => {
							columnsError = error.message;
						}
					});
				},

				$$slots: {
					default: true,
					description: ($$renderer) => {
						{
							$$renderer.push(`Add up to 5 document fields to display as columns in the table view for easy identification.`);
						}
					},

					footer: ($$renderer) => {
						{
							Button($$renderer, {
								size: 's',
								secondary: true,
								children: ($$renderer) => {
									$$renderer.push(`<!---->Cancel`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								size: 's',
								submit: true,
								submissionLoader: true,
								disabled: columnDisplayNameInput?.hasChanged(),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Update`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
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
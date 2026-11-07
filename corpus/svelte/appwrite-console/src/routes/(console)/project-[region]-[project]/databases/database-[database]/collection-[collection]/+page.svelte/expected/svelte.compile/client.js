import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <div class="databases-spreadsheet"><!></div>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $isCollectionsJsonImportInProgress = () => $.store_get(isCollectionsJsonImportInProgress, '$isCollectionsJsonImportInProgress', $$stores);
	const $noSqlDocument = () => $.store_get(noSqlDocument, '$noSqlDocument', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const $expandTabs = () => $.store_get(expandTabs, '$expandTabs', $$stores);
	const $hasPageQueries = () => $.store_get(hasPageQueries, '$hasPageQueries', $$stores);
	const $canWriteRows = () => $.store_get(canWriteRows, '$canWriteRows', $$stores);
	const $randomDataModalState = () => $.store_get(randomDataModalState, '$randomDataModalState', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const binding_group = [];
	const filterColumns = writable([]);
	const databaseType = $.derived(() => toDatabaseType($$props.data.database.type));
	let isRefreshing = $.state(false);
	let showImportJson = $.state(false);
	let showImportOptions = $.state(false);
	let showCustomColumnsModal = $.state(false);
	let importOnDuplicate = $.state($.proxy(OnDuplicate.Fail));
	let pendingFile = $.state(null);
	let pendingLocalFile = $.state(false);
	let columnsError = $.state(null);
	let spreadsheet = $.state(null);
	let columnDisplayNameInput = $.state(null);
	const disableCreateDocument = $.derived(() => $isCollectionsJsonImportInProgress() || $noSqlDocument().isNew && ($noSqlDocument().hasDataChanged || $noSqlDocument().isDirty));

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
		$.set(pendingFile, file, true);
		$.set(pendingLocalFile, localFile, true);
		$.set(importOnDuplicate, OnDuplicate.Fail, true);
		$.set(showImportOptions, true);
	}

	async function startImport() {
		if (!$.get(pendingFile)) return;

		$.set(showImportOptions, false);
		$.store_set(isCollectionsJsonImportInProgress, true);

		try {
			await sdk.forProject(page.params.region, page.params.project).migrations.createJSONImport({
				bucketId: $.get(pendingFile).bucketId,
				fileId: $.get(pendingFile).$id,
				databaseId: page.params.database,
				collectionId: page.params.collection,
				internalFile: $.get(pendingLocalFile),
				onDuplicate: $.get(importOnDuplicate)
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
			$.set(pendingFile, null);
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

	$.user_effect(() => {
		filterColumns.set(createFilterableColumns());
	});

	var fragment = root_5();
	var node = $.first_child(fragment);

	$.key(node, () => page.params.collection, ($$anchor) => {
		var fragment_1 = root_3();
		var node_1 = $.first_child(fragment_1);

		Container(node_1, {
			expanded: true,
			expandHeightButton: true,
			style: 'background: var(--bgcolor-neutral-primary)',
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack) => {
					Layout_Stack($$anchor, {
						direction: 'column',
						gap: 'xl',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
								Layout_Stack_1($$anchor, {
									direction: 'row',
									justifyContent: 'space-between',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
											Layout_Stack_2($$anchor, {
												direction: 'row',
												gap: 's',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_1();
													var node_5 = $.first_child(fragment_5);

													Tooltip(node_5, {
														children: ($$anchor, $$slotProps) => {
															var div = root();
															var node_6 = $.child(div);

															{
																let $0 = $.derived(() => $$props.data.documents.total === 0);

																ViewSelector(node_6, {
																	onlyIcon: true,
																	ui: 'new',
																	hideView: true,
																	showAnyway: true,
																	isCustomTable: true,
																	get view() {
																		return $$props.data.view;
																	},

																	get columns() {
																		return collectionColumns;
																	},

																	get disableButton() {
																		return $.get($0);
																	},
																	onPreferencesUpdated: handleColumnToggle,
																	onCustomOptionClick: () => $.set(showCustomColumnsModal, true)
																});
															}

															$.reset(div);
															$.append($$anchor, div);
														},

														$$slots: {
															default: true,
															tooltip: ($$anchor, $$slotProps) => {
																var text = $.text('Columns');

																$.append($$anchor, text);
															}
														}
													});

													var node_7 = $.sibling(node_5, 2);

													Tooltip(node_7, {
														children: ($$anchor, $$slotProps) => {
															Filters($$anchor, {
																onlyIcon: true,
																get query() {
																	return $$props.data.query;
																},

																get columns() {
																	return filterColumns;
																},
																schema: false,
																analyticsSource: 'database_collections'
															});
														},

														$$slots: {
															default: true,
															tooltip: ($$anchor, $$slotProps) => {
																var text_1 = $.text('Filters');

																$.append($$anchor, text_1);
															}
														}
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_4, 2);

										{
											let $0 = $.derived(() => $isSmallViewport() ? '0' : '40px');

											$.component(node_8, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
												Layout_Stack_3($$anchor, {
													direction: 'row',
													alignItems: 'center',
													justifyContent: 'flex-end',
													get style() {
														return `padding-right: ${$.get($0) ?? ''};`;
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_7 = $.comment();
														var node_9 = $.first_child(fragment_7);

														$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
															Layout_Stack_4($$anchor, {
																gap: 's',
																direction: 'row',
																alignItems: 'center',
																justifyContent: 'flex-end',
																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = $.comment();
																	var node_10 = $.first_child(fragment_8);

																	{
																		var consequent = ($$anchor) => {
																			var fragment_9 = root_2();
																			var node_11 = $.first_child(fragment_9);

																			{
																				let $0 = $.derived(() => !$.get(disableCreateDocument));

																				Tooltip(node_11, {
																					maxWidth: '210px',
																					placement: 'bottom',
																					get disabled() {
																						return $.get($0);
																					},

																					children: ($$anchor, $$slotProps) => {
																						var div_1 = root();
																						var node_12 = $.child(div_1);

																						Button(node_12, {
																							secondary: true,
																							event: 'create_document',
																							get disabled() {
																								return $.get(disableCreateDocument);
																							},

																							$$events: {
																								click: () => {
																									if ($.get(disableCreateDocument)) return;

																									if (!$noSqlDocument().isNew) {
																										noSqlDocument.create(buildInitDoc());
																									}
																								}
																							},

																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_2 = $.text('Create document');

																								$.append($$anchor, text_2);
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

																						$.reset(div_1);
																						$.append($$anchor, div_1);
																					},

																					$$slots: {
																						default: true,
																						tooltip: ($$anchor, $$slotProps) => {
																							var text_3 = $.text();

																							$.template_effect(() => $.set_text(text_3, $isCollectionsJsonImportInProgress()
																								? 'This action is disabled during import'
																								: 'Save your current document before creating a new one'));

																							$.append($$anchor, text_3);
																						}
																					}
																				});
																			}

																			var node_13 = $.sibling(node_11, 2);

																			Tooltip(node_13, {
																				placement: 'top',
																				children: ($$anchor, $$slotProps) => {
																					Button($$anchor, {
																						icon: true,
																						size: 's',
																						secondary: true,
																						class: 'small-button-dimensions',
																						get disabled() {
																							return $isCollectionsJsonImportInProgress();
																						},
																						$$events: { click: () => $.set(showImportJson, true) },
																						children: ($$anchor, $$slotProps) => {
																							Icon($$anchor, {
																								get icon() {
																									return IconUpload;
																								},
																								size: 's'
																							});
																						},
																						$$slots: { default: true }
																					});
																				},

																				$$slots: {
																					default: true,
																					tooltip: ($$anchor, $$slotProps) => {
																						var text_4 = $.text('Import JSON');

																						$.append($$anchor, text_4);
																					}
																				}
																			});

																			var node_14 = $.sibling(node_13, 2);

																			Tooltip(node_14, {
																				placement: 'top',
																				children: ($$anchor, $$slotProps) => {
																					{
																						let $0 = $.derived(() => !$$props.data.documents.total || $isCollectionsJsonImportInProgress());

																						Button($$anchor, {
																							icon: true,
																							size: 's',
																							secondary: true,
																							class: 'small-button-dimensions',
																							get disabled() {
																								return $.get($0);
																							},

																							$$events: {
																								click: () => {
																									trackEvent(Click.DatabaseExportCsv);
																									goto(getExportUrl());
																								}
																							},

																							children: ($$anchor, $$slotProps) => {
																								Icon($$anchor, {
																									get icon() {
																										return IconDownload;
																									},
																									size: 's'
																								});
																							},
																							$$slots: { default: true }
																						});
																					}
																				},

																				$$slots: {
																					default: true,
																					tooltip: ($$anchor, $$slotProps) => {
																						var text_5 = $.text('Export JSON');

																						$.append($$anchor, text_5);
																					}
																				}
																			});

																			var node_15 = $.sibling(node_14, 2);

																			Button(node_15, {
																				icon: true,
																				size: 's',
																				secondary: true,
																				class: 'small-button-dimensions',
																				$$events: {
																					click: () => {
																						$.store_set(expandTabs, !$expandTabs());
																						preferences.setKey('entityHeaderExpanded', $expandTabs());
																					}
																				},

																				children: ($$anchor, $$slotProps) => {
																					{
																						let $0 = $.derived(() => !$expandTabs() ? IconChevronDown : IconChevronUp);

																						Icon($$anchor, {
																							get icon() {
																								return $.get($0);
																							},
																							size: 's'
																						});
																					}
																				},
																				$$slots: { default: true }
																			});

																			var node_16 = $.sibling(node_15, 2);

																			{
																				let $0 = $.derived(() => $.get(isRefreshing) || !$$props.data.documents.total);

																				Tooltip(node_16, {
																					get disabled() {
																						return $.get($0);
																					},
																					placement: 'top',
																					children: ($$anchor, $$slotProps) => {
																						{
																							let $0 = $.derived(() => $.get(isRefreshing) || !$$props.data.documents.total);

																							Button($$anchor, {
																								icon: true,
																								size: 's',
																								secondary: true,
																								get disabled() {
																									return $.get($0);
																								},
																								class: 'small-button-dimensions',
																								$$events: {
																									click: async () => {
																										$.set(isRefreshing, true);
																										await invalidate(Dependencies.COLLECTION);
																										$.set(isRefreshing, false /* too fast on local */);
																									}
																								},

																								children: ($$anchor, $$slotProps) => {
																									var div_2 = root();
																									let classes;

																									$.set_style(div_2, '', {}, { 'line-height': '0px' });

																									var node_17 = $.child(div_2);

																									Icon(node_17, {
																										get icon() {
																											return IconRefresh;
																										},
																										size: 's'
																									});

																									$.reset(div_2);
																									$.template_effect(() => classes = $.set_class(div_2, 1, '', null, classes, { rotating: $.get(isRefreshing) }));
																									$.append($$anchor, div_2);
																								},
																								$$slots: { default: true }
																							});
																						}
																					},

																					$$slots: {
																						default: true,
																						tooltip: ($$anchor, $$slotProps) => {
																							var text_6 = $.text('Refresh');

																							$.append($$anchor, text_6);
																						}
																					}
																				});
																			}

																			$.append($$anchor, fragment_9);
																		};

																		$.if(node_10, ($$render) => {
																			if (!$isSmallViewport()) $$render(consequent);
																		});
																	}

																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											});
										}

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_18 = $.sibling(node_3, 2);

							{
								var consequent_1 = ($$anchor) => {
									Button($$anchor, {
										secondary: true,
										event: 'create_document',
										$$events: {
											click: () => {
												if (!$noSqlDocument().isNew) {
													noSqlDocument.create(buildInitDoc());
												}
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('Create document');

											$.append($$anchor, text_7);
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

								$.if(node_18, ($$render) => {
									if ($isSmallViewport()) $$render(consequent_1);
								});
							}

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});

		var div_3 = $.sibling(node_1, 2);
		var node_19 = $.child(div_3);

		{
			var consequent_2 = ($$anchor) => {
				var fragment_20 = root_1();
				var node_20 = $.first_child(fragment_20);

				Divider(node_20, {});

				var node_21 = $.sibling(node_20, 2);

				$.bind_this(
					SpreadSheet(node_21, {
						get data() {
							return $$props.data;
						}
					}),
					($$value) => $.set(spreadsheet, $$value, true),
					() => $.get(spreadsheet)
				);

				$.append($$anchor, fragment_20);
			};

			var consequent_3 = ($$anchor) => {
				{
					const actions = ($$anchor) => {
						Button($$anchor, {
							size: 's',
							secondary: true,
							$$events: {
								click: () => {
									queries.clearAll();
									queries.apply();
									trackEvent(Submit.FilterClear, { source: 'database_collections' });
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_8 = $.text('Clear filters');

								$.append($$anchor, text_8);
							},
							$$slots: { default: true }
						});
					};

					EmptySheet($$anchor, {
						mode: 'records-filtered',
						title: 'There are no documents that match your filters',
						actions,
						$$slots: { actions: true }
					});
				}
			};

			var alternate = ($$anchor) => {
				{
					const actions = ($$anchor) => {
						var fragment_24 = root_1();
						var node_22 = $.first_child(fragment_24);

						EmptySheetCards(node_22, {
							get icon() {
								return IconViewBoards;
							},
							title: 'Generate sample data',
							subtitle: 'Generate data for testing',
							onClick: () => {
								$.store_mutate(randomDataModalState, $.untrack($randomDataModalState).show = true, $.untrack($randomDataModalState));
								$.store_mutate(randomDataModalState, $.untrack($randomDataModalState).columns = true, $.untrack($randomDataModalState));
								$.store_mutate(randomDataModalState, $.untrack($randomDataModalState).managed = false, $.untrack($randomDataModalState));
							}
						});

						var node_23 = $.sibling(node_22, 2);

						EmptySheetCards(node_23, {
							get icon() {
								return IconPlus;
							},
							title: 'Create document',
							subtitle: 'Manually add documents',
							onClick: () => {
								noSqlDocument.create(buildInitDoc());
							}
						});

						$.append($$anchor, fragment_24);
					};

					EmptySheet($$anchor, {
						mode: 'records',
						get type() {
							return $.get(databaseType);
						},

						get showActions() {
							return $canWriteRows();
						},
						actions,
						$$slots: { actions: true }
					});
				}
			};

			$.if(node_19, ($$render) => {
				if ($$props.data.documents.total || $noSqlDocument().isDirty) $$render(consequent_2); else if ($hasPageQueries()) $$render(consequent_3, 1); else $$render(alternate, -1);
			});
		}

		$.reset(div_3);
		$.append($$anchor, fragment_1);
	});

	var node_24 = $.sibling(node, 2);

	{
		var consequent_4 = ($$anchor) => {
			FilePicker($$anchor, {
				onSelect,
				showLocalFileBucket: true,
				localFileBucketTitle: 'Upload JSON file',
				mimeTypeQuery: 'application/json,.json',
				allowedExtension: 'json',
				gridImageDimensions: { imageHeight: 32, imageWidth: 32 },
				get show() {
					return $.get(showImportJson);
				},

				set show($$value) {
					$.set(showImportJson, $$value, true);
				}
			});
		};

		$.if(node_24, ($$render) => {
			if ($.get(showImportJson)) $$render(consequent_4);
		});
	}

	var node_25 = $.sibling(node_24, 2);

	Dialog(node_25, {
		title: 'Import options',
		get open() {
			return $.get(showImportOptions);
		},

		set open($$value) {
			$.set(showImportOptions, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_26 = $.comment();
			var node_26 = $.first_child(fragment_26);

			$.component(node_26, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
				Layout_Stack_5($$anchor, {
					gap: 'l',
					children: ($$anchor, $$slotProps) => {
						var fragment_27 = root_1();
						var node_27 = $.first_child(fragment_27);

						$.component(node_27, () => Typography.Text, ($$anchor, Typography_Text) => {
							Typography_Text($$anchor, {
								variant: 'm-400',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('Choose how to handle documents that already exist in this collection.');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});
						});

						var node_28 = $.sibling(node_27, 2);

						$.component(node_28, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
							Layout_Stack_6($$anchor, {
								gap: 'm',
								children: ($$anchor, $$slotProps) => {
									var fragment_28 = root_4();
									var node_29 = $.first_child(fragment_28);

									$.component(node_29, () => Selector.Radio, ($$anchor, Selector_Radio) => {
										Selector_Radio($$anchor, {
											size: 's',
											name: 'importOnDuplicate',
											get value() {
												return OnDuplicate.Fail;
											},
											label: 'Fail on duplicate (default)',
											get group() {
												return $.get(importOnDuplicate);
											},

											set group($$value) {
												$.set(importOnDuplicate, $$value, true);
											},

											$$slots: {
												description: ($$anchor, $$slotProps) => {
													var text_10 = $.text('Import aborts on the first document with a matching ID.');

													$.append($$anchor, text_10);
												}
											}
										});
									});

									var node_30 = $.sibling(node_29, 2);

									$.component(node_30, () => Selector.Radio, ($$anchor, Selector_Radio_1) => {
										Selector_Radio_1($$anchor, {
											size: 's',
											name: 'importOnDuplicate',
											get value() {
												return OnDuplicate.Skip;
											},
											label: 'Skip existing documents',
											get group() {
												return $.get(importOnDuplicate);
											},

											set group($$value) {
												$.set(importOnDuplicate, $$value, true);
											},

											$$slots: {
												description: ($$anchor, $$slotProps) => {
													var text_11 = $.text('Documents with matching IDs will be silently skipped.');

													$.append($$anchor, text_11);
												}
											}
										});
									});

									var node_31 = $.sibling(node_30, 2);

									$.component(node_31, () => Selector.Radio, ($$anchor, Selector_Radio_2) => {
										Selector_Radio_2($$anchor, {
											size: 's',
											name: 'importOnDuplicate',
											get value() {
												return OnDuplicate.Overwrite;
											},
											label: 'Overwrite existing documents',
											get group() {
												return $.get(importOnDuplicate);
											},

											set group($$value) {
												$.set(importOnDuplicate, $$value, true);
											},

											$$slots: {
												description: ($$anchor, $$slotProps) => {
													var text_12 = $.text('Documents with matching IDs will be updated with the imported data.');

													$.append($$anchor, text_12);
												}
											}
										});
									});

									$.append($$anchor, fragment_28);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_27);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_26);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_29 = $.comment();
				var node_32 = $.first_child(fragment_29);

				$.component(node_32, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
					Layout_Stack_7($$anchor, {
						direction: 'row',
						gap: 's',
						justifyContent: 'flex-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_30 = root_1();
							var node_33 = $.first_child(fragment_30);

							Button(node_33, {
								text: true,
								$$events: { click: () => $.set(showImportOptions, false) },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('Cancel');

									$.append($$anchor, text_13);
								},
								$$slots: { default: true }
							});

							var node_34 = $.sibling(node_33, 2);

							Button(node_34, {
								$$events: { click: startImport },
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_14 = $.text('Start import');

									$.append($$anchor, text_14);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_30);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_29);
			}
		}
	});

	var node_35 = $.sibling(node_25, 2);

	Modal(node_35, {
		title: 'Custom columns',
		onSubmit: async () => {
			await $.get(columnDisplayNameInput)?.updateDisplayNames();
		},

		get error() {
			return $.get(columnsError);
		},

		set error($$value) {
			$.set(columnsError, $$value, true);
		},

		get show() {
			return $.get(showCustomColumnsModal);
		},

		set show($$value) {
			$.set(showCustomColumnsModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			$.bind_this(
				ColumnDisplayNameInput($$anchor, {
					get databaseType() {
						return $$props.data.database.type;
					},

					get collectionId() {
						return page.params.collection;
					},

					onSuccess: () => {
						$.set(columnsError, null);
						$.set(showCustomColumnsModal, false);
						$.get(spreadsheet)?.refreshColumns?.();
					},

					onFailure: (error) => {
						$.set(columnsError, error.message, true);
					}
				}),
				($$value) => $.set(columnDisplayNameInput, $$value, true),
				() => $.get(columnDisplayNameInput)
			);
		},

		$$slots: {
			default: true,
			description: ($$anchor, $$slotProps) => {
				var text_15 = $.text('Add up to 5 document fields to display as columns in the table view for easy identification.');

				$.append($$anchor, text_15);
			},

			footer: ($$anchor, $$slotProps) => {
				var fragment_32 = root_1();
				var node_36 = $.first_child(fragment_32);

				Button(node_36, {
					size: 's',
					secondary: true,
					$$events: { click: () => $.set(showCustomColumnsModal, false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_16 = $.text('Cancel');

						$.append($$anchor, text_16);
					},
					$$slots: { default: true }
				});

				var node_37 = $.sibling(node_36, 2);

				{
					let $0 = $.derived(() => $.get(columnDisplayNameInput)?.hasChanged());

					Button(node_37, {
						size: 's',
						submit: true,
						submissionLoader: true,
						get disabled() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('Update');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});
				}

				$.append($$anchor, fragment_32);
			}
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
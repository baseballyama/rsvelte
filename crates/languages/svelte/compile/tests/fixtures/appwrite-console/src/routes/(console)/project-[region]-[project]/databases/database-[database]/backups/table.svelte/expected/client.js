import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Card, Confirm, Modal, MultiSelectionTable } from '$lib/components';
import { Button, InputCheckbox, InputText } from '$lib/elements/forms';
import RestoreModal from './restoreModal.svelte';
import { timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
import { sdk } from '$lib/stores/sdk';
import { addNotification } from '$lib/stores/notifications';
import { invalidate } from '$app/navigation';
import { calculateSize } from '$lib/helpers/sizeConvertion';
import { BackupServices, ID } from '@appwrite.io/console';
import { columns } from './store';
import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { copy } from '$lib/helpers/copy';
import { LabelCard } from '$lib/components/index.js';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { Dependencies } from '$lib/constants';

import {
	ActionMenu,
	Icon,
	Layout,
	Popover,
	Status,
	Table,
	Tag,
	Tooltip,
	Typography
} from '@appwrite.io/pink-svelte';

import {
	IconDotsHorizontal,
	IconDuplicate,
	IconPencil,
	IconRefresh,
	IconTrash
} from '@appwrite.io/pink-icons-svelte';

import { capitalize } from '$lib/helpers/string';
import Ellipse from './components/Ellipse.svelte';
import { page } from '$app/state';

var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<span slot="tooltip"> </span>`);
var root_3 = $.from_html(`<div class="u-flex u-cross-baseline"><!></div>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<div class="action-cell u-flex u-main-end u-width-full-line"><!></div>`);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`Are you sure you want to delete the <b> </b> backup?`, 1);
var root_8 = $.from_html(`<!> <!>`, 1);
var root_9 = $.from_html(`<!> Completed <!> <!> `, 1);
var root_10 = $.from_html(`<p class="u-color-text-offline u-small"> </p>`);
var root_11 = $.from_html(`<div class="u-flex u-flex-vertical u-gap-4 u-width-full-line"><h4 class="body-text-2 u-bold"> </h4></div>`);
var root_12 = $.from_html(`<div class="u-width-full-line"><!></div>`);
var root_13 = $.from_html(`<!> Database ID`, 1);

export default function Table_1($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get(columns, '$columns', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const binding_group = [];
	const database = $.derived(() => $$props.data.database);
	let showDelete = $.state(false);
	let selectedBackup = $.state(null);
	let showDropdown = $.proxy([]);
	let showRestore = $.state(false);
	let showCustomId = $.state(false);
	let newDatabaseInfo = $.state($.proxy({ name: null, id: null }));
	let confirmSameDbRestore = $.state(false);
	let selectedRestoreOption = $.state('new');

	const restoreOptions = [
		{
			id: 'new',
			title: 'Restore in new database',
			description: 'Duplicate the database from the selected backup version to a new.'
		},

		{
			id: 'same',
			title: 'Restore in current database',
			description: 'Overwrite the current database with the selected backup version.'
		}
	];

	function getPolicyDetails(policyId) {
		return $$props.data.policies.policies.find((policy) => policy.$id === policyId);
	}

	function getCleanBackupName(backup) {
		return toLocaleDateTime(backup.$createdAt).replaceAll(',', '');
	}

	function getBackupStatus(backup) {
		switch (backup.status) {
			case 'pending':
				return 'pending';

			case 'completed':
				return 'complete';

			case 'uploading':

			case 'downloading':
				return 'processing';

			case 'failed':
				return 'failed';

			// pink-svelte's Status union has no 'skipped' — fall back to the
			// neutral 'waiting' visual and override the label below.
			case 'skipped':
				return 'waiting';

			default:
				return 'waiting';
		}
	}

	function getBackupStatusLabel(backup) {
		if (backup.status === 'skipped') {
			return 'Skipped';
		}

		return capitalize(getBackupStatus(backup));
	}

	async function deleteSingleBackup(archiveId) {
		try {
			await sdk.forProject(page.params.region, page.params.project).backups.deleteArchive({ archiveId });
			addNotification({ type: 'success', message: 'Backup deleted' });
			$.set(showDelete, false);
			$.set(selectedBackup, null);
			await invalidate(Dependencies.BACKUPS);
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
		}
	}

	async function deleteBackups(batchDelete) {
		const result = await batchDelete((archiveId) => sdk.forProject(page.params.region, page.params.project).backups.deleteArchive({ archiveId }));

		try {
			if (result.error) {
				trackError(result.error, Submit.DatabaseBackupDelete);
			} else {
				trackEvent(Submit.DatabaseBackupDelete);
			}
		} finally {
			await invalidate(Dependencies.BACKUPS);
		}

		return result;
	}

	async function restoreBackup() {
		if ($.get(selectedRestoreOption) === 'same') {
			$.get(newDatabaseInfo).id = $.get(database).$id;
			$.get(newDatabaseInfo).name = $.get(database).name;
		}

		try {
			await sdk.forProject(page.params.region, page.params.project).backups.createRestoration({
				archiveId: $.get(selectedBackup).$id,
				services: [BackupServices.Databases],
				newResourceId: $.get(newDatabaseInfo).id ?? ID.unique(),
				newResourceName: $.get(newDatabaseInfo).name
			});

			await invalidate(Dependencies.BACKUPS);
			addNotification({ type: 'success', message: 'Database restore initiated' });
			trackEvent('backup_restore_submit', { newDatabaseName: $.get(newDatabaseInfo).name });
		} catch(error) {
			addNotification({ type: 'error', message: error.message });
		} finally {
			$.set(showRestore, false);
		}
	}

	const disableRestoreButton = $.derived(() => {
		return $.get(selectedRestoreOption) === 'new' && (!$.get(newDatabaseInfo).name || $.get(database).$id === $.get(newDatabaseInfo).id) || $.get(selectedRestoreOption) === 'same' && !$.get(confirmSameDbRestore);
	});

	$.user_effect(() => {
		if (!$.get(showRestore) && !$.get(showDelete)) {
			$.set(showCustomId, false);
			$.set(selectedBackup, null);
			$.set(confirmSameDbRestore, false);
			$.set(selectedRestoreOption, 'new');
			$.set(newDatabaseInfo, { name: null, id: null }, true);
		}
	});

	var fragment = root_4();
	var node = $.first_child(fragment);

	{
		const header = ($$anchor, root = $.noop) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 1, $columns, $.index, ($$anchor, column) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
					Table_Header_Cell($$anchor, {
						get column() {
							return $.get(column).id;
						},

						get root() {
							return root();
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(column).title));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		const children = ($$anchor, root = $.noop) => {
			var fragment_4 = $.comment();
			var node_3 = $.first_child(fragment_4);

			$.each(node_3, 17, () => $$props.data.backups.archives, $.index, ($$anchor, backup, index) => {
				const policy = $.derived(() => getPolicyDetails($.get(backup).policyId));
				const retainedUntil = $.derived(() => new Date(new Date($.get(policy)?.$createdAt).getTime() + $.get(policy)?.retention * 24 * 60 * 60 * 1000));
				const formattedRetainedUntil = $.derived(() => `${$.get(retainedUntil).getDate()} ${$.get(retainedUntil).toLocaleString('en-US', { month: 'short' })}, ${$.get(retainedUntil).getFullYear()} ${$.get(retainedUntil).toLocaleTimeString('en-US', { hour12: false })}`);
				var fragment_5 = $.comment();
				var node_4 = $.first_child(fragment_5);

				$.component(node_4, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
					Table_Row_Base($$anchor, {
						get id() {
							return $.get(backup).$id;
						},

						get root() {
							return root();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root_6();
							var node_5 = $.first_child(fragment_6);

							$.component(node_5, () => Table.Cell, ($$anchor, Table_Cell) => {
								Table_Cell($$anchor, {
									column: 'backups',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										DualTimeView($$anchor, {
											get time() {
												return $.get(backup).$createdAt;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(($0) => $.set_text(text_1, $0), [() => getCleanBackupName($.get(backup))]);
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Table.Cell, ($$anchor, Table_Cell_1) => {
								Table_Cell_1($$anchor, {
									column: 'size',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_9 = $.comment();
										var node_7 = $.first_child(fragment_9);

										{
											var consequent = ($$anchor) => {
												var text_2 = $.text();

												$.template_effect(($0) => $.set_text(text_2, $0), [() => calculateSize($.get(backup).size)]);
												$.append($$anchor, text_2);
											};

											var alternate = ($$anchor) => {
												var text_3 = $.text('-');

												$.append($$anchor, text_3);
											};

											$.if(node_7, ($$render) => {
												if ($.get(backup).status === 'completed') $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_6, 2);

							$.component(node_8, () => Table.Cell, ($$anchor, Table_Cell_2) => {
								Table_Cell_2($$anchor, {
									column: 'status',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										const backupStatus = $.derived(() => getBackupStatus($.get(backup)));

										{
											let $0 = $.derived(() => getBackupStatusLabel($.get(backup)));

											Status($$anchor, {
												get status() {
													return $.get(backupStatus);
												},

												get label() {
													return $.get($0);
												}
											});
										}
									},
									$$slots: { default: true }
								});
							});

							var node_9 = $.sibling(node_8, 2);

							$.component(node_9, () => Table.Cell, ($$anchor, Table_Cell_3) => {
								Table_Cell_3($$anchor, {
									column: 'policy',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										var div = root_3();
										var node_10 = $.child(div);

										Tooltip(node_10, {
											maxWidth: 'fit-content',
											children: ($$anchor, $$slotProps) => {
												var span = root_1();
												var text_4 = $.only_child(span, true);

												$.template_effect(() => $.set_text(text_4, $.get(policy)?.name || 'Manual'));
												$.append($$anchor, span);
											},

											$$slots: {
												default: true,
												tooltip: ($$anchor, $$slotProps) => {
													var span_1 = root_2();
													var text_5 = $.only_child(span_1, true);

													$.template_effect(() => $.set_text(text_5, $.get(policy)
														? `Retained until: ${$.get(formattedRetainedUntil)}`
														: `Retained forever`));

													$.append($$anchor, span_1);
												}
											}
										});

										$.reset(div);
										$.append($$anchor, div);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_9, 2);

							$.component(node_11, () => Table.Cell, ($$anchor, Table_Cell_4) => {
								Table_Cell_4($$anchor, {
									column: 'actions',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										var div_1 = root_5();
										var node_12 = $.child(div_1);

										Popover(node_12, {
											padding: 'm',
											placement: 'bottom-end',
											children: $.invalid_default_snippet,
											$$slots: {
												default: ($$anchor, $$slotProps) => {
													const toggle = $.derived(() => $$slotProps.toggle);

													Button($$anchor, {
														extraCompact: true,
														$$events: {
															click: function (...$$args) {
																$.get(toggle)?.apply(this, $$args);
															}
														},

														children: ($$anchor, $$slotProps) => {
															Icon($$anchor, {
																get icon() {
																	return IconDotsHorizontal;
																}
															});
														},
														$$slots: { default: true }
													});
												},

												tooltip: ($$anchor, $$slotProps) => {
													const toggle = $.derived(() => $$slotProps.toggle);
													var fragment_14 = $.comment();
													var node_13 = $.first_child(fragment_14);

													$.component(node_13, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
														ActionMenu_Root($$anchor, {
															width: '180px',
															noPadding: true,
															children: ($$anchor, $$slotProps) => {
																var fragment_15 = root_4();
																var node_14 = $.first_child(fragment_15);

																{
																	var consequent_1 = ($$anchor) => {
																		var fragment_16 = $.comment();
																		var node_15 = $.first_child(fragment_16);

																		$.component(node_15, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
																			ActionMenu_Item_Button($$anchor, {
																				get trailingIcon() {
																					return IconRefresh;
																				},

																				$$events: {
																					click: (e) => {
																						$.get(toggle)(e);
																						$.set(showRestore, true);
																						$.set(selectedBackup, $.get(backup), true);
																						showDropdown[index] = false;
																						trackEvent(Click.BackupRestoreClick);
																					}
																				},

																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_6 = $.text('Restore');

																					$.append($$anchor, text_6);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_16);
																	};

																	$.if(node_14, ($$render) => {
																		if ($.get(backup).status === 'completed') $$render(consequent_1);
																	});
																}

																var node_16 = $.sibling(node_14, 2);

																$.component(node_16, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_1) => {
																	ActionMenu_Item_Button_1($$anchor, {
																		get trailingIcon() {
																			return IconDuplicate;
																		},

																		$$events: {
																			click: (e) => {
																				$.get(toggle)(e);
																				copy($.get(backup).$id);
																				showDropdown[index] = false;
																				trackEvent(Click.BackupCopyIdClick);
																			}
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_7 = $.text('Copy ID');

																			$.append($$anchor, text_7);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_17 = $.sibling(node_16, 2);

																$.component(node_17, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button_2) => {
																	ActionMenu_Item_Button_2($$anchor, {
																		status: 'danger',
																		get trailingIcon() {
																			return IconTrash;
																		},

																		$$events: {
																			click: (e) => {
																				$.get(toggle)(e);
																				$.set(showDelete, true);
																				$.set(selectedBackup, $.get(backup), true);
																				showDropdown[index] = false;
																				trackEvent(Click.BackupDeleteClick);
																			}
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_8 = $.text('Delete');

																			$.append($$anchor, text_8);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_15);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_14);
												}
											}
										});

										$.reset(div_1);
										$.append($$anchor, div_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			});

			$.append($$anchor, fragment_4);
		};

		MultiSelectionTable(node, {
			resource: 'backup',
			get columns() {
				return $columns();
			},
			onDelete: deleteBackups,
			get computeKey() {
				return $$props.data.backups.archives.length;
			},
			header,
			children,
			$$slots: { header: true, default: true }
		});
	}

	var node_18 = $.sibling(node, 2);

	Confirm(node_18, {
		title: 'Delete backup',
		onSubmit: async () => {
			if (!$.get(selectedBackup)) return;

			await deleteSingleBackup($.get(selectedBackup).$id);
		},

		get open() {
			return $.get(showDelete);
		},

		set open($$value) {
			$.set(showDelete, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_17 = root_8();
			var node_19 = $.first_child(fragment_17);

			$.component(node_19, () => Typography.Text, ($$anchor, Typography_Text) => {
				Typography_Text($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var fragment_18 = root_7();
						var b = $.sibling($.first_child(fragment_18));
						var text_9 = $.only_child(b, true);

						$.next();
						$.template_effect(($0) => $.set_text(text_9, $0), [() => getCleanBackupName($.get(selectedBackup))]);
						$.append($$anchor, fragment_18);
					},
					$$slots: { default: true }
				});
			});

			var node_20 = $.sibling(node_19, 2);

			$.component(node_20, () => Typography.Text, ($$anchor, Typography_Text_1) => {
				Typography_Text_1($$anchor, {
					variant: 'm-500',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text('This action is irreversible.');

						$.append($$anchor, text_10);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_17);
		},
		$$slots: { default: true }
	});

	var node_21 = $.sibling(node_18, 2);

	Modal(node_21, {
		title: 'Restore backup',
		onSubmit: restoreBackup,
		get show() {
			return $.get(showRestore);
		},

		set show($$value) {
			$.set(showRestore, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_19 = root_4();
			var node_22 = $.first_child(fragment_19);

			Card(node_22, {
				radius: 'm',
				padding: 's',
				children: ($$anchor, $$slotProps) => {
					var fragment_20 = $.comment();
					var node_23 = $.first_child(fragment_20);

					$.component(node_23, () => Layout.Stack, ($$anchor, Layout_Stack) => {
						Layout_Stack($$anchor, {
							gap: 'xxs',
							children: ($$anchor, $$slotProps) => {
								var fragment_21 = root_8();
								var node_24 = $.first_child(fragment_21);

								$.component(node_24, () => Typography.Text, ($$anchor, Typography_Text_2) => {
									Typography_Text_2($$anchor, {
										variant: 'm-500',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_11 = $.text();

											$.template_effect(($0) => $.set_text(text_11, $0), [() => getCleanBackupName($.get(selectedBackup))]);
											$.append($$anchor, text_11);
										},
										$$slots: { default: true }
									});
								});

								var node_25 = $.sibling(node_24, 2);

								$.component(node_25, () => Typography.Caption, ($$anchor, Typography_Caption) => {
									Typography_Caption($$anchor, {
										variant: '500',
										children: ($$anchor, $$slotProps) => {
											var fragment_23 = $.comment();
											var node_26 = $.first_child(fragment_23);

											$.component(node_26, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
												Layout_Stack_1($$anchor, {
													direction: 'row',
													gap: 'xs',
													children: ($$anchor, $$slotProps) => {
														var fragment_24 = root_9();
														var node_27 = $.first_child(fragment_24);

														Ellipse(node_27, { color: 'var(--bgcolor-success)' });

														var node_28 = $.sibling(node_27, 2);

														Ellipse(node_28, { size: 's' });

														var text_12 = $.sibling(node_28);
														var node_29 = $.sibling(text_12);

														Ellipse(node_29, { size: 's' });

														var text_13 = $.sibling(node_29);

														$.template_effect(
															($0, $1) => {
																$.set_text(text_12, ` ${$0 ?? ''} `);
																$.set_text(text_13, ` ${$1 ?? ''}`);
															},
															[
																() => calculateSize($.get(selectedBackup).size),
																() => timeFromNow($.get(selectedBackup).$createdAt)
															]
														);

														$.append($$anchor, fragment_24);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_23);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_21);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_20);
				},
				$$slots: { default: true }
			});

			var node_30 = $.sibling(node_22, 2);

			$.component(node_30, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
				Layout_Stack_2($$anchor, {
					direction: 'row',
					gap: 'l',
					children: ($$anchor, $$slotProps) => {
						var fragment_25 = $.comment();
						var node_31 = $.first_child(fragment_25);

						$.each(node_31, 17, () => restoreOptions, $.index, ($$anchor, restoreOption) => {
							var div_2 = root_12();
							var node_32 = $.child(div_2);

							LabelCard(node_32, {
								padding: 's',
								get value() {
									return $.get(restoreOption).id;
								},

								get group() {
									return $.get(selectedRestoreOption);
								},

								set group($$value) {
									$.set(selectedRestoreOption, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var p = root_10();
									var text_14 = $.only_child(p, true);

									$.template_effect(() => $.set_text(text_14, $.get(restoreOption).description));
									$.append($$anchor, p);
								},

								$$slots: {
									default: true,
									title: ($$anchor, $$slotProps) => {
										var div_3 = root_11();
										var h4 = $.child(div_3);
										var text_15 = $.only_child(h4, true);

										$.reset(div_3);
										$.template_effect(() => $.set_text(text_15, $.get(restoreOption).title));
										$.append($$anchor, div_3);
									}
								}
							});

							$.reset(div_2);
							$.append($$anchor, div_2);
						});

						$.append($$anchor, fragment_25);
					},
					$$slots: { default: true }
				});
			});

			var node_33 = $.sibling(node_30, 2);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_26 = $.comment();
					var node_34 = $.first_child(fragment_26);

					$.component(node_34, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
						Layout_Stack_3($$anchor, {
							gap: 's',
							alignItems: 'flex-start',
							children: ($$anchor, $$slotProps) => {
								var fragment_27 = root_8();
								var node_35 = $.first_child(fragment_27);

								InputText(node_35, {
									id: 'name',
									label: 'Database name',
									placeholder: 'Enter database name',
									autofocus: true,
									required: true,
									get value() {
										return $.get(newDatabaseInfo).name;
									},

									set value($$value) {
										$.get(newDatabaseInfo).name = $$value;
									}
								});

								var node_36 = $.sibling(node_35, 2);

								{
									var consequent_2 = ($$anchor) => {
										Tag($$anchor, {
											size: 's',
											$$events: {
												click: () => {
													$.set(showCustomId, true);
												}
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_29 = root_13();
												var node_37 = $.first_child(fragment_29);

												Icon(node_37, {
													get icon() {
														return IconPencil;
													}
												});

												$.next();
												$.append($$anchor, fragment_29);
											},
											$$slots: { default: true }
										});
									};

									var alternate_1 = ($$anchor) => {
										RestoreModal($$anchor, {
											autofocus: false,
											name: 'Database',
											get databaseId() {
												return $.get(database).$id;
											},

											get show() {
												return $.get(showCustomId);
											},

											set show($$value) {
												$.set(showCustomId, $$value, true);
											},

											get id() {
												return $.get(newDatabaseInfo).id;
											},

											set id($$value) {
												$.get(newDatabaseInfo).id = $$value;
											}
										});
									};

									$.if(node_36, ($$render) => {
										if (!$.get(showCustomId)) $$render(consequent_2); else $$render(alternate_1, -1);
									});
								}

								$.append($$anchor, fragment_27);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_26);
				};

				var alternate_2 = ($$anchor) => {
					InputCheckbox($$anchor, {
						required: true,
						size: 's',
						id: 'delete_policy',
						get label() {
							return `Overwrite '${$.get(database).name ?? ''}' with the selected backup version`;
						},

						get checked() {
							return $.get(confirmSameDbRestore);
						},

						set checked($$value) {
							$.set(confirmSameDbRestore, $$value, true);
						}
					});
				};

				$.if(node_33, ($$render) => {
					if ($.get(selectedRestoreOption) === 'new') $$render(consequent_3); else $$render(alternate_2, -1);
				});
			}

			$.append($$anchor, fragment_19);
		},

		$$slots: {
			default: true,
			footer: ($$anchor, $$slotProps) => {
				var fragment_32 = root_8();
				var node_38 = $.first_child(fragment_32);

				Button(node_38, {
					text: true,
					$$events: { click: () => $.set(showRestore, false) },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_16 = $.text('Cancel');

						$.append($$anchor, text_16);
					},
					$$slots: { default: true }
				});

				var node_39 = $.sibling(node_38, 2);

				Button(node_39, {
					submit: true,
					get disabled() {
						return $.get(disableRestoreButton);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_17 = $.text('Restore');

						$.append($$anchor, text_17);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_32);
			}
		}
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
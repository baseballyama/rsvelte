import * as $ from 'svelte/internal/server';
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

export default function Table_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
		const database = $.derived(() => data.database);
		let showDelete = false;
		let selectedBackup = null;
		let showDropdown = [];
		let showRestore = false;
		let showCustomId = false;
		let newDatabaseInfo = { name: null, id: null };
		let confirmSameDbRestore = false;
		let selectedRestoreOption = 'new';

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
			return data.policies.policies.find((policy) => policy.$id === policyId);
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
				showDelete = false;
				selectedBackup = null;
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
			if (selectedRestoreOption === 'same') {
				newDatabaseInfo.id = database().$id;
				newDatabaseInfo.name = database().name;
			}

			try {
				await sdk.forProject(page.params.region, page.params.project).backups.createRestoration({
					archiveId: selectedBackup.$id,
					services: [BackupServices.Databases],
					newResourceId: newDatabaseInfo.id ?? ID.unique(),
					newResourceName: newDatabaseInfo.name
				});

				await invalidate(Dependencies.BACKUPS);
				addNotification({ type: 'success', message: 'Database restore initiated' });
				trackEvent('backup_restore_submit', { newDatabaseName: newDatabaseInfo.name });
			} catch(error) {
				addNotification({ type: 'error', message: error.message });
			} finally {
				showRestore = false;
			}
		}

		const disableRestoreButton = $.derived(() => {
			return selectedRestoreOption === 'new' && (!newDatabaseInfo.name || database().$id === newDatabaseInfo.id) || selectedRestoreOption === 'same' && !confirmSameDbRestore;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function header($$renderer, root) {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like($.store_get($$store_subs ??= {}, '$columns', columns));

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let column = each_array[$$index];

						if (Table.Header.Cell) {
							$$renderer.push('<!--[-->');

							Table.Header.Cell($$renderer, {
								column: column.id,
								root,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(column.title)}`);
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
				}

				function children($$renderer, root) {
					$$renderer.push(`<!--[-->`);

					const each_array_1 = $.ensure_array_like(data.backups.archives);

					for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
						let backup = each_array_1[index];
						const policy = getPolicyDetails(backup.policyId);
						const retainedUntil = new Date(new Date(policy?.$createdAt).getTime() + policy?.retention * 24 * 60 * 60 * 1000);
						const formattedRetainedUntil = `${retainedUntil.getDate()} ${retainedUntil.toLocaleString('en-US', { month: 'short' })}, ${retainedUntil.getFullYear()} ${retainedUntil.toLocaleTimeString('en-US', { hour12: false })}`;

						if (Table.Row.Base) {
							$$renderer.push('<!--[-->');

							Table.Row.Base($$renderer, {
								id: backup.$id,
								root,
								children: ($$renderer) => {
									if (Table.Cell) {
										$$renderer.push('<!--[-->');

										Table.Cell($$renderer, {
											column: 'backups',
											root,
											children: ($$renderer) => {
												DualTimeView($$renderer, {
													time: backup.$createdAt,
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(getCleanBackupName(backup))}`);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Table.Cell) {
										$$renderer.push('<!--[-->');

										Table.Cell($$renderer, {
											column: 'size',
											root,
											children: ($$renderer) => {
												if (backup.status === 'completed') {
													$$renderer.push(`<!--[0-->${$.escape(calculateSize(backup.size))}`);
												} else {
													$$renderer.push(`<!--[-1-->-`);
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

									if (Table.Cell) {
										$$renderer.push('<!--[-->');

										Table.Cell($$renderer, {
											column: 'status',
											root,
											children: ($$renderer) => {
												const backupStatus = getBackupStatus(backup);

												Status($$renderer, { status: backupStatus, label: getBackupStatusLabel(backup) });
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Table.Cell) {
										$$renderer.push('<!--[-->');

										Table.Cell($$renderer, {
											column: 'policy',
											root,
											children: ($$renderer) => {
												$$renderer.push(`<div class="u-flex u-cross-baseline">`);

												Tooltip($$renderer, {
													maxWidth: 'fit-content',
													children: ($$renderer) => {
														$$renderer.push(`<span>${$.escape(policy?.name || 'Manual')}</span>`);
													},

													$$slots: {
														default: true,
														tooltip: ($$renderer) => {
															$$renderer.push(`<span slot="tooltip">${$.escape(policy
																? `Retained until: ${formattedRetainedUntil}`
																: `Retained forever`)}</span>`);
														}
													}
												});

												$$renderer.push(`<!----></div>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Table.Cell) {
										$$renderer.push('<!--[-->');

										Table.Cell($$renderer, {
											column: 'actions',
											root,
											children: ($$renderer) => {
												$$renderer.push(`<div class="action-cell u-flex u-main-end u-width-full-line">`);

												Popover($$renderer, {
													padding: 'm',
													placement: 'bottom-end',
													children: $.invalid_default_snippet,
													$$slots: {
														default: ($$renderer, { toggle }) => {
															Button($$renderer, {
																extraCompact: true,
																children: ($$renderer) => {
																	Icon($$renderer, { icon: IconDotsHorizontal });
																},
																$$slots: { default: true }
															});
														},

														tooltip: ($$renderer, { toggle }) => {
															{
																if (ActionMenu.Root) {
																	$$renderer.push('<!--[-->');

																	ActionMenu.Root($$renderer, {
																		width: '180px',
																		noPadding: true,
																		children: ($$renderer) => {
																			if (backup.status === 'completed') {
																				$$renderer.push('<!--[0-->');

																				if (ActionMenu.Item.Button) {
																					$$renderer.push('<!--[-->');

																					ActionMenu.Item.Button($$renderer, {
																						trailingIcon: IconRefresh,
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Restore`);
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

																			if (ActionMenu.Item.Button) {
																				$$renderer.push('<!--[-->');

																				ActionMenu.Item.Button($$renderer, {
																					trailingIcon: IconDuplicate,
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Copy ID`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (ActionMenu.Item.Button) {
																				$$renderer.push('<!--[-->');

																				ActionMenu.Item.Button($$renderer, {
																					status: 'danger',
																					trailingIcon: IconTrash,
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
													}
												});

												$$renderer.push(`<!----></div>`);
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
				}

				MultiSelectionTable($$renderer, {
					resource: 'backup',
					columns: $.store_get($$store_subs ??= {}, '$columns', columns),
					onDelete: deleteBackups,
					computeKey: data.backups.archives.length,
					header,
					children,
					$$slots: { header: true, default: true }
				});
			}

			$$renderer.push(`<!----> `);

			Confirm($$renderer, {
				title: 'Delete backup',
				onSubmit: async () => {
					if (!selectedBackup) return;

					await deleteSingleBackup(selectedBackup.$id);
				},

				get open() {
					return showDelete;
				},

				set open($$value) {
					showDelete = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					if (Typography.Text) {
						$$renderer.push('<!--[-->');

						Typography.Text($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Are you sure you want to delete the <b>${$.escape(getCleanBackupName(selectedBackup))}</b> backup?`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Typography.Text) {
						$$renderer.push('<!--[-->');

						Typography.Text($$renderer, {
							variant: 'm-500',
							children: ($$renderer) => {
								$$renderer.push(`<!---->This action is irreversible.`);
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

			Modal($$renderer, {
				title: 'Restore backup',
				onSubmit: restoreBackup,
				get show() {
					return showRestore;
				},

				set show($$value) {
					showRestore = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					Card($$renderer, {
						radius: 'm',
						padding: 's',
						children: ($$renderer) => {
							if (Layout.Stack) {
								$$renderer.push('<!--[-->');

								Layout.Stack($$renderer, {
									gap: 'xxs',
									children: ($$renderer) => {
										if (Typography.Text) {
											$$renderer.push('<!--[-->');

											Typography.Text($$renderer, {
												variant: 'm-500',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(getCleanBackupName(selectedBackup))}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Typography.Caption) {
											$$renderer.push('<!--[-->');

											Typography.Caption($$renderer, {
												variant: '500',
												children: ($$renderer) => {
													if (Layout.Stack) {
														$$renderer.push('<!--[-->');

														Layout.Stack($$renderer, {
															direction: 'row',
															gap: 'xs',
															children: ($$renderer) => {
																Ellipse($$renderer, { color: 'var(--bgcolor-success)' });
																$$renderer.push(`<!----> Completed `);
																Ellipse($$renderer, { size: 's' });
																$$renderer.push(`<!----> ${$.escape(calculateSize(selectedBackup.size))} `);
																Ellipse($$renderer, { size: 's' });
																$$renderer.push(`<!----> ${$.escape(timeFromNow(selectedBackup.$createdAt))}`);
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
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							gap: 'l',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array_2 = $.ensure_array_like(restoreOptions);

								for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
									let restoreOption = each_array_2[$$index_2];

									$$renderer.push(`<div class="u-width-full-line">`);

									LabelCard($$renderer, {
										padding: 's',
										value: restoreOption.id,
										get group() {
											return selectedRestoreOption;
										},

										set group($$value) {
											selectedRestoreOption = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											$$renderer.push(`<p class="u-color-text-offline u-small">${$.escape(restoreOption.description)}</p>`);
										},

										$$slots: {
											default: true,
											title: ($$renderer) => {
												{
													$$renderer.push(`<div class="u-flex u-flex-vertical u-gap-4 u-width-full-line"><h4 class="body-text-2 u-bold">${$.escape(restoreOption.title)}</h4></div>`);
												}
											}
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

					if (selectedRestoreOption === 'new') {
						$$renderer.push('<!--[0-->');

						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								gap: 's',
								alignItems: 'flex-start',
								children: ($$renderer) => {
									InputText($$renderer, {
										id: 'name',
										label: 'Database name',
										placeholder: 'Enter database name',
										autofocus: true,
										required: true,
										get value() {
											return newDatabaseInfo.name;
										},

										set value($$value) {
											newDatabaseInfo.name = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									if (!showCustomId) {
										$$renderer.push('<!--[0-->');

										Tag($$renderer, {
											size: 's',
											children: ($$renderer) => {
												Icon($$renderer, { icon: IconPencil });
												$$renderer.push(`<!----> Database ID`);
											},
											$$slots: { default: true }
										});
									} else {
										$$renderer.push('<!--[-1-->');

										RestoreModal($$renderer, {
											autofocus: false,
											name: 'Database',
											databaseId: database().$id,
											get show() {
												return showCustomId;
											},

											set show($$value) {
												showCustomId = $$value;
												$$settled = false;
											},

											get id() {
												return newDatabaseInfo.id;
											},

											set id($$value) {
												newDatabaseInfo.id = $$value;
												$$settled = false;
											}
										});
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
					} else {
						$$renderer.push('<!--[-1-->');

						InputCheckbox($$renderer, {
							required: true,
							size: 's',
							id: 'delete_policy',
							label: `Overwrite '${$.stringify(database().name)}' with the selected backup version`,
							get checked() {
								return confirmSameDbRestore;
							},

							set checked($$value) {
								confirmSameDbRestore = $$value;
								$$settled = false;
							}
						});
					}

					$$renderer.push(`<!--]-->`);
				},

				$$slots: {
					default: true,
					footer: ($$renderer) => {
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
								submit: true,
								disabled: disableRestoreButton(),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Restore`);
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
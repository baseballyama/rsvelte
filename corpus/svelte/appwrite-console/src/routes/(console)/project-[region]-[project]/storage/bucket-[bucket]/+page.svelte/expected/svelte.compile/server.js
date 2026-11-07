import * as $ from 'svelte/internal/server';
import { goto, invalidate } from '$app/navigation';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

import {
	Avatar,
	Empty,
	EmptySearch,
	MultiSelectionTable,
	PaginationWithLimit,
	SearchQuery
} from '$lib/components';

import { Dependencies } from '$lib/constants';
import { Badge } from '@appwrite.io/pink-svelte';
import { Button } from '$lib/elements/forms';
import { calculateSize } from '$lib/helpers/sizeConvertion';
import { Container } from '$lib/layout';
import { ImageFormat } from '@appwrite.io/console';
import { uploader } from '$lib/stores/uploader';
import { sdk } from '$lib/stores/sdk.js';
import DeleteFile from './deleteFile.svelte';
import { Layout, Table, Icon, Popover, ActionMenu, Typography } from '@appwrite.io/pink-svelte';
import { onMount } from 'svelte';
import DualTimeView from '$lib/components/dualTimeView.svelte';
import { IconDotsHorizontal, IconPencil, IconPlus, IconTrash } from '@appwrite.io/pink-icons-svelte';
import { isSmallViewport } from '$lib/stores/viewport';
import { ID } from '@appwrite.io/console';
import { addNotification } from '$lib/stores/notifications';
import { impersonatedResourceUrl } from '$lib/appwrite/impersonation';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { data } = $$props;
		let showDelete = false;
		let isUploading = false;
		let selectedFile = null;
		let isDragging = false;

		function getPreview(fileId) {
			return $.store_get($$store_subs ??= {}, '$impersonatedResourceUrl', impersonatedResourceUrl)(
				sdk.forProject(page.params.region, page.params.project).storage.getFilePreview({
					bucketId: page.params.bucket,
					fileId,
					height: 128,
					width: 128,
					output: ImageFormat.Avif
				}),
				{ mode: 'admin' }
			);
		}

		async function fileDeleted(event) {
			showDelete = false;
			await uploader.removeFile(event.detail);
			await invalidate(Dependencies.FILES);
		}

		async function deleteFile(file) {
			selectedFile = file;
			showDelete = true;
		}

		async function handleBulkDelete(batchDelete) {
			const result = await batchDelete((fileId) => sdk.forProject(page.params.region, page.params.project).storage.deleteFile({ bucketId: page.params.bucket, fileId }));

			try {
				if (result.error) {
					trackError(result.error, Submit.FileDelete);
				} else {
					trackEvent(Submit.FileDelete, { total: result.deleted.length });
				}
			} finally {
				await invalidate(Dependencies.FILES);
			}

			return result;
		}

		const beforeunload = (event) => {
			// legacy browser **may** support showing a custom message.
			const message = 'An upload is in progress. Are you sure you want to leave?';

			if (isUploading) {
				event.preventDefault();
				event.returnValue = message;

				return message;
			}
		};

		async function handleDrop(event) {
			isDragging = false;

			if (!event.dataTransfer?.files?.length) return;

			const allowedExtensions = data.bucket.allowedFileExtensions ?? [];
			const droppedFiles = Array.from(event.dataTransfer.files);
			const validFiles = [];
			const rejectedFiles = [];

			for (const file of droppedFiles) {
				const ext = file.name.split('.').pop()?.toLowerCase();

				if (allowedExtensions.length && (!ext || !allowedExtensions.includes(ext))) {
					rejectedFiles.push(file);
				} else {
					validFiles.push(file);
				}
			}

			if (rejectedFiles.length) {
				addNotification({
					type: 'error',
					message: `${rejectedFiles.length} file(s) rejected — only ${allowedExtensions.join(', ')} allowed`
				});
			}

			if (!validFiles.length) return;

			const count = validFiles.length;

			addNotification({
				type: 'success',
				message: count === 1
					? 'File upload in progress'
					: `${count} file uploads in progress`
			});

			trackEvent(Submit.FileCreate, { customId: false });

			const filesToUpload = validFiles.map((file) => ({ id: ID.unique(), file }));
			const results = await uploader.uploadFiles(page.params.region, page.params.project, page.params.bucket, filesToUpload, []);
			const failures = results.filter((r) => r.status === 'rejected');

			if (failures.length) {
				addNotification({
					type: 'error',
					message: `${failures.length} file(s) failed to upload`
				});
			}

			invalidate(Dependencies.FILES);
		}

		onMount(() => {
			return uploader.subscribe(() => {
				isUploading = $.store_get($$store_subs ??= {}, '$uploader', uploader).files.some((file) => file.kind === 'storage' && file.status !== 'success' && file.progress < 100 && file.status !== 'failed');
			});
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class('drop-target svelte-1tyzc', void 0, { 'is-dragging': isDragging })}>`);

			if (isDragging) {
				$$renderer.push(`<!--[0--><div class="drop-overlay svelte-1tyzc">`);

				if (Layout.Stack) {
					$$renderer.push('<!--[-->');

					Layout.Stack($$renderer, {
						alignItems: 'center',
						gap: 's',
						children: ($$renderer) => {
							Icon($$renderer, { icon: IconPlus, size: 'l' });
							$$renderer.push(`<!----> `);

							if (Typography.Text) {
								$$renderer.push('<!--[-->');

								Typography.Text($$renderer, {
									variant: 'l-500',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Drop files to upload`);
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

				$$renderer.push(`</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			Container($$renderer, {
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
										alignItems: 'center',
										children: ($$renderer) => {
											SearchQuery($$renderer, { placeholder: 'Search files' });
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
										children: ($$renderer) => {
											Button($$renderer, {
												href: `${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}/create`,
												event: 'create_file',
												size: 's',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Create file`);
												},

												$$slots: {
													default: true,
													start: ($$renderer) => {
														Icon($$renderer, { icon: IconPlus, slot: 'start', size: 's' });
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

					$$renderer.push(` `);

					if (data.files.total) {
						$$renderer.push('<!--[0-->');

						{
							function header($$renderer, root) {
								if (Table.Header.Cell) {
									$$renderer.push('<!--[-->');

									Table.Header.Cell($$renderer, {
										column: 'filename',
										root,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Filename`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Table.Header.Cell) {
									$$renderer.push('<!--[-->');

									Table.Header.Cell($$renderer, {
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

								if (Table.Header.Cell) {
									$$renderer.push('<!--[-->');

									Table.Header.Cell($$renderer, {
										column: 'size',
										root,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Size`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Table.Header.Cell) {
									$$renderer.push('<!--[-->');

									Table.Header.Cell($$renderer, {
										column: 'created',
										root,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Created`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Table.Header.Cell) {
									$$renderer.push('<!--[-->');
									Table.Header.Cell($$renderer, { column: 'actions', root });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							function children($$renderer, root) {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(data.files.files);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let file = each_array[$$index];

									if (file.chunksTotal / file.chunksUploaded !== 1) {
										$$renderer.push('<!--[0-->');

										if (Table.Row.Base) {
											$$renderer.push('<!--[-->');

											Table.Row.Base($$renderer, {
												root,
												id: file.$id,
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'filename',
															root,
															children: ($$renderer) => {
																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		direction: 'row',
																		alignItems: 'center',
																		children: ($$renderer) => {
																			$$renderer.push(`<span class="avatar is-size-small is-color-empty"></span> <span class="text u-trim">${$.escape(file.name)}</span> <div>`);
																			Badge($$renderer, { variant: 'secondary', type: 'warning', content: 'Pending' });
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

													$$renderer.push(` `);

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'type',
															root,
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(file.mimeType)}`);
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
																$$renderer.push(`<!---->${$.escape(calculateSize(file.sizeOriginal))}`);
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
															column: 'created',
															root,
															children: ($$renderer) => {
																DualTimeView($$renderer, { time: file.$createdAt });
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
																$$renderer.push(`<div class="u-flex u-main-center"><button class="button is-only-icon is-text" aria-label="Delete item"><span class="icon-trash" aria-hidden="true"></span></button></div>`);
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
									} else {
										$$renderer.push('<!--[-1-->');

										const href = `${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}/file-${file.$id}`;

										if (Table.Row.Link) {
											$$renderer.push('<!--[-->');

											Table.Row.Link($$renderer, {
												href,
												root,
												id: file.$id,
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															column: 'filename',
															root,
															children: ($$renderer) => {
																$$renderer.push(`<div class="u-flex u-gap-12 u-cross-center">`);
																Avatar($$renderer, { size: 'xs', src: getPreview(file.$id), alt: file.name });
																$$renderer.push(`<!----> <span class="text u-trim">${$.escape(file.name)}</span></div>`);
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
															column: 'type',
															root,
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(file.mimeType)}`);
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
																$$renderer.push(`<!---->${$.escape(calculateSize(file.sizeOriginal))}`);
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
															column: 'created',
															root,
															children: ($$renderer) => {
																DualTimeView($$renderer, { time: file.$createdAt });
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
																Popover($$renderer, {
																	placement: 'bottom-start',
																	padding: 'none',
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

																		tooltip: ($$renderer) => {
																			if (ActionMenu.Root) {
																				$$renderer.push('<!--[-->');

																				ActionMenu.Root($$renderer, {
																					slot: 'tooltip',
																					children: ($$renderer) => {
																						if (ActionMenu.Item.Anchor) {
																							$$renderer.push('<!--[-->');

																							ActionMenu.Item.Anchor($$renderer, {
																								href,
																								leadingIcon: IconPencil,
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->Update`);
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
								}

								$$renderer.push(`<!--]-->`);
							}

							function deleteContentNotice($$renderer) {
								$$renderer.push(`<!---->This action is irreversible and will permanently remove the selected files.`);
							}

							MultiSelectionTable($$renderer, {
								resource: 'file',
								computeKey: data.files.total,
								onDelete: handleBulkDelete,
								columns: [
									{
										id: 'filename',
										width: $.store_get($$store_subs ??= {}, '$isSmallViewport', isSmallViewport) ? 24 : undefined
									},
									{ id: 'type', width: { min: 140 } },
									{ id: 'size', width: { min: 100 } },
									{ id: 'created', width: { min: 120 } },
									{ id: 'actions', width: 40 }
								],
								header,
								children,
								deleteContentNotice,
								$$slots: { header: true, default: true, deleteContentNotice: true }
							});
						}

						$$renderer.push(`<!----> `);

						PaginationWithLimit($$renderer, {
							name: 'Files',
							limit: data.limit,
							offset: data.offset,
							total: data.files.total
						});

						$$renderer.push(`<!---->`);
					} else if (data.search) {
						$$renderer.push('<!--[1-->');

						EmptySearch($$renderer, {
							target: 'files',
							search: data.search,
							hidePagination: data.files.total === 0,
							children: ($$renderer) => {
								Button($$renderer, {
									secondary: true,
									size: 's',
									href: `${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}`,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Clear Search`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');

						Empty($$renderer, {
							single: true,
							href: 'https://appwrite.io/docs/products/storage',
							target: 'file',
							allowCreate: true
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			DeleteFile($$renderer, {
				file: selectedFile,
				get showDelete() {
					return showDelete;
				},

				set showDelete($$value) {
					showDelete = $$value;
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
	});
}
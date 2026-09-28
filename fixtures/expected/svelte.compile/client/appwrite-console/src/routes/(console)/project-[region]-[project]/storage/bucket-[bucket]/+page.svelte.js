import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="drop-overlay svelte-1tyzc"><!></div>`);
var root_3 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<span class="avatar is-size-small is-color-empty"></span> <span class="text u-trim"> </span> <div><!></div>`, 1);
var root_5 = $.from_html(`<div class="u-flex u-main-center"><button class="button is-only-icon is-text" aria-label="Delete item"><span class="icon-trash" aria-hidden="true"></span></button></div>`);
var root_6 = $.from_html(`<div class="u-flex u-gap-12 u-cross-center"><!> <span class="text u-trim"> </span></div>`);
var root_7 = $.from_html(`<div><!> <!></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $impersonatedResourceUrl = () => $.store_get(impersonatedResourceUrl, '$impersonatedResourceUrl', $$stores);
	const $uploader = () => $.store_get(uploader, '$uploader', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let showDelete = $.state(false);
	let isUploading = $.state(false);
	let selectedFile = $.state(null);
	let isDragging = $.state(false);

	function getPreview(fileId) {
		return $impersonatedResourceUrl()(
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
		$.set(showDelete, false);
		await uploader.removeFile(event.detail);
		await invalidate(Dependencies.FILES);
	}

	async function deleteFile(file) {
		$.set(selectedFile, file, true);
		$.set(showDelete, true);
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

		if ($.get(isUploading)) {
			event.preventDefault();
			event.returnValue = message;

			return message;
		}
	};

	async function handleDrop(event) {
		$.set(isDragging, false);

		if (!event.dataTransfer?.files?.length) return;

		const allowedExtensions = $$props.data.bucket.allowedFileExtensions ?? [];
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
			$.set(isUploading, $uploader().files.some((file) => file.kind === 'storage' && file.status !== 'success' && file.progress < 100 && file.status !== 'failed'), true);
		});
	});

	var fragment = root_7();

	$.event('beforeunload', $.window, beforeunload);

	var div = $.first_child(fragment);
	let classes;
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_2();
			var node_1 = $.child(div_1);

			$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack) => {
				Layout_Stack($$anchor, {
					alignItems: 'center',
					gap: 's',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_2 = $.first_child(fragment_1);

						Icon(node_2, {
							get icon() {
								return IconPlus;
							},
							size: 'l'
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
							Typography_Text($$anchor, {
								variant: 'l-500',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Drop files to upload');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(isDragging)) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node, 2);

	Container(node_4, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_5 = $.first_child(fragment_2);

			$.component(node_5, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
				Layout_Stack_1($$anchor, {
					direction: 'row',
					justifyContent: 'space-between',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_1();
						var node_6 = $.first_child(fragment_3);

						$.component(node_6, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
							Layout_Stack_2($$anchor, {
								direction: 'row',
								alignItems: 'center',
								children: ($$anchor, $$slotProps) => {
									SearchQuery($$anchor, { placeholder: 'Search files' });
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
							Layout_Stack_3($$anchor, {
								direction: 'row',
								alignItems: 'center',
								justifyContent: 'flex-end',
								children: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}/create`);

										Button($$anchor, {
											get href() {
												return $.get($0);
											},
											event: 'create_file',
											size: 's',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Create file');

												$.append($$anchor, text_1);
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
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_8 = $.sibling(node_5, 2);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_7 = root_1();
					var node_9 = $.first_child(fragment_7);

					{
						const header = ($$anchor, root = $.noop) => {
							var fragment_8 = root_3();
							var node_10 = $.first_child(fragment_8);

							$.component(node_10, () => Table.Header.Cell, ($$anchor, Table_Header_Cell) => {
								Table_Header_Cell($$anchor, {
									column: 'filename',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Filename');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_11 = $.sibling(node_10, 2);

							$.component(node_11, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_1) => {
								Table_Header_Cell_1($$anchor, {
									column: 'type',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Type');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_11, 2);

							$.component(node_12, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_2) => {
								Table_Header_Cell_2($$anchor, {
									column: 'size',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Size');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							var node_13 = $.sibling(node_12, 2);

							$.component(node_13, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_3) => {
								Table_Header_Cell_3($$anchor, {
									column: 'created',
									get root() {
										return root();
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('Created');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							});

							var node_14 = $.sibling(node_13, 2);

							$.component(node_14, () => Table.Header.Cell, ($$anchor, Table_Header_Cell_4) => {
								Table_Header_Cell_4($$anchor, {
									column: 'actions',
									get root() {
										return root();
									}
								});
							});

							$.append($$anchor, fragment_8);
						};

						const children = ($$anchor, root = $.noop) => {
							var fragment_9 = $.comment();
							var node_15 = $.first_child(fragment_9);

							$.each(node_15, 17, () => $$props.data.files.files, $.index, ($$anchor, file) => {
								var fragment_10 = $.comment();
								var node_16 = $.first_child(fragment_10);

								{
									var consequent_1 = ($$anchor) => {
										var fragment_11 = $.comment();
										var node_17 = $.first_child(fragment_11);

										$.component(node_17, () => Table.Row.Base, ($$anchor, Table_Row_Base) => {
											Table_Row_Base($$anchor, {
												get root() {
													return root();
												},

												get id() {
													return $.get(file).$id;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_12 = root_3();
													var node_18 = $.first_child(fragment_12);

													$.component(node_18, () => Table.Cell, ($$anchor, Table_Cell) => {
														Table_Cell($$anchor, {
															column: 'filename',
															get root() {
																return root();
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_13 = $.comment();
																var node_19 = $.first_child(fragment_13);

																$.component(node_19, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
																	Layout_Stack_4($$anchor, {
																		direction: 'row',
																		alignItems: 'center',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_14 = root_4();
																			var span = $.sibling($.first_child(fragment_14), 2);
																			var text_6 = $.only_child(span, true);
																			var div_2 = $.sibling(span, 2);
																			var node_20 = $.child(div_2);

																			Badge(node_20, { variant: 'secondary', type: 'warning', content: 'Pending' });
																			$.reset(div_2);
																			$.template_effect(() => $.set_text(text_6, $.get(file).name));
																			$.append($$anchor, fragment_14);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_13);
															},
															$$slots: { default: true }
														});
													});

													var node_21 = $.sibling(node_18, 2);

													$.component(node_21, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															column: 'type',
															get root() {
																return root();
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text();

																$.template_effect(() => $.set_text(text_7, $.get(file).mimeType));
																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_22 = $.sibling(node_21, 2);

													$.component(node_22, () => Table.Cell, ($$anchor, Table_Cell_2) => {
														Table_Cell_2($$anchor, {
															column: 'size',
															get root() {
																return root();
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text();

																$.template_effect(($0) => $.set_text(text_8, $0), [() => calculateSize($.get(file).sizeOriginal)]);
																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													var node_23 = $.sibling(node_22, 2);

													$.component(node_23, () => Table.Cell, ($$anchor, Table_Cell_3) => {
														Table_Cell_3($$anchor, {
															column: 'created',
															get root() {
																return root();
															},

															children: ($$anchor, $$slotProps) => {
																DualTimeView($$anchor, {
																	get time() {
																		return $.get(file).$createdAt;
																	}
																});
															},
															$$slots: { default: true }
														});
													});

													var node_24 = $.sibling(node_23, 2);

													$.component(node_24, () => Table.Cell, ($$anchor, Table_Cell_4) => {
														Table_Cell_4($$anchor, {
															column: 'actions',
															get root() {
																return root();
															},

															children: ($$anchor, $$slotProps) => {
																var div_3 = root_5();
																var button = $.only_child(div_3);

																$.delegated('click', button, (event) => {
																	event.preventDefault();
																	deleteFile($.get(file));
																});

																$.append($$anchor, div_3);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_12);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_11);
									};

									var alternate = ($$anchor) => {
										const href = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}/file-${$.get(file).$id}`);
										var fragment_18 = $.comment();
										var node_25 = $.first_child(fragment_18);

										$.component(node_25, () => Table.Row.Link, ($$anchor, Table_Row_Link) => {
											Table_Row_Link($$anchor, {
												get href() {
													return $.get(href);
												},

												get root() {
													return root();
												},

												get id() {
													return $.get(file).$id;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_19 = root_3();
													var node_26 = $.first_child(fragment_19);

													$.component(node_26, () => Table.Cell, ($$anchor, Table_Cell_5) => {
														Table_Cell_5($$anchor, {
															column: 'filename',
															get root() {
																return root();
															},

															children: ($$anchor, $$slotProps) => {
																var div_4 = root_6();
																var node_27 = $.child(div_4);

																{
																	let $0 = $.derived(() => getPreview($.get(file).$id));

																	Avatar(node_27, {
																		size: 'xs',
																		get src() {
																			return $.get($0);
																		},

																		get alt() {
																			return $.get(file).name;
																		}
																	});
																}

																var span_1 = $.sibling(node_27, 2);
																var text_9 = $.only_child(span_1, true);

																$.reset(div_4);
																$.template_effect(() => $.set_text(text_9, $.get(file).name));
																$.append($$anchor, div_4);
															},
															$$slots: { default: true }
														});
													});

													var node_28 = $.sibling(node_26, 2);

													$.component(node_28, () => Table.Cell, ($$anchor, Table_Cell_6) => {
														Table_Cell_6($$anchor, {
															column: 'type',
															get root() {
																return root();
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_10 = $.text();

																$.template_effect(() => $.set_text(text_10, $.get(file).mimeType));
																$.append($$anchor, text_10);
															},
															$$slots: { default: true }
														});
													});

													var node_29 = $.sibling(node_28, 2);

													$.component(node_29, () => Table.Cell, ($$anchor, Table_Cell_7) => {
														Table_Cell_7($$anchor, {
															column: 'size',
															get root() {
																return root();
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_11 = $.text();

																$.template_effect(($0) => $.set_text(text_11, $0), [() => calculateSize($.get(file).sizeOriginal)]);
																$.append($$anchor, text_11);
															},
															$$slots: { default: true }
														});
													});

													var node_30 = $.sibling(node_29, 2);

													$.component(node_30, () => Table.Cell, ($$anchor, Table_Cell_8) => {
														Table_Cell_8($$anchor, {
															column: 'created',
															get root() {
																return root();
															},

															children: ($$anchor, $$slotProps) => {
																DualTimeView($$anchor, {
																	get time() {
																		return $.get(file).$createdAt;
																	}
																});
															},
															$$slots: { default: true }
														});
													});

													var node_31 = $.sibling(node_30, 2);

													$.component(node_31, () => Table.Cell, ($$anchor, Table_Cell_9) => {
														Table_Cell_9($$anchor, {
															column: 'actions',
															get root() {
																return root();
															},

															children: ($$anchor, $$slotProps) => {
																Popover($$anchor, {
																	placement: 'bottom-start',
																	padding: 'none',
																	children: $.invalid_default_snippet,
																	$$slots: {
																		default: ($$anchor, $$slotProps) => {
																			const toggle = $.derived(() => $$slotProps.toggle);

																			Button($$anchor, {
																				text: true,
																				icon: true,
																				ariaLabel: 'more options',
																				$$events: {
																					click: (e) => {
																						e.stopPropagation();
																						e.preventDefault();
																						$.get(toggle)();
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
																			var fragment_26 = $.comment();
																			var node_32 = $.first_child(fragment_26);

																			$.component(node_32, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
																				ActionMenu_Root($$anchor, {
																					slot: 'tooltip',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_27 = root_1();
																						var node_33 = $.first_child(fragment_27);

																						$.component(node_33, () => ActionMenu.Item.Anchor, ($$anchor, ActionMenu_Item_Anchor) => {
																							ActionMenu_Item_Anchor($$anchor, {
																								get href() {
																									return $.get(href);
																								},

																								get leadingIcon() {
																									return IconPencil;
																								},

																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_12 = $.text('Update');

																									$.append($$anchor, text_12);
																								},
																								$$slots: { default: true }
																							});
																						});

																						var node_34 = $.sibling(node_33, 2);

																						$.component(node_34, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
																							ActionMenu_Item_Button($$anchor, {
																								get leadingIcon() {
																									return IconTrash;
																								},

																								$$events: {
																									click: (e) => {
																										e.stopPropagation();
																										e.preventDefault();
																										$.set(selectedFile, $.get(file), true);
																										$.set(showDelete, true);
																									}
																								},

																								children: ($$anchor, $$slotProps) => {
																									$.next();

																									var text_13 = $.text('Delete');

																									$.append($$anchor, text_13);
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
																		}
																	}
																});
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_19);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_18);
									};

									$.if(node_16, ($$render) => {
										if ($.get(file).chunksTotal / $.get(file).chunksUploaded !== 1) $$render(consequent_1); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_10);
							});

							$.append($$anchor, fragment_9);
						};

						const deleteContentNotice = ($$anchor) => {
							$.next();

							var text_14 = $.text('This action is irreversible and will permanently remove the selected files.');

							$.append($$anchor, text_14);
						};

						let $0 = $.derived(() => [
							{ id: 'filename', width: $isSmallViewport() ? 24 : undefined },
							{ id: 'type', width: { min: 140 } },
							{ id: 'size', width: { min: 100 } },
							{ id: 'created', width: { min: 120 } },
							{ id: 'actions', width: 40 }
						]);

						MultiSelectionTable(node_9, {
							resource: 'file',
							get computeKey() {
								return $$props.data.files.total;
							},
							onDelete: handleBulkDelete,
							get columns() {
								return $.get($0);
							},
							header,
							children,
							deleteContentNotice,
							$$slots: { header: true, default: true, deleteContentNotice: true }
						});
					}

					var node_35 = $.sibling(node_9, 2);

					PaginationWithLimit(node_35, {
						name: 'Files',
						get limit() {
							return $$props.data.limit;
						},

						get offset() {
							return $$props.data.offset;
						},

						get total() {
							return $$props.data.files.total;
						}
					});

					$.append($$anchor, fragment_7);
				};

				var consequent_3 = ($$anchor) => {
					{
						let $0 = $.derived(() => $$props.data.files.total === 0);

						EmptySearch($$anchor, {
							target: 'files',
							get search() {
								return $$props.data.search;
							},

							get hidePagination() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								{
									let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}`);

									Button($$anchor, {
										secondary: true,
										size: 's',
										get href() {
											return $.get($0);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_15 = $.text('Clear Search');

											$.append($$anchor, text_15);
										},
										$$slots: { default: true }
									});
								}
							},
							$$slots: { default: true }
						});
					}
				};

				var alternate_1 = ($$anchor) => {
					Empty($$anchor, {
						single: true,
						href: 'https://appwrite.io/docs/products/storage',
						target: 'file',
						allowCreate: true,
						$$events: {
							click: () => goto(`${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}/create`)
						}
					});
				};

				$.if(node_8, ($$render) => {
					if ($$props.data.files.total) $$render(consequent_2); else if ($$props.data.search) $$render(consequent_3, 1); else $$render(alternate_1, -1);
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_36 = $.sibling(div, 2);

	DeleteFile(node_36, {
		get file() {
			return $.get(selectedFile);
		},

		get showDelete() {
			return $.get(showDelete);
		},

		set showDelete($$value) {
			$.set(showDelete, $$value, true);
		},
		$$events: { deleted: fileDeleted }
	});

	$.template_effect(() => classes = $.set_class(div, 1, 'drop-target svelte-1tyzc', null, classes, { 'is-dragging': $.get(isDragging) }));

	$.event('drop', div, (e) => {
		e.preventDefault();
		handleDrop(e);
	});

	$.event('dragenter', div, (e) => {
		e.preventDefault();
		$.set(isDragging, true);
	});

	$.event('dragover', div, (e) => {
		e.preventDefault();
		$.set(isDragging, true);
	});

	$.event('dragleave', div, (e) => {
		e.preventDefault();

		if (!e.currentTarget.contains(e.relatedTarget)) $.set(isDragging, false);
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);
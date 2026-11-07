import * as $ from 'svelte/internal/server';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Context_menu_with_destructive($$renderer) {
	Example($$renderer, {
		title: 'With Destructive Items',
		children: ($$renderer) => {
			if (ContextMenu.Root) {
				$$renderer.push('<!--[-->');

				ContextMenu.Root($$renderer, {
					children: ($$renderer) => {
						if (ContextMenu.Trigger) {
							$$renderer.push('<!--[-->');

							ContextMenu.Trigger($$renderer, {
								class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Right click here`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (ContextMenu.Content) {
							$$renderer.push('<!--[-->');

							ContextMenu.Content($$renderer, {
								children: ($$renderer) => {
									if (ContextMenu.Group) {
										$$renderer.push('<!--[-->');

										ContextMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'PencilIcon',
																tabler: 'IconPencil',
																hugeicons: 'EditIcon',
																phosphor: 'PencilIcon',
																remixicon: 'RiPencilLine'
															});

															$$renderer.push(`<!----> Edit`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'ShareIcon',
																tabler: 'IconShare',
																hugeicons: 'ShareIcon',
																phosphor: 'ShareIcon',
																remixicon: 'RiShareLine'
															});

															$$renderer.push(`<!----> Share`);
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

									if (ContextMenu.Separator) {
										$$renderer.push('<!--[-->');
										ContextMenu.Separator($$renderer, {});
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (ContextMenu.Group) {
										$$renderer.push('<!--[-->');

										ContextMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'ArchiveIcon',
																tabler: 'IconArchive',
																hugeicons: 'Archive02Icon',
																phosphor: 'ArchiveIcon',
																remixicon: 'RiArchiveLine'
															});

															$$renderer.push(`<!----> Archive`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														variant: 'destructive',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'TrashIcon',
																tabler: 'IconTrash',
																hugeicons: 'DeleteIcon',
																phosphor: 'TrashIcon',
																remixicon: 'RiDeleteBinLine'
															});

															$$renderer.push(`<!----> Delete`);
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}
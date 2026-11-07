import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Item_outline_group($$renderer) {
	Example($$renderer, {
		title: 'Outline - ItemGroup',
		children: ($$renderer) => {
			if (Item.Group) {
				$$renderer.push('<!--[-->');

				Item.Group($$renderer, {
					children: ($$renderer) => {
						if (Item.Root) {
							$$renderer.push('<!--[-->');

							Item.Root($$renderer, {
								variant: 'outline',
								children: ($$renderer) => {
									if (Item.Media) {
										$$renderer.push('<!--[-->');

										Item.Media($$renderer, {
											variant: 'icon',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'InboxIcon',
													tabler: 'IconArchive',
													hugeicons: 'Archive02Icon',
													phosphor: 'ArchiveIcon',
													remixicon: 'RiArchiveLine'
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

									if (Item.Content) {
										$$renderer.push('<!--[-->');

										Item.Content($$renderer, {
											children: ($$renderer) => {
												if (Item.Title) {
													$$renderer.push('<!--[-->');

													Item.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Item 1`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Item.Description) {
													$$renderer.push('<!--[-->');

													Item.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->First item with icon.`);
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

						if (Item.Root) {
							$$renderer.push('<!--[-->');

							Item.Root($$renderer, {
								variant: 'outline',
								children: ($$renderer) => {
									if (Item.Media) {
										$$renderer.push('<!--[-->');

										Item.Media($$renderer, {
											variant: 'icon',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'InboxIcon',
													tabler: 'IconArchive',
													hugeicons: 'Archive02Icon',
													phosphor: 'ArchiveIcon',
													remixicon: 'RiArchiveLine'
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

									if (Item.Content) {
										$$renderer.push('<!--[-->');

										Item.Content($$renderer, {
											children: ($$renderer) => {
												if (Item.Title) {
													$$renderer.push('<!--[-->');

													Item.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Item 2`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Item.Description) {
													$$renderer.push('<!--[-->');

													Item.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Second item with icon.`);
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

						if (Item.Root) {
							$$renderer.push('<!--[-->');

							Item.Root($$renderer, {
								variant: 'outline',
								children: ($$renderer) => {
									if (Item.Media) {
										$$renderer.push('<!--[-->');

										Item.Media($$renderer, {
											variant: 'icon',
											children: ($$renderer) => {
												IconPlaceholder($$renderer, {
													lucide: 'InboxIcon',
													tabler: 'IconArchive',
													hugeicons: 'Archive02Icon',
													phosphor: 'ArchiveIcon',
													remixicon: 'RiArchiveLine'
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

									if (Item.Content) {
										$$renderer.push('<!--[-->');

										Item.Content($$renderer, {
											children: ($$renderer) => {
												if (Item.Title) {
													$$renderer.push('<!--[-->');

													Item.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Item 3`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Item.Description) {
													$$renderer.push('<!--[-->');

													Item.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Third item with icon.`);
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
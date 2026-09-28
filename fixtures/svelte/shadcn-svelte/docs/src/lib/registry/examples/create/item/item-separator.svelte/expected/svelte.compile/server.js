import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Item_separator($$renderer) {
	Example($$renderer, {
		title: 'ItemSeparator',
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
															$$renderer.push(`<!---->Inbox`);
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
															$$renderer.push(`<!---->View all incoming messages.`);
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

						if (Item.Separator) {
							$$renderer.push('<!--[-->');
							Item.Separator($$renderer, {});
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
															$$renderer.push(`<!---->Sent`);
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
															$$renderer.push(`<!---->View all sent messages.`);
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

						if (Item.Separator) {
							$$renderer.push('<!--[-->');
							Item.Separator($$renderer, {});
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
															$$renderer.push(`<!---->Drafts`);
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
															$$renderer.push(`<!---->View all draft messages.`);
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

						if (Item.Separator) {
							$$renderer.push('<!--[-->');
							Item.Separator($$renderer, {});
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
															$$renderer.push(`<!---->Archive`);
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
															$$renderer.push(`<!---->View archived messages.`);
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
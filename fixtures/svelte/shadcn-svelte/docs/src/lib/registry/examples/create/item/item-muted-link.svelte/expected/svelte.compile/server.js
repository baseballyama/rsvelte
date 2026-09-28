import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Item_muted_link($$renderer) {
	Example($$renderer, {
		title: 'Muted - asChild',
		children: ($$renderer) => {
			if (Item.Group) {
				$$renderer.push('<!--[-->');

				Item.Group($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

								if (Item.Content) {
									$$renderer.push('<!--[-->');

									Item.Content($$renderer, {
										children: ($$renderer) => {
											if (Item.Title) {
												$$renderer.push('<!--[-->');

												Item.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Title Only (Link)`);
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

								$$renderer.push(`</a>`);
							}

							if (Item.Root) {
								$$renderer.push('<!--[-->');
								Item.Root($$renderer, { variant: 'muted', child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						{
							function child($$renderer, { props }) {
								$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

								if (Item.Content) {
									$$renderer.push('<!--[-->');

									Item.Content($$renderer, {
										children: ($$renderer) => {
											if (Item.Title) {
												$$renderer.push('<!--[-->');

												Item.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Title + Description (Link)`);
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
														$$renderer.push(`<!---->Clickable item with title and description.`);
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

								$$renderer.push(`</a>`);
							}

							if (Item.Root) {
								$$renderer.push('<!--[-->');
								Item.Root($$renderer, { variant: 'muted', child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						{
							function child($$renderer, { props }) {
								$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

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
														$$renderer.push(`<!---->Media + Title (Link)`);
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

								$$renderer.push(`</a>`);
							}

							if (Item.Root) {
								$$renderer.push('<!--[-->');
								Item.Root($$renderer, { variant: 'muted', child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						{
							function child($$renderer, { props }) {
								$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

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
														$$renderer.push(`<!---->Media + Title + Description (Link)`);
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
														$$renderer.push(`<!---->Complete link item with media, title, and description.`);
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

								$$renderer.push(`</a>`);
							}

							if (Item.Root) {
								$$renderer.push('<!--[-->');
								Item.Root($$renderer, { variant: 'muted', child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						{
							function child($$renderer, { props }) {
								$$renderer.push(`<a${$.attributes({ href: '#/', ...props })}>`);

								if (Item.Content) {
									$$renderer.push('<!--[-->');

									Item.Content($$renderer, {
										children: ($$renderer) => {
											if (Item.Title) {
												$$renderer.push('<!--[-->');

												Item.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->With Actions (Link)`);
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
														$$renderer.push(`<!---->Link item that also has action buttons.`);
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

								if (Item.Actions) {
									$$renderer.push('<!--[-->');

									Item.Actions($$renderer, {
										children: ($$renderer) => {
											Button($$renderer, {
												variant: 'outline',
												size: 'sm',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Share`);
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

								$$renderer.push(`</a>`);
							}

							if (Item.Root) {
								$$renderer.push('<!--[-->');
								Item.Root($$renderer, { variant: 'muted', child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
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
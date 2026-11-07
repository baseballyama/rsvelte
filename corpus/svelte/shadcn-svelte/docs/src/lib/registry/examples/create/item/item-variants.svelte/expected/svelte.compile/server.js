import * as $ from 'svelte/internal/server';
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Item_variants($$renderer) {
	const variants = [
		{ title: "Default" },
		{ title: "Outline", variant: "outline" },
		{ title: "Muted", variant: "muted" },
		{ title: "Small", size: "sm" },
		{ title: "Outline - Small", variant: "outline", size: "sm" },
		{ title: "Muted - Small", variant: "muted", size: "sm" },
		{ title: "Extra Small", size: "xs" },
		{
			title: "Outline - Extra Small",
			variant: "outline",
			size: "xs"
		},
		{ title: "Muted - Extra Small", variant: "muted", size: "xs" }
	];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(variants);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { title, variant, size } = each_array[$$index];

		Example($$renderer, {
			title,
			children: ($$renderer) => {
				if (Item.Root) {
					$$renderer.push('<!--[-->');

					Item.Root($$renderer, {
						variant,
						size,
						children: ($$renderer) => {
							if (Item.Content) {
								$$renderer.push('<!--[-->');

								Item.Content($$renderer, {
									children: ($$renderer) => {
										if (Item.Title) {
											$$renderer.push('<!--[-->');

											Item.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Title Only`);
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
						variant,
						size,
						children: ($$renderer) => {
							if (Item.Content) {
								$$renderer.push('<!--[-->');

								Item.Content($$renderer, {
									children: ($$renderer) => {
										if (Item.Title) {
											$$renderer.push('<!--[-->');

											Item.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Title + Button`);
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
											size: size === "xs" || size === "sm" ? "sm" : undefined,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Action`);
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
						variant,
						size,
						children: ($$renderer) => {
							if (Item.Content) {
								$$renderer.push('<!--[-->');

								Item.Content($$renderer, {
									children: ($$renderer) => {
										if (Item.Title) {
											$$renderer.push('<!--[-->');

											Item.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Title + Description`);
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
													$$renderer.push(`<!---->This is a description that provides additional context.`);
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
						variant,
						size,
						children: ($$renderer) => {
							if (Item.Content) {
								$$renderer.push('<!--[-->');

								Item.Content($$renderer, {
									children: ($$renderer) => {
										if (Item.Title) {
											$$renderer.push('<!--[-->');

											Item.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Title + Description + Button`);
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
													$$renderer.push(`<!---->This item includes a title, description, and action button.`);
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
											size: size === "xs" || size === "sm" ? "sm" : undefined,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Action`);
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
						variant,
						size,
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
													$$renderer.push(`<!---->Media + Title`);
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
						variant,
						size,
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
													$$renderer.push(`<!---->Media + Title + Button`);
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
											size: 'sm',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Action`);
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
						variant,
						size,
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
													$$renderer.push(`<!---->Media + Title + Description`);
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
													$$renderer.push(`<!---->This item includes media, title, and description.`);
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
						variant,
						size,
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
													$$renderer.push(`<!---->Media + Title + Description + Button`);
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
													$$renderer.push(`<!---->Complete item with all components: media, title, description, and button.`);
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
											size: 'sm',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Action`);
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
						variant,
						size,
						children: ($$renderer) => {
							if (Item.Content) {
								$$renderer.push('<!--[-->');

								Item.Content($$renderer, {
									children: ($$renderer) => {
										if (Item.Title) {
											$$renderer.push('<!--[-->');

											Item.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Multiple Actions`);
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
													$$renderer.push(`<!---->Item with multiple action buttons in the actions area.`);
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
												$$renderer.push(`<!---->Cancel`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											size: 'sm',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Confirm`);
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

	$$renderer.push(`<!--]-->`);
}
import * as $ from 'svelte/internal/server';
import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";

export default function Breadcrumb_demo($$renderer) {
	if (Breadcrumb.Root) {
		$$renderer.push('<!--[-->');

		Breadcrumb.Root($$renderer, {
			children: ($$renderer) => {
				if (Breadcrumb.List) {
					$$renderer.push('<!--[-->');

					Breadcrumb.List($$renderer, {
						children: ($$renderer) => {
							if (Breadcrumb.Item) {
								$$renderer.push('<!--[-->');

								Breadcrumb.Item($$renderer, {
									children: ($$renderer) => {
										if (Breadcrumb.Link) {
											$$renderer.push('<!--[-->');

											Breadcrumb.Link($$renderer, {
												href: '/',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Home`);
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

							if (Breadcrumb.Separator) {
								$$renderer.push('<!--[-->');
								Breadcrumb.Separator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Breadcrumb.Item) {
								$$renderer.push('<!--[-->');

								Breadcrumb.Item($$renderer, {
									children: ($$renderer) => {
										if (DropdownMenu.Root) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Root($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.Trigger) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Trigger($$renderer, {
															class: 'flex items-center gap-1',
															children: ($$renderer) => {
																if (Breadcrumb.Ellipsis) {
																	$$renderer.push('<!--[-->');
																	Breadcrumb.Ellipsis($$renderer, { class: 'size-4' });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` <span class="sr-only">Toggle menu</span>`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Content) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Content($$renderer, {
															align: 'start',
															children: ($$renderer) => {
																if (DropdownMenu.Item) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Item($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Documentation`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.Item) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Item($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Themes`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.Item) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Item($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->GitHub`);
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

							$$renderer.push(` `);

							if (Breadcrumb.Separator) {
								$$renderer.push('<!--[-->');
								Breadcrumb.Separator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Breadcrumb.Item) {
								$$renderer.push('<!--[-->');

								Breadcrumb.Item($$renderer, {
									children: ($$renderer) => {
										if (Breadcrumb.Link) {
											$$renderer.push('<!--[-->');

											Breadcrumb.Link($$renderer, {
												href: '/docs/components',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Components`);
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

							if (Breadcrumb.Separator) {
								$$renderer.push('<!--[-->');
								Breadcrumb.Separator($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Breadcrumb.Item) {
								$$renderer.push('<!--[-->');

								Breadcrumb.Item($$renderer, {
									children: ($$renderer) => {
										if (Breadcrumb.Page) {
											$$renderer.push('<!--[-->');

											Breadcrumb.Page($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Breadcrumb`);
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
}
import * as $ from 'svelte/internal/server';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Context_menu_with_sides($$renderer) {
	Example($$renderer, {
		title: 'With Sides',
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid grid-cols-2 gap-6">`);

			if (ContextMenu.Root) {
				$$renderer.push('<!--[-->');

				ContextMenu.Root($$renderer, {
					children: ($$renderer) => {
						if (ContextMenu.Trigger) {
							$$renderer.push('<!--[-->');

							ContextMenu.Trigger($$renderer, {
								class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Right click (top)`);
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
								side: 'top',
								children: ($$renderer) => {
									if (ContextMenu.Group) {
										$$renderer.push('<!--[-->');

										ContextMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Back`);
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
															$$renderer.push(`<!---->Forward`);
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
															$$renderer.push(`<!---->Reload`);
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

			if (ContextMenu.Root) {
				$$renderer.push('<!--[-->');

				ContextMenu.Root($$renderer, {
					children: ($$renderer) => {
						if (ContextMenu.Trigger) {
							$$renderer.push('<!--[-->');

							ContextMenu.Trigger($$renderer, {
								class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Right click (right)`);
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
								side: 'right',
								children: ($$renderer) => {
									if (ContextMenu.Group) {
										$$renderer.push('<!--[-->');

										ContextMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Back`);
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
															$$renderer.push(`<!---->Forward`);
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
															$$renderer.push(`<!---->Reload`);
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

			if (ContextMenu.Root) {
				$$renderer.push('<!--[-->');

				ContextMenu.Root($$renderer, {
					children: ($$renderer) => {
						if (ContextMenu.Trigger) {
							$$renderer.push('<!--[-->');

							ContextMenu.Trigger($$renderer, {
								class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Right click (bottom)`);
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
								side: 'bottom',
								children: ($$renderer) => {
									if (ContextMenu.Group) {
										$$renderer.push('<!--[-->');

										ContextMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Back`);
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
															$$renderer.push(`<!---->Forward`);
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
															$$renderer.push(`<!---->Reload`);
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

			if (ContextMenu.Root) {
				$$renderer.push('<!--[-->');

				ContextMenu.Root($$renderer, {
					children: ($$renderer) => {
						if (ContextMenu.Trigger) {
							$$renderer.push('<!--[-->');

							ContextMenu.Trigger($$renderer, {
								class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Right click (left)`);
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
								side: 'left',
								children: ($$renderer) => {
									if (ContextMenu.Group) {
										$$renderer.push('<!--[-->');

										ContextMenu.Group($$renderer, {
											children: ($$renderer) => {
												if (ContextMenu.Item) {
													$$renderer.push('<!--[-->');

													ContextMenu.Item($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Back`);
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
															$$renderer.push(`<!---->Forward`);
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
															$$renderer.push(`<!---->Reload`);
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

			$$renderer.push(`</div>`);
		},
		$$slots: { default: true }
	});
}
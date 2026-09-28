import * as $ from 'svelte/internal/server';
import { Button, Dialog, Drawer, MenuField, Switch, TextField, Toggle } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let leftOpen = false;
	let rightOpen = false;
	let topOpen = false;
	let bottomOpen = false;
	let isChanged = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> <h2>Location</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Drawer($$renderer, {
					placement: 'top',
					class: 'h-64',
					get open() {
						return topOpen;
					},

					set open($$value) {
						topOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<h1>Contents</h1>`);
					},

					$$slots: {
						default: true,
						actions: ($$renderer) => {
							$$renderer.push(`<div slot="actions">`);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Close`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Top`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Drawer($$renderer, {
					placement: 'bottom',
					class: 'h-64',
					get open() {
						return bottomOpen;
					},

					set open($$value) {
						bottomOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<h1>Contents</h1>`);
					},

					$$slots: {
						default: true,
						actions: ($$renderer) => {
							$$renderer.push(`<div slot="actions">`);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Close`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Bottom`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Drawer($$renderer, {
					placement: 'left',
					class: 'w-[400px]',
					get open() {
						return leftOpen;
					},

					set open($$value) {
						leftOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<h1>Contents</h1>`);
					},

					$$slots: {
						default: true,
						actions: ($$renderer) => {
							$$renderer.push(`<div slot="actions">`);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Close`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Left`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Drawer($$renderer, {
					placement: 'right',
					class: 'w-[400px]',
					get open() {
						return rightOpen;
					},

					set open($$value) {
						rightOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<h1>Contents</h1>`);
					},

					$$slots: {
						default: true,
						actions: ($$renderer) => {
							$$renderer.push(`<div slot="actions">`);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Close`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----></div>`);
						}
					}
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Right`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Persistent</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							Drawer($$renderer, {
								open,
								persistent: true,
								class: 'w-[400px]',
								children: ($$renderer) => {
									$$renderer.push(`<h1>Contents</h1>`);
								},

								$$slots: {
									default: true,
									actions: ($$renderer) => {
										$$renderer.push(`<div slot="actions">`);

										Button($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Close`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									}
								}
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Loading</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							Drawer($$renderer, {
								open,
								class: 'w-[400px]',
								loading: true,
								children: ($$renderer) => {
									$$renderer.push(`<h1>Contents</h1>`);
								},

								$$slots: {
									default: true,
									actions: ($$renderer) => {
										$$renderer.push(`<div slot="actions">`);

										Button($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Close`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									}
								}
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>With autofocus TextField</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							Drawer($$renderer, {
								open,
								class: 'w-[400px]',
								children: ($$renderer) => {
									$$renderer.push(`<div class="p-2">`);
									TextField($$renderer, { autofocus: true });
									$$renderer.push(`<!----></div>`);
								},

								$$slots: {
									default: true,
									actions: ($$renderer) => {
										$$renderer.push(`<div slot="actions">`);

										Button($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Close`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									}
								}
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Dialog within Drawer</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							Drawer($$renderer, {
								open,
								class: 'w-[400px]',
								children: ($$renderer) => {
									$$renderer.push(`<div class="p-2">`);

									Toggle($$renderer, {
										children: $.invalid_default_snippet,
										$$slots: {
											default: ($$renderer, { on: open, toggle, toggleOff }) => {
												Button($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Show Dialog`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Dialog($$renderer, {
													open,
													$$slots: {
														title: ($$renderer) => {
															$$renderer.push(`<div slot="title">Are you sure you want to do that?</div>`);
														},

														actions: ($$renderer) => {
															$$renderer.push(`<div slot="actions">`);

															Button($$renderer, {
																variant: 'fill',
																color: 'primary',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Close`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----></div>`);
														}
													}
												});

												$$renderer.push(`<!---->`);
											}
										}
									});

									$$renderer.push(`<!----></div>`);
								},

								$$slots: {
									default: true,
									actions: ($$renderer) => {
										$$renderer.push(`<div slot="actions">`);

										Button($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Close`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									}
								}
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>MenuField within Drawer</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							Drawer($$renderer, {
								open,
								class: 'w-[400px]',
								children: ($$renderer) => {
									$$renderer.push(`<div class="p-2">`);

									MenuField($$renderer, {
										options: [
											{ label: 'Cut', value: 'cut' },
											{ label: 'Copy', value: 'copy' },
											{ label: 'Paste', value: 'paste' }
										]
									});

									$$renderer.push(`<!----></div>`);
								},

								$$slots: {
									default: true,
									actions: ($$renderer) => {
										$$renderer.push(`<div slot="actions">`);

										Button($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Close`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									}
								}
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Prompt if changed</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: (
							$$renderer,
							{
								on: showConfirmation,
								toggleOn: openConfirmation,
								toggleOff: closeConfirmation
							}
						) => {
							Toggle($$renderer, {
								children: $.invalid_default_snippet,
								$$slots: {
									default: (
										$$renderer,
										{ on: showDrawer, toggleOn: openDrawer, toggleOff: closeDrawer }
									) => {
										Drawer($$renderer, {
											open: showDrawer,
											persistent: isChanged,
											class: 'w-[400px]',
											children: ($$renderer) => {
												$$renderer.push(`<div class="p-4"><div class="grid grid-cols-[1fr,auto] items-center">Changed `);

												Switch($$renderer, {
													get checked() {
														return isChanged;
													},

													set checked($$value) {
														isChanged = $$value;
														$$settled = false;
													}
												});

												$$renderer.push(`<!----></div></div>`);
											},

											$$slots: {
												default: true,
												actions: ($$renderer) => {
													$$renderer.push(`<div slot="actions">`);

													Button($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Close`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div>`);
												}
											}
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Click me`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Dialog($$renderer, {
											open: showConfirmation,
											children: ($$renderer) => {
												$$renderer.push(`<div class="px-6 py-3">You will lose any unsaved changes</div>`);
											},

											$$slots: {
												default: true,
												title: ($$renderer) => {
													$$renderer.push(`<div slot="title">Are you sure?</div>`);
												},

												actions: ($$renderer) => {
													$$renderer.push(`<div slot="actions">`);

													Button($$renderer, {
														variant: 'fill',
														color: 'danger',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Yes, lose changes`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Button($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----></div>`);
												}
											}
										});

										$$renderer.push(`<!---->`);
									}
								}
							});
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Custom portal target</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div id="portal"></div> `);

				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							Drawer($$renderer, {
								open,
								placement: 'bottom',
								class: 'h-64',
								portal: { target: '#portal' },
								children: ($$renderer) => {
									$$renderer.push(`<h1>Contents</h1>`);
								},

								$$slots: {
									default: true,
									actions: ($$renderer) => {
										$$renderer.push(`<div slot="actions">`);

										Button($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Close`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									}
								}
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Click me`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}
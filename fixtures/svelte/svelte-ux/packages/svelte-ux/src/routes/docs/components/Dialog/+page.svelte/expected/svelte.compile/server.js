import * as $ from 'svelte/internal/server';
import { mdiTrashCan } from '@mdi/js';
import { Button, Dialog, TextField, Toggle } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	let open = false;
	let openAsync = false;
	let loading = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Show Dialog`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Dialog($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Basic (with Toggle)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Async</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Show Dialog`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Dialog($$renderer, {
					loading,
					persistent: loading,
					get open() {
						return openAsync;
					},

					set open($$value) {
						openAsync = $$value;
						$$settled = false;
					},

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
									$$renderer.push(`<!---->Save`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Async (with Toggle)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggleOn, toggleOff }) => {
							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Show Dialog`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Dialog($$renderer, {
								open,
								loading,
								persistent: loading,
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
												$$renderer.push(`<!---->Save`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Confirmation dialog</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { on: open, toggle, toggleOff }) => {
							Button($$renderer, {
								icon: mdiTrashCan,
								color: 'danger',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Delete`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Dialog($$renderer, {
								open,
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-6 py-3">This will permanently delete the item and can not be undone.</div>`);
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
												$$renderer.push(`<!---->Yes, delete item`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Dialog in Dialog</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Toggle($$renderer, {
					children: $.invalid_default_snippet,
					$$slots: {
						default: (
							$$renderer,
							{
								on: open,
								toggleOn: toggleDeleteOn,
								toggleOff: toggleDeleteOff
							}
						) => {
							Button($$renderer, {
								icon: mdiTrashCan,
								color: 'danger',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Delete`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Dialog($$renderer, {
								open,
								children: ($$renderer) => {
									$$renderer.push(`<div class="px-6 py-3">This will permanently delete the item</div>`);
								},

								$$slots: {
									default: true,
									title: ($$renderer) => {
										$$renderer.push(`<div slot="title">Delete this item ?</div>`);
									},

									actions: ($$renderer) => {
										$$renderer.push(`<div slot="actions">`);

										Toggle($$renderer, {
											children: $.invalid_default_snippet,
											$$slots: {
												default: (
													$$renderer,
													{
														on: openSecond,
														toggle: toggleConfirm,
														toggleOff: toggleConfirmOff
													}
												) => {
													Button($$renderer, {
														icon: mdiTrashCan,
														color: 'danger',
														variant: 'fill',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Yes`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!----> `);

													Dialog($$renderer, {
														open: openSecond,
														children: ($$renderer) => {
															$$renderer.push(`<div class="px-6 py-3">This will permanently delete the item and can not be undone.</div>`);
														},

														$$slots: {
															default: true,
															title: ($$renderer) => {
																$$renderer.push(`<div slot="title">Are you <b>REALLY</b> sure?</div>`);
															},

															actions: ($$renderer) => {
																$$renderer.push(`<div slot="actions">`);

																Button($$renderer, {
																	variant: 'fill',
																	color: 'danger',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Yes, delete item`);
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
							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Show Dialog`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Dialog($$renderer, {
								open,
								loading: true,
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
							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Show Dialog`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Dialog($$renderer, {
								open,
								persistent: true,
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
												$$renderer.push(`<!---->Yes, close this dialog`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->No, keep this dialog open`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>With close slot prop</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
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
								persistent: true,
								children: $.invalid_default_snippet,
								$$slots: {
									default: ($$renderer, { close }) => {
										$$renderer.push(`<div class="p-5"><div class="mb-4">The <span class="font-mono bg-primary-700/20 text-primary-500 font-medium px-1 py-0.5 rounded">close</span> method is available on every slot.</div> <div class="grid gap-2">`);

										Button($$renderer, {
											variant: 'fill',
											color: 'primary',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Attempt close: <code>close()</code>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Button($$renderer, {
											variant: 'fill',
											color: 'primary',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Force close: <code>close({ force: true })</code>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div></div>`);
									}
								}
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
							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Show Dialog`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Dialog($$renderer, {
								open,
								children: ($$renderer) => {
									$$renderer.push(`<div class="p-2">`);
									TextField($$renderer, { label: 'Age', autofocus: true });
									$$renderer.push(`<!----></div>`);
								},

								$$slots: {
									default: true,
									title: ($$renderer) => {
										$$renderer.push(`<div slot="title">How old are you?</div>`);
									},

									actions: ($$renderer) => {
										$$renderer.push(`<div slot="actions">`);

										Button($$renderer, {
											variant: 'fill',
											color: 'primary',
											children: ($$renderer) => {
												$$renderer.push(`<!---->OK`);
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
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled action</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
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
											disabled: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Don't touch`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

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

							$$renderer.push(`<!---->`);
						}
					}
				});
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
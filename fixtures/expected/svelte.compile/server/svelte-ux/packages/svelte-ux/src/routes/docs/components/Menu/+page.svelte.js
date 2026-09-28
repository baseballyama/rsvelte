import * as $ from 'svelte/internal/server';
import { mdiMagnify } from '@mdi/js';
import { Button, Dialog, Drawer, Menu, MenuItem, TextField, Toggle } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle, toggleOff }) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click me `);

								Menu($$renderer, {
									open,
									children: ($$renderer) => {
										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Refresh`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Help`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Sign In`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											disabled: true,
											children: ($$renderer) => {
												$$renderer.push(`<!---->Disabled`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>Explicit close</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle, toggleOff }) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click me `);

								Menu($$renderer, {
									open,
									explicitClose: true,
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$renderer, { close }) => {
											$$renderer.push(`<div class="p-2">`);

											TextField($$renderer, {
												icon: mdiMagnify,
												placeholder: 'Search',
												class: 'mb-2',
												autofocus: { delay: 50 }
											});

											$$renderer.push(`<!----> `);

											MenuItem($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Refresh`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											MenuItem($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Settings`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											MenuItem($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Help`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											MenuItem($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Sign In`);
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
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>with Dialog and Drawer</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: (
						$$renderer,
						{ on: open, toggle: toggleMenu, toggleOff: closeMenu }
					) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click me `);

								Menu($$renderer, {
									open,
									explicitClose: true,
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$renderer, { close }) => {
											MenuItem($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Normal item`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Toggle($$renderer, {
												children: $.invalid_default_snippet,
												$$slots: {
													default: ($$renderer, { on: open, toggle: toggleDialog }) => {
														MenuItem($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Open Dialog...`);
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

											$$renderer.push(`<!----> `);

											Toggle($$renderer, {
												children: $.invalid_default_snippet,
												$$slots: {
													default: ($$renderer, { on: open, toggle: toggleDialog }) => {
														MenuItem($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Open Persistent Dialog...`);
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

											$$renderer.push(`<!----> `);

											Toggle($$renderer, {
												children: $.invalid_default_snippet,
												$$slots: {
													default: ($$renderer, { on: open, toggle: toggleDrawer, toggleOff }) => {
														MenuItem($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Open Drawer...`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Drawer($$renderer, {
															open,
															class: 'w-[400px]',
															$$slots: {
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

														$$renderer.push(`<!---->`);
													}
												}
											});

											$$renderer.push(`<!----> `);

											Toggle($$renderer, {
												children: $.invalid_default_snippet,
												$$slots: {
													default: ($$renderer, { on: open, toggle: toggleDrawer, toggleOff }) => {
														MenuItem($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Open Persistent Drawer...`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Drawer($$renderer, {
															open,
															class: 'w-[400px]',
															persistent: true,
															$$slots: {
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

														$$renderer.push(`<!---->`);
													}
												}
											});

											$$renderer.push(`<!----> `);

											Toggle($$renderer, {
												children: $.invalid_default_snippet,
												$$slots: {
													default: ($$renderer, { on: open, toggle: toggleDrawer, toggleOff }) => {
														MenuItem($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Open Drawer with another Menu...`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Drawer($$renderer, {
															open,
															class: 'w-[400px]',
															children: ($$renderer) => {
																Toggle($$renderer, {
																	children: $.invalid_default_snippet,
																	$$slots: {
																		default: ($$renderer, { on: open, toggle, toggleOff }) => {
																			$$renderer.push(`<span>`);

																			Button($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Click me`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!----> `);

																			Menu($$renderer, {
																				open,
																				children: ($$renderer) => {
																					MenuItem($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Refresh`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push(`<!----> `);

																					MenuItem($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Settings`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push(`<!----> `);

																					MenuItem($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Help`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push(`<!----> `);

																					MenuItem($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Sign In`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push(`<!---->`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!----></span>`);
																		}
																	}
																});
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

														$$renderer.push(`<!---->`);
													}
												}
											});

											$$renderer.push(`<!---->`);
										}
									}
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>matchWidth</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle, toggleOff }) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click me `);

								Menu($$renderer, {
									open,
									matchWidth: true,
									children: ($$renderer) => {
										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Refresh`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Help`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Sign In`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>autoPlacement</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle, toggleOff }) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click me `);

								Menu($$renderer, {
									open,
									autoPlacement: true,
									children: ($$renderer) => {
										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Refresh`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Help`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Sign In`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>explicit placement</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle, toggleOff }) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click me `);

								Menu($$renderer, {
									open,
									placement: 'right-start',
									children: ($$renderer) => {
										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Refresh`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Help`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Sign In`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>disableTransition</h2> <h3>Useful when menu will exceed window and need repositioned.</h3> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle, toggleOff }) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click me `);

								Menu($$renderer, {
									open,
									disableTransition: true,
									children: ($$renderer) => {
										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Refresh`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Help`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Sign In`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <h2>transition params</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle, toggleOff }) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click me `);

								Menu($$renderer, {
									open,
									transitionParams: { duration: 2000 },
									children: ($$renderer) => {
										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Refresh`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Settings`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Help`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										MenuItem($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Sign In`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}
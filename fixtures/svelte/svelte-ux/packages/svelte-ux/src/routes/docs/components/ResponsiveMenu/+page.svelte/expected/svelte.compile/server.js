import * as $ from 'svelte/internal/server';
import { mdiMagnify } from '@mdi/js';

import {
	Button,
	Dialog,
	Drawer,
	MenuItem,
	ResponsiveMenu,
	TextField,
	Toggle,
	Settings
} from 'svelte-ux';

import Preview from '$lib/components/Preview.svelte';
import Blockquote from '$docs/Blockquote.svelte';

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

								ResponsiveMenu($$renderer, {
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

	$$renderer.push(`<!----> <h2>Field within</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle, toggleOff }) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click me `);

								ResponsiveMenu($$renderer, {
									open,
									menuProps: { explicitClose: true },
									children: ($$renderer) => {
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

								ResponsiveMenu($$renderer, {
									open,
									children: ($$renderer) => {
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

															actions: ($$renderer, { close }) => {
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
															actions: ($$renderer, { close }) => {
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

																		ResponsiveMenu($$renderer, {
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

	$$renderer.push(`<!----> <h2>menuProps</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle, toggleOff }) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click me `);

								ResponsiveMenu($$renderer, {
									open,
									menuProps: { autoPlacement: true, matchWidth: true },
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

	$$renderer.push(`<!----> <h2>drawerProps</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Toggle($$renderer, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { on: open, toggle, toggleOff }) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Click me `);

								ResponsiveMenu($$renderer, {
									open,
									drawerProps: { class: 'rounded-t-lg pb-[env(safe-area-inset-bottom)]' },
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

	$$renderer.push(`<!----> `);

	Blockquote($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->\`env()\` <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/env#usage" target="_blank">requires</a> setting \`viewport-fit=cover\` within \`viewport\` meta tag`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> See also `);

	Button($$renderer, {
		variant: 'text',
		color: 'primary',
		href: 'https://github.com/mvllow/tailwindcss-safe-area',
		target: '_blank',
		children: ($$renderer) => {
			$$renderer.push(`<!---->tailwind-css-safe-area`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> to add \`pb-safe\` util class <h2>Settings example</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			Settings($$renderer, {
				components: {
					Drawer: {
						classes: '[&.ResponsiveMenu]:rounded-t-xl [&.ResponsiveMenu]:py-2 [&.ResponsiveMenu]:pb-[env(safe-area-inset-bottom)]'
					}
				},

				children: ($$renderer) => {
					Toggle($$renderer, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$renderer, { on: open, toggle, toggleOff }) => {
								Button($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Click me `);

										ResponsiveMenu($$renderer, {
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}
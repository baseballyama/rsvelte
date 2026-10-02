import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`Click me <!>`, 1);
var root_2 = $.from_html(`<div class="p-2"><!> <!> <!> <!> <!></div>`);
var root_3 = $.from_html(`<div slot="title">Are you sure you want to do that?</div>`);
var root_4 = $.from_html(`<div slot="actions"><!></div>`);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_7 = $.from_html(`<span><!> <!></span>`);
var root_8 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_9 = $.from_html(`\`env()\` <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/env#usage" target="_blank">requires</a> setting \`viewport-fit=cover\` within \`viewport\` meta tag`, 1);
var root_10 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Field within</h2> <!> <h2>with Dialog and Drawer</h2> <!> <h2>menuProps</h2> <!> <h2>drawerProps</h2> <!> <!> See also <!> to add \`pb-safe\` util class <h2>Settings example</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root_10();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);

						Button($$anchor, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_3 = root_1();
								var node_1 = $.sibling($.first_child(fragment_3));

								ResponsiveMenu(node_1, {
									get open() {
										return $.get(open);
									},

									$$events: {
										close: function (...$$args) {
											$.get(toggleOff)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_2 = $.first_child(fragment_4);

										MenuItem(node_2, {
											$$events: {
												click: function (...$$args) {
													$.get(toggleOff)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Refresh');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});

										var node_3 = $.sibling(node_2, 2);

										MenuItem(node_3, {
											$$events: {
												click: function (...$$args) {
													$.get(toggleOff)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Settings');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});

										var node_4 = $.sibling(node_3, 2);

										MenuItem(node_4, {
											$$events: {
												click: function (...$$args) {
													$.get(toggleOff)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Help');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});

										var node_5 = $.sibling(node_4, 2);

										MenuItem(node_5, {
											$$events: {
												click: function (...$$args) {
													$.get(toggleOff)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Sign In');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});

										var node_6 = $.sibling(node_5, 2);

										MenuItem(node_6, {
											disabled: true,
											$$events: {
												click: function (...$$args) {
													$.get(toggleOff)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Disabled');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);

						Button($$anchor, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_7 = root_1();
								var node_8 = $.sibling($.first_child(fragment_7));

								ResponsiveMenu(node_8, {
									get open() {
										return $.get(open);
									},
									menuProps: { explicitClose: true },
									$$events: {
										close: function (...$$args) {
											$.get(toggleOff)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										var div = root_2();
										var node_9 = $.child(div);

										TextField(node_9, {
											get icon() {
												return mdiMagnify;
											},
											placeholder: 'Search',
											class: 'mb-2',
											autofocus: { delay: 50 }
										});

										var node_10 = $.sibling(node_9, 2);

										MenuItem(node_10, {
											$$events: {
												click: function (...$$args) {
													$.get(toggle)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Refresh');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});

										var node_11 = $.sibling(node_10, 2);

										MenuItem(node_11, {
											$$events: {
												click: function (...$$args) {
													$.get(toggle)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Settings');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});

										var node_12 = $.sibling(node_11, 2);

										MenuItem(node_12, {
											$$events: {
												click: function (...$$args) {
													$.get(toggle)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Help');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});

										var node_13 = $.sibling(node_12, 2);

										MenuItem(node_13, {
											$$events: {
												click: function (...$$args) {
													$.get(toggle)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('Sign In');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});

										$.reset(div);
										$.append($$anchor, div);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_7, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggleMenu = $.derived(() => $$slotProps.toggle);
						const closeMenu = $.derived(() => $$slotProps.toggleOff);

						Button($$anchor, {
							$$events: {
								click: function (...$$args) {
									$.get(toggleMenu)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_10 = root_1();
								var node_15 = $.sibling($.first_child(fragment_10));

								ResponsiveMenu(node_15, {
									get open() {
										return $.get(open);
									},

									$$events: {
										close: function (...$$args) {
											$.get(closeMenu)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_11 = root_8();
										var node_16 = $.first_child(fragment_11);

										MenuItem(node_16, {
											$$events: { click: close },
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Normal item');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});

										var node_17 = $.sibling(node_16, 2);

										Toggle(node_17, {
											$$events: {
												toggleOff: function (...$$args) {
													$.get(closeMenu)?.apply(this, $$args);
												}
											},
											children: $.invalid_default_snippet,
											$$slots: {
												default: ($$anchor, $$slotProps) => {
													const open = $.derived(() => $$slotProps.on);
													const toggleDialog = $.derived(() => $$slotProps.toggle);
													var fragment_12 = root_5();
													var node_18 = $.first_child(fragment_12);

													MenuItem(node_18, {
														$$events: {
															click: function (...$$args) {
																$.get(toggleDialog)?.apply(this, $$args);
															}
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('Open Dialog...');

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});

													var node_19 = $.sibling(node_18, 2);

													Dialog(node_19, {
														get open() {
															return $.get(open);
														},

														$$events: {
															close: function (...$$args) {
																$.get(toggleDialog)?.apply(this, $$args);
															}
														},
														$$slots: {
															title: ($$anchor, $$slotProps) => {
																var div_1 = root_3();

																$.append($$anchor, div_1);
															},

															actions: ($$anchor, $$slotProps) => {
																var div_2 = root_4();
																var node_20 = $.child(div_2);

																Button(node_20, {
																	variant: 'fill',
																	color: 'primary',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_11 = $.text('Close');

																		$.append($$anchor, text_11);
																	},
																	$$slots: { default: true }
																});

																$.reset(div_2);
																$.append($$anchor, div_2);
															}
														}
													});

													$.append($$anchor, fragment_12);
												}
											}
										});

										var node_21 = $.sibling(node_17, 2);

										Toggle(node_21, {
											$$events: {
												toggleOff: function (...$$args) {
													$.get(closeMenu)?.apply(this, $$args);
												}
											},
											children: $.invalid_default_snippet,
											$$slots: {
												default: ($$anchor, $$slotProps) => {
													const open = $.derived(() => $$slotProps.on);
													const toggleDialog = $.derived(() => $$slotProps.toggle);
													var fragment_13 = root_5();
													var node_22 = $.first_child(fragment_13);

													MenuItem(node_22, {
														$$events: {
															click: function (...$$args) {
																$.get(toggleDialog)?.apply(this, $$args);
															}
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_12 = $.text('Open Persistent Dialog...');

															$.append($$anchor, text_12);
														},
														$$slots: { default: true }
													});

													var node_23 = $.sibling(node_22, 2);

													Dialog(node_23, {
														get open() {
															return $.get(open);
														},
														persistent: true,
														$$events: {
															close: function (...$$args) {
																$.get(toggleDialog)?.apply(this, $$args);
															}
														},
														$$slots: {
															title: ($$anchor, $$slotProps) => {
																var div_3 = root_3();

																$.append($$anchor, div_3);
															},

															actions: ($$anchor, $$slotProps) => {
																const close = $.derived(() => $$slotProps.close);
																var div_4 = root_4();
																var node_24 = $.child(div_4);

																Button(node_24, {
																	variant: 'fill',
																	color: 'primary',
																	$$events: { click: () => $.get(close)({ force: true }) },
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_13 = $.text('Close');

																		$.append($$anchor, text_13);
																	},
																	$$slots: { default: true }
																});

																$.reset(div_4);
																$.append($$anchor, div_4);
															}
														}
													});

													$.append($$anchor, fragment_13);
												}
											}
										});

										var node_25 = $.sibling(node_21, 2);

										Toggle(node_25, {
											$$events: {
												toggleOff: function (...$$args) {
													$.get(closeMenu)?.apply(this, $$args);
												}
											},
											children: $.invalid_default_snippet,
											$$slots: {
												default: ($$anchor, $$slotProps) => {
													const open = $.derived(() => $$slotProps.on);
													const toggleDrawer = $.derived(() => $$slotProps.toggle);
													const toggleOff = $.derived(() => $$slotProps.toggleOff);
													var fragment_14 = root_5();
													var node_26 = $.first_child(fragment_14);

													MenuItem(node_26, {
														$$events: {
															click: function (...$$args) {
																$.get(toggleDrawer)?.apply(this, $$args);
															}
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_14 = $.text('Open Drawer...');

															$.append($$anchor, text_14);
														},
														$$slots: { default: true }
													});

													var node_27 = $.sibling(node_26, 2);

													Drawer(node_27, {
														get open() {
															return $.get(open);
														},
														class: 'w-[400px]',
														$$events: {
															close: function (...$$args) {
																$.get(toggleOff)?.apply(this, $$args);
															}
														},
														$$slots: {
															actions: ($$anchor, $$slotProps) => {
																var div_5 = root_4();
																var node_28 = $.child(div_5);

																Button(node_28, {
																	$$events: {
																		click: function (...$$args) {
																			$.get(toggleOff)?.apply(this, $$args);
																		}
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_15 = $.text('Close');

																		$.append($$anchor, text_15);
																	},
																	$$slots: { default: true }
																});

																$.reset(div_5);
																$.append($$anchor, div_5);
															}
														}
													});

													$.append($$anchor, fragment_14);
												}
											}
										});

										var node_29 = $.sibling(node_25, 2);

										Toggle(node_29, {
											$$events: {
												toggleOff: function (...$$args) {
													$.get(closeMenu)?.apply(this, $$args);
												}
											},
											children: $.invalid_default_snippet,
											$$slots: {
												default: ($$anchor, $$slotProps) => {
													const open = $.derived(() => $$slotProps.on);
													const toggleDrawer = $.derived(() => $$slotProps.toggle);
													const toggleOff = $.derived(() => $$slotProps.toggleOff);
													var fragment_15 = root_5();
													var node_30 = $.first_child(fragment_15);

													MenuItem(node_30, {
														$$events: {
															click: function (...$$args) {
																$.get(toggleDrawer)?.apply(this, $$args);
															}
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_16 = $.text('Open Persistent Drawer...');

															$.append($$anchor, text_16);
														},
														$$slots: { default: true }
													});

													var node_31 = $.sibling(node_30, 2);

													Drawer(node_31, {
														get open() {
															return $.get(open);
														},
														class: 'w-[400px]',
														persistent: true,
														$$events: {
															close: function (...$$args) {
																$.get(toggleOff)?.apply(this, $$args);
															}
														},
														$$slots: {
															actions: ($$anchor, $$slotProps) => {
																const close = $.derived(() => $$slotProps.close);
																var div_6 = root_4();
																var node_32 = $.child(div_6);

																Button(node_32, {
																	$$events: { click: () => $.get(close)({ force: true }) },
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_17 = $.text('Close');

																		$.append($$anchor, text_17);
																	},
																	$$slots: { default: true }
																});

																$.reset(div_6);
																$.append($$anchor, div_6);
															}
														}
													});

													$.append($$anchor, fragment_15);
												}
											}
										});

										var node_33 = $.sibling(node_29, 2);

										Toggle(node_33, {
											$$events: {
												toggleOff: function (...$$args) {
													$.get(closeMenu)?.apply(this, $$args);
												}
											},
											children: $.invalid_default_snippet,
											$$slots: {
												default: ($$anchor, $$slotProps) => {
													const open = $.derived(() => $$slotProps.on);
													const toggleDrawer = $.derived(() => $$slotProps.toggle);
													const toggleOff = $.derived(() => $$slotProps.toggleOff);
													var fragment_16 = root_5();
													var node_34 = $.first_child(fragment_16);

													MenuItem(node_34, {
														$$events: {
															click: function (...$$args) {
																$.get(toggleDrawer)?.apply(this, $$args);
															}
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_18 = $.text('Open Drawer with another Menu...');

															$.append($$anchor, text_18);
														},
														$$slots: { default: true }
													});

													var node_35 = $.sibling(node_34, 2);

													Drawer(node_35, {
														get open() {
															return $.get(open);
														},
														class: 'w-[400px]',
														$$events: {
															close: function (...$$args) {
																$.get(toggleOff)?.apply(this, $$args);
															}
														},

														children: ($$anchor, $$slotProps) => {
															Toggle($$anchor, {
																children: $.invalid_default_snippet,
																$$slots: {
																	default: ($$anchor, $$slotProps) => {
																		const open = $.derived(() => $$slotProps.on);
																		const toggle = $.derived(() => $$slotProps.toggle);
																		const toggleOff = $.derived(() => $$slotProps.toggleOff);
																		var span = root_7();
																		var node_36 = $.child(span);

																		Button(node_36, {
																			$$events: {
																				click: function (...$$args) {
																					$.get(toggle)?.apply(this, $$args);
																				}
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_19 = $.text('Click me');

																				$.append($$anchor, text_19);
																			},
																			$$slots: { default: true }
																		});

																		var node_37 = $.sibling(node_36, 2);

																		ResponsiveMenu(node_37, {
																			get open() {
																				return $.get(open);
																			},

																			$$events: {
																				close: function (...$$args) {
																					$.get(toggleOff)?.apply(this, $$args);
																				}
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_18 = root_6();
																				var node_38 = $.first_child(fragment_18);

																				MenuItem(node_38, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_20 = $.text('Refresh');

																						$.append($$anchor, text_20);
																					},
																					$$slots: { default: true }
																				});

																				var node_39 = $.sibling(node_38, 2);

																				MenuItem(node_39, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_21 = $.text('Settings');

																						$.append($$anchor, text_21);
																					},
																					$$slots: { default: true }
																				});

																				var node_40 = $.sibling(node_39, 2);

																				MenuItem(node_40, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_22 = $.text('Help');

																						$.append($$anchor, text_22);
																					},
																					$$slots: { default: true }
																				});

																				var node_41 = $.sibling(node_40, 2);

																				MenuItem(node_41, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_23 = $.text('Sign In');

																						$.append($$anchor, text_23);
																					},
																					$$slots: { default: true }
																				});

																				$.append($$anchor, fragment_18);
																			},
																			$$slots: { default: true }
																		});

																		$.reset(span);
																		$.append($$anchor, span);
																	}
																}
															});
														},

														$$slots: {
															default: true,
															actions: ($$anchor, $$slotProps) => {
																var div_7 = root_4();
																var node_42 = $.child(div_7);

																Button(node_42, {
																	$$events: {
																		click: function (...$$args) {
																			$.get(toggleOff)?.apply(this, $$args);
																		}
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_24 = $.text('Close');

																		$.append($$anchor, text_24);
																	},
																	$$slots: { default: true }
																});

																$.reset(div_7);
																$.append($$anchor, div_7);
															}
														}
													});

													$.append($$anchor, fragment_16);
												}
											}
										});

										$.append($$anchor, fragment_11);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_43 = $.sibling(node_14, 4);

	Preview(node_43, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);

						Button($$anchor, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_21 = root_1();
								var node_44 = $.sibling($.first_child(fragment_21));

								ResponsiveMenu(node_44, {
									get open() {
										return $.get(open);
									},
									menuProps: { autoPlacement: true, matchWidth: true },
									$$events: {
										close: function (...$$args) {
											$.get(toggleOff)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_22 = root_6();
										var node_45 = $.first_child(fragment_22);

										MenuItem(node_45, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_25 = $.text('Refresh');

												$.append($$anchor, text_25);
											},
											$$slots: { default: true }
										});

										var node_46 = $.sibling(node_45, 2);

										MenuItem(node_46, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_26 = $.text('Settings');

												$.append($$anchor, text_26);
											},
											$$slots: { default: true }
										});

										var node_47 = $.sibling(node_46, 2);

										MenuItem(node_47, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_27 = $.text('Help');

												$.append($$anchor, text_27);
											},
											$$slots: { default: true }
										});

										var node_48 = $.sibling(node_47, 2);

										MenuItem(node_48, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_28 = $.text('Sign In');

												$.append($$anchor, text_28);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_22);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_21);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_49 = $.sibling(node_43, 4);

	Preview(node_49, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);

						Button($$anchor, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_25 = root_1();
								var node_50 = $.sibling($.first_child(fragment_25));

								ResponsiveMenu(node_50, {
									get open() {
										return $.get(open);
									},
									drawerProps: { class: 'rounded-t-lg pb-[env(safe-area-inset-bottom)]' },
									$$events: {
										close: function (...$$args) {
											$.get(toggleOff)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_26 = root_6();
										var node_51 = $.first_child(fragment_26);

										MenuItem(node_51, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_29 = $.text('Refresh');

												$.append($$anchor, text_29);
											},
											$$slots: { default: true }
										});

										var node_52 = $.sibling(node_51, 2);

										MenuItem(node_52, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_30 = $.text('Settings');

												$.append($$anchor, text_30);
											},
											$$slots: { default: true }
										});

										var node_53 = $.sibling(node_52, 2);

										MenuItem(node_53, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_31 = $.text('Help');

												$.append($$anchor, text_31);
											},
											$$slots: { default: true }
										});

										var node_54 = $.sibling(node_53, 2);

										MenuItem(node_54, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_32 = $.text('Sign In');

												$.append($$anchor, text_32);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_26);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_25);
							},
							$$slots: { default: true }
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_55 = $.sibling(node_49, 2);

	Blockquote(node_55, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_27 = root_9();

			$.next(2);
			$.append($$anchor, fragment_27);
		},
		$$slots: { default: true }
	});

	var node_56 = $.sibling(node_55, 2);

	Button(node_56, {
		variant: 'text',
		color: 'primary',
		href: 'https://github.com/mvllow/tailwindcss-safe-area',
		target: '_blank',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_33 = $.text('tailwind-css-safe-area');

			$.append($$anchor, text_33);
		},
		$$slots: { default: true }
	});

	var node_57 = $.sibling(node_56, 4);

	Preview(node_57, {
		children: ($$anchor, $$slotProps) => {
			Settings($$anchor, {
				components: {
					Drawer: {
						classes: '[&.ResponsiveMenu]:rounded-t-xl [&.ResponsiveMenu]:py-2 [&.ResponsiveMenu]:pb-[env(safe-area-inset-bottom)]'
					}
				},

				children: ($$anchor, $$slotProps) => {
					Toggle($$anchor, {
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const open = $.derived(() => $$slotProps.on);
								const toggle = $.derived(() => $$slotProps.toggle);
								const toggleOff = $.derived(() => $$slotProps.toggleOff);

								Button($$anchor, {
									$$events: {
										click: function (...$$args) {
											$.get(toggle)?.apply(this, $$args);
										}
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_31 = root_1();
										var node_58 = $.sibling($.first_child(fragment_31));

										ResponsiveMenu(node_58, {
											get open() {
												return $.get(open);
											},

											$$events: {
												close: function (...$$args) {
													$.get(toggleOff)?.apply(this, $$args);
												}
											},

											children: ($$anchor, $$slotProps) => {
												var fragment_32 = root();
												var node_59 = $.first_child(fragment_32);

												MenuItem(node_59, {
													$$events: {
														click: function (...$$args) {
															$.get(toggleOff)?.apply(this, $$args);
														}
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_34 = $.text('Refresh');

														$.append($$anchor, text_34);
													},
													$$slots: { default: true }
												});

												var node_60 = $.sibling(node_59, 2);

												MenuItem(node_60, {
													$$events: {
														click: function (...$$args) {
															$.get(toggleOff)?.apply(this, $$args);
														}
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_35 = $.text('Settings');

														$.append($$anchor, text_35);
													},
													$$slots: { default: true }
												});

												var node_61 = $.sibling(node_60, 2);

												MenuItem(node_61, {
													$$events: {
														click: function (...$$args) {
															$.get(toggleOff)?.apply(this, $$args);
														}
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_36 = $.text('Help');

														$.append($$anchor, text_36);
													},
													$$slots: { default: true }
												});

												var node_62 = $.sibling(node_61, 2);

												MenuItem(node_62, {
													$$events: {
														click: function (...$$args) {
															$.get(toggleOff)?.apply(this, $$args);
														}
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_37 = $.text('Sign In');

														$.append($$anchor, text_37);
													},
													$$slots: { default: true }
												});

												var node_63 = $.sibling(node_62, 2);

												MenuItem(node_63, {
													disabled: true,
													$$events: {
														click: function (...$$args) {
															$.get(toggleOff)?.apply(this, $$args);
														}
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_38 = $.text('Disabled');

														$.append($$anchor, text_38);
													},
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_32);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_31);
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

	$.append($$anchor, fragment);
}
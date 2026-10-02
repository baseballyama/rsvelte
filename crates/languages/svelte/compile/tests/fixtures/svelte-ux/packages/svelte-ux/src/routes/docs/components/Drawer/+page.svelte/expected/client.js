import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dialog, Drawer, MenuField, Switch, TextField, Toggle } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<h1>Contents</h1>`);
var root_1 = $.from_html(`<div slot="actions"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="p-2"><!></div>`);
var root_5 = $.from_html(`<div slot="title">Are you sure you want to do that?</div>`);
var root_6 = $.from_html(`<div class="p-4"><div class="grid grid-cols-[1fr,auto] items-center">Changed <!></div></div>`);
var root_7 = $.from_html(`<div class="px-6 py-3">You will lose any unsaved changes</div>`);
var root_8 = $.from_html(`<div slot="title">Are you sure?</div>`);
var root_9 = $.from_html(`<div slot="actions"><!> <!></div>`);
var root_10 = $.from_html(`<!> <!> <!>`, 1);
var root_11 = $.from_html(`<div id="portal"></div> <!>`, 1);
var root_12 = $.from_html(`<h1>Examples</h1> <h2>Location</h2> <!> <h2>Persistent</h2> <!> <h2>Loading</h2> <!> <h2>With autofocus TextField</h2> <!> <h2>Dialog within Drawer</h2> <!> <h2>MenuField within Drawer</h2> <!> <h2>Prompt if changed</h2> <!> <h2>Custom portal target</h2> <!>`, 1);

export default function _page($$anchor) {
	let leftOpen = false;
	let rightOpen = false;
	let topOpen = false;
	let bottomOpen = false;
	let isChanged = false;
	var fragment = root_12();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			Drawer(node_1, {
				placement: 'top',
				class: 'h-64',
				get open() {
					return topOpen;
				},

				set open($$value) {
					topOpen = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var h1 = root();

					$.append($$anchor, h1);
				},

				$$slots: {
					default: true,
					actions: ($$anchor, $$slotProps) => {
						var div = root_1();
						var node_2 = $.child(div);

						Button(node_2, {
							$$events: { click: () => topOpen = false },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Close');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						$.reset(div);
						$.append($$anchor, div);
					}
				}
			});

			var node_3 = $.sibling(node_1, 2);

			Button(node_3, {
				$$events: { click: () => topOpen = true },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Top');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Drawer(node_4, {
				placement: 'bottom',
				class: 'h-64',
				get open() {
					return bottomOpen;
				},

				set open($$value) {
					bottomOpen = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var h1_1 = root();

					$.append($$anchor, h1_1);
				},

				$$slots: {
					default: true,
					actions: ($$anchor, $$slotProps) => {
						var div_1 = root_1();
						var node_5 = $.child(div_1);

						Button(node_5, {
							$$events: { click: () => bottomOpen = false },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Close');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						$.reset(div_1);
						$.append($$anchor, div_1);
					}
				}
			});

			var node_6 = $.sibling(node_4, 2);

			Button(node_6, {
				$$events: { click: () => bottomOpen = true },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Bottom');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Drawer(node_7, {
				placement: 'left',
				class: 'w-[400px]',
				get open() {
					return leftOpen;
				},

				set open($$value) {
					leftOpen = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var h1_2 = root();

					$.append($$anchor, h1_2);
				},

				$$slots: {
					default: true,
					actions: ($$anchor, $$slotProps) => {
						var div_2 = root_1();
						var node_8 = $.child(div_2);

						Button(node_8, {
							$$events: { click: () => leftOpen = false },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('Close');

								$.append($$anchor, text_4);
							},
							$$slots: { default: true }
						});

						$.reset(div_2);
						$.append($$anchor, div_2);
					}
				}
			});

			var node_9 = $.sibling(node_7, 2);

			Button(node_9, {
				$$events: { click: () => leftOpen = true },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Left');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Drawer(node_10, {
				placement: 'right',
				class: 'w-[400px]',
				get open() {
					return rightOpen;
				},

				set open($$value) {
					rightOpen = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var h1_3 = root();

					$.append($$anchor, h1_3);
				},

				$$slots: {
					default: true,
					actions: ($$anchor, $$slotProps) => {
						var div_3 = root_1();
						var node_11 = $.child(div_3);

						Button(node_11, {
							$$events: { click: () => rightOpen = false },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Close');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});

						$.reset(div_3);
						$.append($$anchor, div_3);
					}
				}
			});

			var node_12 = $.sibling(node_10, 2);

			Button(node_12, {
				$$events: { click: () => rightOpen = true },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Right');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node, 4);

	Preview(node_13, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_3 = root_3();
						var node_14 = $.first_child(fragment_3);

						Drawer(node_14, {
							get open() {
								return $.get(open);
							},
							persistent: true,
							class: 'w-[400px]',
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var h1_4 = root();

								$.append($$anchor, h1_4);
							},

							$$slots: {
								default: true,
								actions: ($$anchor, $$slotProps) => {
									var div_4 = root_1();
									var node_15 = $.child(div_4);

									Button(node_15, {
										$$events: {
											click: function (...$$args) {
												$.get(toggleOff)?.apply(this, $$args);
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('Close');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});

									$.reset(div_4);
									$.append($$anchor, div_4);
								}
							}
						});

						var node_16 = $.sibling(node_14, 2);

						Button(node_16, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_9 = $.text('Click me');

								$.append($$anchor, text_9);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_13, 4);

	Preview(node_17, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_5 = root_3();
						var node_18 = $.first_child(fragment_5);

						Drawer(node_18, {
							get open() {
								return $.get(open);
							},
							class: 'w-[400px]',
							loading: true,
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var h1_5 = root();

								$.append($$anchor, h1_5);
							},

							$$slots: {
								default: true,
								actions: ($$anchor, $$slotProps) => {
									var div_5 = root_1();
									var node_19 = $.child(div_5);

									Button(node_19, {
										$$events: {
											click: function (...$$args) {
												$.get(toggleOff)?.apply(this, $$args);
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_10 = $.text('Close');

											$.append($$anchor, text_10);
										},
										$$slots: { default: true }
									});

									$.reset(div_5);
									$.append($$anchor, div_5);
								}
							}
						});

						var node_20 = $.sibling(node_18, 2);

						Button(node_20, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_11 = $.text('Click me');

								$.append($$anchor, text_11);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_5);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_21 = $.sibling(node_17, 4);

	Preview(node_21, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_7 = root_3();
						var node_22 = $.first_child(fragment_7);

						Drawer(node_22, {
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
								var div_6 = root_4();
								var node_23 = $.child(div_6);

								TextField(node_23, { autofocus: true });
								$.reset(div_6);
								$.append($$anchor, div_6);
							},

							$$slots: {
								default: true,
								actions: ($$anchor, $$slotProps) => {
									var div_7 = root_1();
									var node_24 = $.child(div_7);

									Button(node_24, {
										$$events: {
											click: function (...$$args) {
												$.get(toggleOff)?.apply(this, $$args);
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_12 = $.text('Close');

											$.append($$anchor, text_12);
										},
										$$slots: { default: true }
									});

									$.reset(div_7);
									$.append($$anchor, div_7);
								}
							}
						});

						var node_25 = $.sibling(node_22, 2);

						Button(node_25, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_13 = $.text('Click me');

								$.append($$anchor, text_13);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_7);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_26 = $.sibling(node_21, 4);

	Preview(node_26, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_9 = root_3();
						var node_27 = $.first_child(fragment_9);

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

							children: ($$anchor, $$slotProps) => {
								var div_8 = root_4();
								var node_28 = $.child(div_8);

								Toggle(node_28, {
									children: $.invalid_default_snippet,
									$$slots: {
										default: ($$anchor, $$slotProps) => {
											const open = $.derived(() => $$slotProps.on);
											const toggle = $.derived(() => $$slotProps.toggle);
											const toggleOff = $.derived(() => $$slotProps.toggleOff);
											var fragment_10 = root_3();
											var node_29 = $.first_child(fragment_10);

											Button(node_29, {
												$$events: {
													click: function (...$$args) {
														$.get(toggle)?.apply(this, $$args);
													}
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_14 = $.text('Show Dialog');

													$.append($$anchor, text_14);
												},
												$$slots: { default: true }
											});

											var node_30 = $.sibling(node_29, 2);

											Dialog(node_30, {
												get open() {
													return $.get(open);
												},

												$$events: {
													close: function (...$$args) {
														$.get(toggleOff)?.apply(this, $$args);
													}
												},
												$$slots: {
													title: ($$anchor, $$slotProps) => {
														var div_9 = root_5();

														$.append($$anchor, div_9);
													},

													actions: ($$anchor, $$slotProps) => {
														var div_10 = root_1();
														var node_31 = $.child(div_10);

														Button(node_31, {
															variant: 'fill',
															color: 'primary',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_15 = $.text('Close');

																$.append($$anchor, text_15);
															},
															$$slots: { default: true }
														});

														$.reset(div_10);
														$.append($$anchor, div_10);
													}
												}
											});

											$.append($$anchor, fragment_10);
										}
									}
								});

								$.reset(div_8);
								$.append($$anchor, div_8);
							},

							$$slots: {
								default: true,
								actions: ($$anchor, $$slotProps) => {
									var div_11 = root_1();
									var node_32 = $.child(div_11);

									Button(node_32, {
										$$events: {
											click: function (...$$args) {
												$.get(toggleOff)?.apply(this, $$args);
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_16 = $.text('Close');

											$.append($$anchor, text_16);
										},
										$$slots: { default: true }
									});

									$.reset(div_11);
									$.append($$anchor, div_11);
								}
							}
						});

						var node_33 = $.sibling(node_27, 2);

						Button(node_33, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_17 = $.text('Click me');

								$.append($$anchor, text_17);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_9);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_34 = $.sibling(node_26, 4);

	Preview(node_34, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_12 = root_3();
						var node_35 = $.first_child(fragment_12);

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
								var div_12 = root_4();
								var node_36 = $.child(div_12);

								MenuField(node_36, {
									options: [
										{ label: 'Cut', value: 'cut' },
										{ label: 'Copy', value: 'copy' },
										{ label: 'Paste', value: 'paste' }
									]
								});

								$.reset(div_12);
								$.append($$anchor, div_12);
							},

							$$slots: {
								default: true,
								actions: ($$anchor, $$slotProps) => {
									var div_13 = root_1();
									var node_37 = $.child(div_13);

									Button(node_37, {
										$$events: {
											click: function (...$$args) {
												$.get(toggleOff)?.apply(this, $$args);
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_18 = $.text('Close');

											$.append($$anchor, text_18);
										},
										$$slots: { default: true }
									});

									$.reset(div_13);
									$.append($$anchor, div_13);
								}
							}
						});

						var node_38 = $.sibling(node_35, 2);

						Button(node_38, {
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

						$.append($$anchor, fragment_12);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_39 = $.sibling(node_34, 4);

	Preview(node_39, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const showConfirmation = $.derived(() => $$slotProps.on);
						const openConfirmation = $.derived(() => $$slotProps.toggleOn);
						const closeConfirmation = $.derived(() => $$slotProps.toggleOff);

						Toggle($$anchor, {
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$anchor, $$slotProps) => {
									const showDrawer = $.derived(() => $$slotProps.on);
									const openDrawer = $.derived(() => $$slotProps.toggleOn);
									const closeDrawer = $.derived(() => $$slotProps.toggleOff);
									var fragment_15 = root_10();
									var node_40 = $.first_child(fragment_15);

									Drawer(node_40, {
										get open() {
											return $.get(showDrawer);
										},

										get persistent() {
											return isChanged;
										},
										class: 'w-[400px]',
										$$events: {
											close: function (...$$args) {
												$.get(closeDrawer)?.apply(this, $$args);
											},

											closeAttempt: function (...$$args) {
												$.get(openConfirmation)?.apply(this, $$args);
											}
										},

										children: ($$anchor, $$slotProps) => {
											var div_14 = root_6();
											var div_15 = $.child(div_14);
											var node_41 = $.sibling($.child(div_15));

											Switch(node_41, {
												get checked() {
													return isChanged;
												},

												set checked($$value) {
													isChanged = $$value;
												}
											});

											$.reset(div_15);
											$.reset(div_14);
											$.append($$anchor, div_14);
										},

										$$slots: {
											default: true,
											actions: ($$anchor, $$slotProps) => {
												var div_16 = root_1();
												var node_42 = $.child(div_16);

												Button(node_42, {
													$$events: {
														click: function (...$$args) {
															(isChanged ? $.get(openConfirmation) : $.get(closeDrawer))?.apply(this, $$args);
														}
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_20 = $.text('Close');

														$.append($$anchor, text_20);
													},
													$$slots: { default: true }
												});

												$.reset(div_16);
												$.append($$anchor, div_16);
											}
										}
									});

									var node_43 = $.sibling(node_40, 2);

									Button(node_43, {
										$$events: {
											click: function (...$$args) {
												$.get(openDrawer)?.apply(this, $$args);
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_21 = $.text('Click me');

											$.append($$anchor, text_21);
										},
										$$slots: { default: true }
									});

									var node_44 = $.sibling(node_43, 2);

									Dialog(node_44, {
										get open() {
											return $.get(showConfirmation);
										},

										$$events: {
											close: function (...$$args) {
												$.get(closeConfirmation)?.apply(this, $$args);
											}
										},

										children: ($$anchor, $$slotProps) => {
											var div_17 = root_7();

											$.append($$anchor, div_17);
										},

										$$slots: {
											default: true,
											title: ($$anchor, $$slotProps) => {
												var div_18 = root_8();

												$.append($$anchor, div_18);
											},

											actions: ($$anchor, $$slotProps) => {
												var div_19 = root_9();
												var node_45 = $.child(div_19);

												Button(node_45, {
													variant: 'fill',
													color: 'danger',
													$$events: {
														click: () => {
															$.get(closeConfirmation)();
															$.get(closeDrawer)();
															isChanged = false;
														}
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_22 = $.text('Yes, lose changes');

														$.append($$anchor, text_22);
													},
													$$slots: { default: true }
												});

												var node_46 = $.sibling(node_45, 2);

												Button(node_46, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_23 = $.text('Cancel');

														$.append($$anchor, text_23);
													},
													$$slots: { default: true }
												});

												$.reset(div_19);
												$.append($$anchor, div_19);
											}
										}
									});

									$.append($$anchor, fragment_15);
								}
							}
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_47 = $.sibling(node_39, 4);

	Preview(node_47, {
		children: ($$anchor, $$slotProps) => {
			var fragment_16 = root_11();
			var node_48 = $.sibling($.first_child(fragment_16), 2);

			Toggle(node_48, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_17 = root_3();
						var node_49 = $.first_child(fragment_17);

						Drawer(node_49, {
							get open() {
								return $.get(open);
							},
							placement: 'bottom',
							class: 'h-64',
							portal: { target: '#portal' },
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var h1_6 = root();

								$.append($$anchor, h1_6);
							},

							$$slots: {
								default: true,
								actions: ($$anchor, $$slotProps) => {
									var div_20 = root_1();
									var node_50 = $.child(div_20);

									Button(node_50, {
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

									$.reset(div_20);
									$.append($$anchor, div_20);
								}
							}
						});

						var node_51 = $.sibling(node_49, 2);

						Button(node_51, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_25 = $.text('Click me');

								$.append($$anchor, text_25);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_17);
					}
				}
			});

			$.append($$anchor, fragment_16);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
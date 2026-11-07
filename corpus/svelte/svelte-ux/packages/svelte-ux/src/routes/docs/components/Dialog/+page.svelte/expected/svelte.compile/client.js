import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiTrashCan } from '@mdi/js';
import { Button, Dialog, TextField, Toggle } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div slot="title">Are you sure you want to do that?</div>`);
var root_1 = $.from_html(`<div slot="actions"><!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div slot="actions"><!> <!></div>`);
var root_4 = $.from_html(`<div class="px-6 py-3">This will permanently delete the item and can not be undone.</div>`);
var root_5 = $.from_html(`<div slot="title">Are you sure?</div>`);
var root_6 = $.from_html(`<div class="px-6 py-3">This will permanently delete the item</div>`);
var root_7 = $.from_html(`<div slot="title">Delete this item ?</div>`);
var root_8 = $.from_html(`<div slot="title">Are you <b>REALLY</b> sure?</div>`);
var root_9 = $.from_html(`Attempt close: <code>close()</code>`, 1);
var root_10 = $.from_html(`Force close: <code></code>`, 1);
var root_11 = $.from_html(`<div class="p-5"><div class="mb-4">The <span class="font-mono bg-primary-700/20 text-primary-500 font-medium px-1 py-0.5 rounded">close</span> method is available on every slot.</div> <div class="grid gap-2"><!> <!></div></div>`);
var root_12 = $.from_html(`<div class="p-2"><!></div>`);
var root_13 = $.from_html(`<div slot="title">How old are you?</div>`);
var root_14 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Basic (with Toggle)</h2> <!> <h2>Async</h2> <!> <h2>Async (with Toggle)</h2> <!> <h2>Confirmation dialog</h2> <!> <h2>Dialog in Dialog</h2> <!> <h2>Loading</h2> <!> <h2>Persistent</h2> <!> <h2>With close slot prop</h2> <!> <h2>With autofocus TextField</h2> <!> <h2>Disabled action</h2> <!>`, 1);

export default function _page($$anchor) {
	let open = false;
	let openAsync = false;
	let loading = false;
	var fragment = root_14();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				$$events: { click: () => open = true },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Show Dialog');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Dialog(node_2, {
				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
				},

				$$slots: {
					title: ($$anchor, $$slotProps) => {
						var div = root();

						$.append($$anchor, div);
					},

					actions: ($$anchor, $$slotProps) => {
						var div_1 = root_1();
						var node_3 = $.child(div_1);

						Button(node_3, {
							variant: 'fill',
							color: 'primary',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Close');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						$.reset(div_1);
						$.append($$anchor, div_1);
					}
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_3 = root_2();
						var node_5 = $.first_child(fragment_3);

						Button(node_5, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('Show Dialog');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_5, 2);

						Dialog(node_6, {
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
									var div_2 = root();

									$.append($$anchor, div_2);
								},

								actions: ($$anchor, $$slotProps) => {
									var div_3 = root_1();
									var node_7 = $.child(div_3);

									Button(node_7, {
										variant: 'fill',
										color: 'primary',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Close');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.reset(div_3);
									$.append($$anchor, div_3);
								}
							}
						});

						$.append($$anchor, fragment_3);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_4, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_2();
			var node_9 = $.first_child(fragment_4);

			Button(node_9, {
				$$events: { click: () => openAsync = true },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Show Dialog');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Dialog(node_10, {
				get loading() {
					return loading;
				},

				get persistent() {
					return loading;
				},

				get open() {
					return openAsync;
				},

				set open($$value) {
					openAsync = $$value;
				},

				$$slots: {
					title: ($$anchor, $$slotProps) => {
						var div_4 = root();

						$.append($$anchor, div_4);
					},

					actions: ($$anchor, $$slotProps) => {
						var div_5 = root_3();
						var node_11 = $.child(div_5);

						Button(node_11, {
							variant: 'fill',
							color: 'primary',
							$$events: {
								click: (e) => {
									// Wait for response before closing (done explicitly)
									e.stopPropagation();

									loading = true;

									setTimeout(
										() => {
											loading = false;
											openAsync = false;
										},
										1000
									);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('Save');

								$.append($$anchor, text_5);
							},
							$$slots: { default: true }
						});

						var node_12 = $.sibling(node_11, 2);

						Button(node_12, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Cancel');

								$.append($$anchor, text_6);
							},
							$$slots: { default: true }
						});

						$.reset(div_5);
						$.append($$anchor, div_5);
					}
				}
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_8, 4);

	Preview(node_13, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggleOn = $.derived(() => $$slotProps.toggleOn);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_6 = root_2();
						var node_14 = $.first_child(fragment_6);

						Button(node_14, {
							$$events: {
								click: function (...$$args) {
									$.get(toggleOn)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_7 = $.text('Show Dialog');

								$.append($$anchor, text_7);
							},
							$$slots: { default: true }
						});

						var node_15 = $.sibling(node_14, 2);

						Dialog(node_15, {
							get open() {
								return $.get(open);
							},

							get loading() {
								return loading;
							},

							get persistent() {
								return loading;
							},

							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},
							$$slots: {
								title: ($$anchor, $$slotProps) => {
									var div_6 = root();

									$.append($$anchor, div_6);
								},

								actions: ($$anchor, $$slotProps) => {
									var div_7 = root_3();
									var node_16 = $.child(div_7);

									Button(node_16, {
										variant: 'fill',
										color: 'primary',
										$$events: {
											click: (e) => {
												// Wait for response before closing (done explicitly)
												e.stopPropagation();

												loading = true;

												setTimeout(
													() => {
														loading = false;
														$.get(toggleOff)();
													},
													1000
												);
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_8 = $.text('Save');

											$.append($$anchor, text_8);
										},
										$$slots: { default: true }
									});

									var node_17 = $.sibling(node_16, 2);

									Button(node_17, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_9 = $.text('Cancel');

											$.append($$anchor, text_9);
										},
										$$slots: { default: true }
									});

									$.reset(div_7);
									$.append($$anchor, div_7);
								}
							}
						});

						$.append($$anchor, fragment_6);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_13, 4);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_8 = root_2();
						var node_19 = $.first_child(fragment_8);

						Button(node_19, {
							get icon() {
								return mdiTrashCan;
							},
							color: 'danger',
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_10 = $.text('Delete');

								$.append($$anchor, text_10);
							},
							$$slots: { default: true }
						});

						var node_20 = $.sibling(node_19, 2);

						Dialog(node_20, {
							get open() {
								return $.get(open);
							},

							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_8 = root_4();

								$.append($$anchor, div_8);
							},

							$$slots: {
								default: true,
								title: ($$anchor, $$slotProps) => {
									var div_9 = root_5();

									$.append($$anchor, div_9);
								},

								actions: ($$anchor, $$slotProps) => {
									var div_10 = root_3();
									var node_21 = $.child(div_10);

									Button(node_21, {
										variant: 'fill',
										color: 'danger',
										$$events: {
											click: () => {
												console.log('Deleting item...');
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_11 = $.text('Yes, delete item');

											$.append($$anchor, text_11);
										},
										$$slots: { default: true }
									});

									var node_22 = $.sibling(node_21, 2);

									Button(node_22, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_12 = $.text('Cancel');

											$.append($$anchor, text_12);
										},
										$$slots: { default: true }
									});

									$.reset(div_10);
									$.append($$anchor, div_10);
								}
							}
						});

						$.append($$anchor, fragment_8);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_23 = $.sibling(node_18, 4);

	Preview(node_23, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggleDeleteOn = $.derived(() => $$slotProps.toggleOn);
						const toggleDeleteOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_10 = root_2();
						var node_24 = $.first_child(fragment_10);

						Button(node_24, {
							get icon() {
								return mdiTrashCan;
							},
							color: 'danger',
							$$events: {
								click: function (...$$args) {
									$.get(toggleDeleteOn)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_13 = $.text('Delete');

								$.append($$anchor, text_13);
							},
							$$slots: { default: true }
						});

						var node_25 = $.sibling(node_24, 2);

						Dialog(node_25, {
							get open() {
								return $.get(open);
							},

							$$events: {
								close: function (...$$args) {
									$.get(toggleDeleteOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_11 = root_6();

								$.append($$anchor, div_11);
							},

							$$slots: {
								default: true,
								title: ($$anchor, $$slotProps) => {
									var div_12 = root_7();

									$.append($$anchor, div_12);
								},

								actions: ($$anchor, $$slotProps) => {
									var div_13 = root_3();
									var node_26 = $.child(div_13);

									Toggle(node_26, {
										children: $.invalid_default_snippet,
										$$slots: {
											default: ($$anchor, $$slotProps) => {
												const openSecond = $.derived(() => $$slotProps.on);
												const toggleConfirm = $.derived(() => $$slotProps.toggle);
												const toggleConfirmOff = $.derived(() => $$slotProps.toggleOff);
												var fragment_11 = root_2();
												var node_27 = $.first_child(fragment_11);

												Button(node_27, {
													get icon() {
														return mdiTrashCan;
													},
													color: 'danger',
													variant: 'fill',
													$$events: {
														click: (e) => {
															e.stopPropagation();
															$.get(toggleConfirm)();
														}
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_14 = $.text('Yes');

														$.append($$anchor, text_14);
													},
													$$slots: { default: true }
												});

												var node_28 = $.sibling(node_27, 2);

												Dialog(node_28, {
													get open() {
														return $.get(openSecond);
													},

													$$events: {
														close: function (...$$args) {
															$.get(toggleConfirmOff)?.apply(this, $$args);
														}
													},

													children: ($$anchor, $$slotProps) => {
														var div_14 = root_4();

														$.append($$anchor, div_14);
													},

													$$slots: {
														default: true,
														title: ($$anchor, $$slotProps) => {
															var div_15 = root_8();

															$.append($$anchor, div_15);
														},

														actions: ($$anchor, $$slotProps) => {
															var div_16 = root_3();
															var node_29 = $.child(div_16);

															Button(node_29, {
																variant: 'fill',
																color: 'danger',
																$$events: {
																	click: (e) => {
																		console.log('Deleting item...');
																		$.get(toggleConfirmOff)();
																		$.get(toggleDeleteOff)();
																	}
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_15 = $.text('Yes, delete item');

																	$.append($$anchor, text_15);
																},
																$$slots: { default: true }
															});

															var node_30 = $.sibling(node_29, 2);

															Button(node_30, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_16 = $.text('Cancel');

																	$.append($$anchor, text_16);
																},
																$$slots: { default: true }
															});

															$.reset(div_16);
															$.append($$anchor, div_16);
														}
													}
												});

												$.append($$anchor, fragment_11);
											}
										}
									});

									var node_31 = $.sibling(node_26, 2);

									Button(node_31, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_17 = $.text('Cancel');

											$.append($$anchor, text_17);
										},
										$$slots: { default: true }
									});

									$.reset(div_13);
									$.append($$anchor, div_13);
								}
							}
						});

						$.append($$anchor, fragment_10);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_32 = $.sibling(node_23, 4);

	Preview(node_32, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_13 = root_2();
						var node_33 = $.first_child(fragment_13);

						Button(node_33, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_18 = $.text('Show Dialog');

								$.append($$anchor, text_18);
							},
							$$slots: { default: true }
						});

						var node_34 = $.sibling(node_33, 2);

						Dialog(node_34, {
							get open() {
								return $.get(open);
							},
							loading: true,
							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},
							$$slots: {
								title: ($$anchor, $$slotProps) => {
									var div_17 = root();

									$.append($$anchor, div_17);
								},

								actions: ($$anchor, $$slotProps) => {
									var div_18 = root_1();
									var node_35 = $.child(div_18);

									Button(node_35, {
										variant: 'fill',
										color: 'primary',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_19 = $.text('Close');

											$.append($$anchor, text_19);
										},
										$$slots: { default: true }
									});

									$.reset(div_18);
									$.append($$anchor, div_18);
								}
							}
						});

						$.append($$anchor, fragment_13);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_36 = $.sibling(node_32, 4);

	Preview(node_36, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_15 = root_2();
						var node_37 = $.first_child(fragment_15);

						Button(node_37, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_20 = $.text('Show Dialog');

								$.append($$anchor, text_20);
							},
							$$slots: { default: true }
						});

						var node_38 = $.sibling(node_37, 2);

						Dialog(node_38, {
							get open() {
								return $.get(open);
							},
							persistent: true,
							$$slots: {
								title: ($$anchor, $$slotProps) => {
									var div_19 = root();

									$.append($$anchor, div_19);
								},

								actions: ($$anchor, $$slotProps) => {
									var div_20 = root_3();
									var node_39 = $.child(div_20);

									Button(node_39, {
										variant: 'fill',
										color: 'primary',
										$$events: {
											click: function (...$$args) {
												$.get(toggleOff)?.apply(this, $$args);
											}
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_21 = $.text('Yes, close this dialog');

											$.append($$anchor, text_21);
										},
										$$slots: { default: true }
									});

									var node_40 = $.sibling(node_39, 2);

									Button(node_40, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_22 = $.text('No, keep this dialog open');

											$.append($$anchor, text_22);
										},
										$$slots: { default: true }
									});

									$.reset(div_20);
									$.append($$anchor, div_20);
								}
							}
						});

						$.append($$anchor, fragment_15);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_41 = $.sibling(node_36, 4);

	Preview(node_41, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_17 = root_2();
						var node_42 = $.first_child(fragment_17);

						Button(node_42, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_23 = $.text('Show Dialog');

								$.append($$anchor, text_23);
							},
							$$slots: { default: true }
						});

						var node_43 = $.sibling(node_42, 2);

						Dialog(node_43, {
							get open() {
								return $.get(open);
							},
							persistent: true,
							$$events: {
								close: () => {
									if ($.get(open)) {
										alert("Persistent Dialog forced close via 'close({ force: true })'.\n\nDialog will close.");
									}

									$.get(toggleOff)();
								},

								closeAttempt: () => {
									alert("Attempted to close persistent Dialog without using 'force'\n\nUse 'close({ force: true })' instead of Use 'close()' to close.\n\nDialog will remain open.");
								}
							},
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$anchor, $$slotProps) => {
									const close = $.derived(() => $$slotProps.close);
									var div_21 = root_11();
									var div_22 = $.sibling($.child(div_21), 2);
									var node_44 = $.child(div_22);

									Button(node_44, {
										variant: 'fill',
										color: 'primary',
										$$events: { click: () => $.get(close)() },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_18 = root_9();

											$.next();
											$.append($$anchor, fragment_18);
										},
										$$slots: { default: true }
									});

									var node_45 = $.sibling(node_44, 2);

									Button(node_45, {
										variant: 'fill',
										color: 'primary',
										$$events: { click: () => $.get(close)({ force: true }) },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_19 = root_10();
											var code = $.sibling($.first_child(fragment_19));

											code.textContent = 'close({ force: true })';
											$.append($$anchor, fragment_19);
										},
										$$slots: { default: true }
									});

									$.reset(div_22);
									$.reset(div_21);
									$.append($$anchor, div_21);
								}
							}
						});

						$.append($$anchor, fragment_17);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_46 = $.sibling(node_41, 4);

	Preview(node_46, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_21 = root_2();
						var node_47 = $.first_child(fragment_21);

						Button(node_47, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_24 = $.text('Show Dialog');

								$.append($$anchor, text_24);
							},
							$$slots: { default: true }
						});

						var node_48 = $.sibling(node_47, 2);

						Dialog(node_48, {
							get open() {
								return $.get(open);
							},

							$$events: {
								close: function (...$$args) {
									$.get(toggleOff)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								var div_23 = root_12();
								var node_49 = $.child(div_23);

								TextField(node_49, { label: 'Age', autofocus: true });
								$.reset(div_23);
								$.append($$anchor, div_23);
							},

							$$slots: {
								default: true,
								title: ($$anchor, $$slotProps) => {
									var div_24 = root_13();

									$.append($$anchor, div_24);
								},

								actions: ($$anchor, $$slotProps) => {
									var div_25 = root_3();
									var node_50 = $.child(div_25);

									Button(node_50, {
										variant: 'fill',
										color: 'primary',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_25 = $.text('OK');

											$.append($$anchor, text_25);
										},
										$$slots: { default: true }
									});

									var node_51 = $.sibling(node_50, 2);

									Button(node_51, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_26 = $.text('Cancel');

											$.append($$anchor, text_26);
										},
										$$slots: { default: true }
									});

									$.reset(div_25);
									$.append($$anchor, div_25);
								}
							}
						});

						$.append($$anchor, fragment_21);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_52 = $.sibling(node_46, 4);

	Preview(node_52, {
		children: ($$anchor, $$slotProps) => {
			Toggle($$anchor, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const open = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						const toggleOff = $.derived(() => $$slotProps.toggleOff);
						var fragment_23 = root_2();
						var node_53 = $.first_child(fragment_23);

						Button(node_53, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_27 = $.text('Show Dialog');

								$.append($$anchor, text_27);
							},
							$$slots: { default: true }
						});

						var node_54 = $.sibling(node_53, 2);

						Dialog(node_54, {
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
									var div_26 = root();

									$.append($$anchor, div_26);
								},

								actions: ($$anchor, $$slotProps) => {
									var div_27 = root_3();
									var node_55 = $.child(div_27);

									Button(node_55, {
										variant: 'fill',
										color: 'primary',
										disabled: true,
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_28 = $.text('Don\'t touch');

											$.append($$anchor, text_28);
										},
										$$slots: { default: true }
									});

									var node_56 = $.sibling(node_55, 2);

									Button(node_56, {
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_29 = $.text('Close');

											$.append($$anchor, text_29);
										},
										$$slots: { default: true }
									});

									$.reset(div_27);
									$.append($$anchor, div_27);
								}
							}
						});

						$.append($$anchor, fragment_23);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
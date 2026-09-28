import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Inline($$anchor, $$props) {
	$.push($$props, true);

	DatePicker($$anchor, {
		inline: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => DatePicker.Label, ($$anchor, DatePicker_Label) => {
				DatePicker_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Choose Date');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => DatePicker.Content, ($$anchor, DatePicker_Content) => {
				DatePicker_Content($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => DatePicker.View, ($$anchor, DatePicker_View) => {
							DatePicker_View($$anchor, {
								view: 'day',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									{
										const children = ($$anchor, datePicker = $.noop) => {
											var fragment_4 = root_1();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => DatePicker.ViewControl, ($$anchor, DatePicker_ViewControl) => {
												DatePicker_ViewControl($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root();
														var node_5 = $.first_child(fragment_5);

														$.component(node_5, () => DatePicker.PrevTrigger, ($$anchor, DatePicker_PrevTrigger) => {
															DatePicker_PrevTrigger($$anchor, {});
														});

														var node_6 = $.sibling(node_5, 2);

														$.component(node_6, () => DatePicker.ViewTrigger, ($$anchor, DatePicker_ViewTrigger) => {
															DatePicker_ViewTrigger($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = $.comment();
																	var node_7 = $.first_child(fragment_6);

																	$.component(node_7, () => DatePicker.RangeText, ($$anchor, DatePicker_RangeText) => {
																		DatePicker_RangeText($$anchor, {});
																	});

																	$.append($$anchor, fragment_6);
																},
																$$slots: { default: true }
															});
														});

														var node_8 = $.sibling(node_6, 2);

														$.component(node_8, () => DatePicker.NextTrigger, ($$anchor, DatePicker_NextTrigger) => {
															DatePicker_NextTrigger($$anchor, {});
														});

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											var node_9 = $.sibling(node_4, 2);

											$.component(node_9, () => DatePicker.Table, ($$anchor, DatePicker_Table) => {
												DatePicker_Table($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = root_1();
														var node_10 = $.first_child(fragment_7);

														$.component(node_10, () => DatePicker.TableHead, ($$anchor, DatePicker_TableHead) => {
															DatePicker_TableHead($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = $.comment();
																	var node_11 = $.first_child(fragment_8);

																	$.component(node_11, () => DatePicker.TableRow, ($$anchor, DatePicker_TableRow) => {
																		DatePicker_TableRow($$anchor, {
																			children: ($$anchor, $$slotProps) => {
																				var fragment_9 = $.comment();
																				var node_12 = $.first_child(fragment_9);

																				$.each(node_12, 17, () => datePicker()().weekDays, $.index, ($$anchor, weekDay) => {
																					var fragment_10 = $.comment();
																					var node_13 = $.first_child(fragment_10);

																					$.component(node_13, () => DatePicker.TableHeader, ($$anchor, DatePicker_TableHeader) => {
																						DatePicker_TableHeader($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								$.next();

																								var text_1 = $.text();

																								$.template_effect(() => $.set_text(text_1, $.get(weekDay).short));
																								$.append($$anchor, text_1);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_10);
																				});

																				$.append($$anchor, fragment_9);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														});

														var node_14 = $.sibling(node_10, 2);

														$.component(node_14, () => DatePicker.TableBody, ($$anchor, DatePicker_TableBody) => {
															DatePicker_TableBody($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_12 = $.comment();
																	var node_15 = $.first_child(fragment_12);

																	$.each(node_15, 17, () => datePicker()().weeks, $.index, ($$anchor, week) => {
																		var fragment_13 = $.comment();
																		var node_16 = $.first_child(fragment_13);

																		$.component(node_16, () => DatePicker.TableRow, ($$anchor, DatePicker_TableRow_1) => {
																			DatePicker_TableRow_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_14 = $.comment();
																					var node_17 = $.first_child(fragment_14);

																					$.each(node_17, 17, () => $.get(week), $.index, ($$anchor, day, id, $$array) => {
																						var fragment_15 = $.comment();
																						var node_18 = $.first_child(fragment_15);

																						$.component(node_18, () => DatePicker.TableCell, ($$anchor, DatePicker_TableCell) => {
																							DatePicker_TableCell($$anchor, {
																								get value() {
																									return $.get(day);
																								},

																								children: ($$anchor, $$slotProps) => {
																									var fragment_16 = $.comment();
																									var node_19 = $.first_child(fragment_16);

																									$.component(node_19, () => DatePicker.TableCellTrigger, ($$anchor, DatePicker_TableCellTrigger) => {
																										DatePicker_TableCellTrigger($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_2 = $.text();

																												$.template_effect(() => $.set_text(text_2, $.get(day).day));
																												$.append($$anchor, text_2);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_16);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_15);
																					});

																					$.append($$anchor, fragment_14);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_13);
																	});

																	$.append($$anchor, fragment_12);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										};

										$.component(node_3, () => DatePicker.Context, ($$anchor, DatePicker_Context) => {
											DatePicker_Context($$anchor, { children, $$slots: { default: true } });
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_20 = $.sibling(node_2, 2);

						$.component(node_20, () => DatePicker.View, ($$anchor, DatePicker_View_1) => {
							DatePicker_View_1($$anchor, {
								view: 'month',
								children: ($$anchor, $$slotProps) => {
									var fragment_18 = $.comment();
									var node_21 = $.first_child(fragment_18);

									{
										const children = ($$anchor, datePicker = $.noop) => {
											var fragment_19 = root_1();
											var node_22 = $.first_child(fragment_19);

											$.component(node_22, () => DatePicker.ViewControl, ($$anchor, DatePicker_ViewControl_1) => {
												DatePicker_ViewControl_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_20 = root();
														var node_23 = $.first_child(fragment_20);

														$.component(node_23, () => DatePicker.PrevTrigger, ($$anchor, DatePicker_PrevTrigger_1) => {
															DatePicker_PrevTrigger_1($$anchor, {});
														});

														var node_24 = $.sibling(node_23, 2);

														$.component(node_24, () => DatePicker.ViewTrigger, ($$anchor, DatePicker_ViewTrigger_1) => {
															DatePicker_ViewTrigger_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_21 = $.comment();
																	var node_25 = $.first_child(fragment_21);

																	$.component(node_25, () => DatePicker.RangeText, ($$anchor, DatePicker_RangeText_1) => {
																		DatePicker_RangeText_1($$anchor, {});
																	});

																	$.append($$anchor, fragment_21);
																},
																$$slots: { default: true }
															});
														});

														var node_26 = $.sibling(node_24, 2);

														$.component(node_26, () => DatePicker.NextTrigger, ($$anchor, DatePicker_NextTrigger_1) => {
															DatePicker_NextTrigger_1($$anchor, {});
														});

														$.append($$anchor, fragment_20);
													},
													$$slots: { default: true }
												});
											});

											var node_27 = $.sibling(node_22, 2);

											$.component(node_27, () => DatePicker.Table, ($$anchor, DatePicker_Table_1) => {
												DatePicker_Table_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_22 = $.comment();
														var node_28 = $.first_child(fragment_22);

														$.component(node_28, () => DatePicker.TableBody, ($$anchor, DatePicker_TableBody_1) => {
															DatePicker_TableBody_1($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_23 = $.comment();
																	var node_29 = $.first_child(fragment_23);

																	$.each(node_29, 17, () => datePicker()().getMonthsGrid({ columns: 4, format: 'short' }), $.index, ($$anchor, months) => {
																		var fragment_24 = $.comment();
																		var node_30 = $.first_child(fragment_24);

																		$.component(node_30, () => DatePicker.TableRow, ($$anchor, DatePicker_TableRow_2) => {
																			DatePicker_TableRow_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_25 = $.comment();
																					var node_31 = $.first_child(fragment_25);

																					$.each(node_31, 17, () => $.get(months), $.index, ($$anchor, month, id, $$array_1) => {
																						var fragment_26 = $.comment();
																						var node_32 = $.first_child(fragment_26);

																						$.component(node_32, () => DatePicker.TableCell, ($$anchor, DatePicker_TableCell_1) => {
																							DatePicker_TableCell_1($$anchor, {
																								get value() {
																									return $.get(month).value;
																								},

																								children: ($$anchor, $$slotProps) => {
																									var fragment_27 = $.comment();
																									var node_33 = $.first_child(fragment_27);

																									$.component(node_33, () => DatePicker.TableCellTrigger, ($$anchor, DatePicker_TableCellTrigger_1) => {
																										DatePicker_TableCellTrigger_1($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_3 = $.text();

																												$.template_effect(() => $.set_text(text_3, $.get(month).label));
																												$.append($$anchor, text_3);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_27);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_26);
																					});

																					$.append($$anchor, fragment_25);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_24);
																	});

																	$.append($$anchor, fragment_23);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_22);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_19);
										};

										$.component(node_21, () => DatePicker.Context, ($$anchor, DatePicker_Context_1) => {
											DatePicker_Context_1($$anchor, { children, $$slots: { default: true } });
										});
									}

									$.append($$anchor, fragment_18);
								},
								$$slots: { default: true }
							});
						});

						var node_34 = $.sibling(node_20, 2);

						$.component(node_34, () => DatePicker.View, ($$anchor, DatePicker_View_2) => {
							DatePicker_View_2($$anchor, {
								view: 'year',
								children: ($$anchor, $$slotProps) => {
									var fragment_29 = $.comment();
									var node_35 = $.first_child(fragment_29);

									{
										const children = ($$anchor, datePicker = $.noop) => {
											var fragment_30 = root_1();
											var node_36 = $.first_child(fragment_30);

											$.component(node_36, () => DatePicker.ViewControl, ($$anchor, DatePicker_ViewControl_2) => {
												DatePicker_ViewControl_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_31 = root();
														var node_37 = $.first_child(fragment_31);

														$.component(node_37, () => DatePicker.PrevTrigger, ($$anchor, DatePicker_PrevTrigger_2) => {
															DatePicker_PrevTrigger_2($$anchor, {});
														});

														var node_38 = $.sibling(node_37, 2);

														$.component(node_38, () => DatePicker.ViewTrigger, ($$anchor, DatePicker_ViewTrigger_2) => {
															DatePicker_ViewTrigger_2($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_32 = $.comment();
																	var node_39 = $.first_child(fragment_32);

																	$.component(node_39, () => DatePicker.RangeText, ($$anchor, DatePicker_RangeText_2) => {
																		DatePicker_RangeText_2($$anchor, {});
																	});

																	$.append($$anchor, fragment_32);
																},
																$$slots: { default: true }
															});
														});

														var node_40 = $.sibling(node_38, 2);

														$.component(node_40, () => DatePicker.NextTrigger, ($$anchor, DatePicker_NextTrigger_2) => {
															DatePicker_NextTrigger_2($$anchor, {});
														});

														$.append($$anchor, fragment_31);
													},
													$$slots: { default: true }
												});
											});

											var node_41 = $.sibling(node_36, 2);

											$.component(node_41, () => DatePicker.Table, ($$anchor, DatePicker_Table_2) => {
												DatePicker_Table_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_33 = $.comment();
														var node_42 = $.first_child(fragment_33);

														$.component(node_42, () => DatePicker.TableBody, ($$anchor, DatePicker_TableBody_2) => {
															DatePicker_TableBody_2($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_34 = $.comment();
																	var node_43 = $.first_child(fragment_34);

																	$.each(node_43, 17, () => datePicker()().getYearsGrid({ columns: 4 }), $.index, ($$anchor, years) => {
																		var fragment_35 = $.comment();
																		var node_44 = $.first_child(fragment_35);

																		$.component(node_44, () => DatePicker.TableRow, ($$anchor, DatePicker_TableRow_3) => {
																			DatePicker_TableRow_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_36 = $.comment();
																					var node_45 = $.first_child(fragment_36);

																					$.each(node_45, 17, () => $.get(years), $.index, ($$anchor, year, id, $$array_2) => {
																						var fragment_37 = $.comment();
																						var node_46 = $.first_child(fragment_37);

																						$.component(node_46, () => DatePicker.TableCell, ($$anchor, DatePicker_TableCell_2) => {
																							DatePicker_TableCell_2($$anchor, {
																								get value() {
																									return $.get(year).value;
																								},

																								children: ($$anchor, $$slotProps) => {
																									var fragment_38 = $.comment();
																									var node_47 = $.first_child(fragment_38);

																									$.component(node_47, () => DatePicker.TableCellTrigger, ($$anchor, DatePicker_TableCellTrigger_2) => {
																										DatePicker_TableCellTrigger_2($$anchor, {
																											children: ($$anchor, $$slotProps) => {
																												$.next();

																												var text_4 = $.text();

																												$.template_effect(() => $.set_text(text_4, $.get(year).label));
																												$.append($$anchor, text_4);
																											},
																											$$slots: { default: true }
																										});
																									});

																									$.append($$anchor, fragment_38);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_37);
																					});

																					$.append($$anchor, fragment_36);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_35);
																	});

																	$.append($$anchor, fragment_34);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_33);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_30);
										};

										$.component(node_35, () => DatePicker.Context, ($$anchor, DatePicker_Context_2) => {
											DatePicker_Context_2($$anchor, { children, $$slots: { default: true } });
										});
									}

									$.append($$anchor, fragment_29);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}
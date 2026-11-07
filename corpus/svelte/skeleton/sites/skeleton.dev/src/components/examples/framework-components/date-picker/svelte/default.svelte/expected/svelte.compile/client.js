import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Default($$anchor, $$props) {
	$.push($$props, true);

	DatePicker($$anchor, {
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

			$.component(node_1, () => DatePicker.Control, ($$anchor, DatePicker_Control) => {
				DatePicker_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => DatePicker.Input, ($$anchor, DatePicker_Input) => {
							DatePicker_Input($$anchor, { placeholder: 'mm/dd/yyyy' });
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => DatePicker.Trigger, ($$anchor, DatePicker_Trigger) => {
							DatePicker_Trigger($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_1, 2);

			Portal(node_4, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_5 = $.first_child(fragment_3);

					$.component(node_5, () => DatePicker.Positioner, ($$anchor, DatePicker_Positioner) => {
						DatePicker_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_6 = $.first_child(fragment_4);

								$.component(node_6, () => DatePicker.Content, ($$anchor, DatePicker_Content) => {
									DatePicker_Content($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root_1();
											var node_7 = $.first_child(fragment_5);

											$.component(node_7, () => DatePicker.View, ($$anchor, DatePicker_View) => {
												DatePicker_View($$anchor, {
													view: 'day',
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = $.comment();
														var node_8 = $.first_child(fragment_6);

														{
															const children = ($$anchor, datePicker = $.noop) => {
																var fragment_7 = root();
																var node_9 = $.first_child(fragment_7);

																$.component(node_9, () => DatePicker.ViewControl, ($$anchor, DatePicker_ViewControl) => {
																	DatePicker_ViewControl($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_8 = root_1();
																			var node_10 = $.first_child(fragment_8);

																			$.component(node_10, () => DatePicker.PrevTrigger, ($$anchor, DatePicker_PrevTrigger) => {
																				DatePicker_PrevTrigger($$anchor, {});
																			});

																			var node_11 = $.sibling(node_10, 2);

																			$.component(node_11, () => DatePicker.ViewTrigger, ($$anchor, DatePicker_ViewTrigger) => {
																				DatePicker_ViewTrigger($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_9 = $.comment();
																						var node_12 = $.first_child(fragment_9);

																						$.component(node_12, () => DatePicker.RangeText, ($$anchor, DatePicker_RangeText) => {
																							DatePicker_RangeText($$anchor, {});
																						});

																						$.append($$anchor, fragment_9);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_13 = $.sibling(node_11, 2);

																			$.component(node_13, () => DatePicker.NextTrigger, ($$anchor, DatePicker_NextTrigger) => {
																				DatePicker_NextTrigger($$anchor, {});
																			});

																			$.append($$anchor, fragment_8);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_14 = $.sibling(node_9, 2);

																$.component(node_14, () => DatePicker.Table, ($$anchor, DatePicker_Table) => {
																	DatePicker_Table($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = root();
																			var node_15 = $.first_child(fragment_10);

																			$.component(node_15, () => DatePicker.TableHead, ($$anchor, DatePicker_TableHead) => {
																				DatePicker_TableHead($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_11 = $.comment();
																						var node_16 = $.first_child(fragment_11);

																						$.component(node_16, () => DatePicker.TableRow, ($$anchor, DatePicker_TableRow) => {
																							DatePicker_TableRow($$anchor, {
																								children: ($$anchor, $$slotProps) => {
																									var fragment_12 = $.comment();
																									var node_17 = $.first_child(fragment_12);

																									$.each(node_17, 17, () => datePicker()().weekDays, $.index, ($$anchor, weekDay) => {
																										var fragment_13 = $.comment();
																										var node_18 = $.first_child(fragment_13);

																										$.component(node_18, () => DatePicker.TableHeader, ($$anchor, DatePicker_TableHeader) => {
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

																										$.append($$anchor, fragment_13);
																									});

																									$.append($$anchor, fragment_12);
																								},
																								$$slots: { default: true }
																							});
																						});

																						$.append($$anchor, fragment_11);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_19 = $.sibling(node_15, 2);

																			$.component(node_19, () => DatePicker.TableBody, ($$anchor, DatePicker_TableBody) => {
																				DatePicker_TableBody($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_15 = $.comment();
																						var node_20 = $.first_child(fragment_15);

																						$.each(node_20, 17, () => datePicker()().weeks, $.index, ($$anchor, week) => {
																							var fragment_16 = $.comment();
																							var node_21 = $.first_child(fragment_16);

																							$.component(node_21, () => DatePicker.TableRow, ($$anchor, DatePicker_TableRow_1) => {
																								DatePicker_TableRow_1($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										var fragment_17 = $.comment();
																										var node_22 = $.first_child(fragment_17);

																										$.each(node_22, 17, () => $.get(week), $.index, ($$anchor, day, id, $$array) => {
																											var fragment_18 = $.comment();
																											var node_23 = $.first_child(fragment_18);

																											$.component(node_23, () => DatePicker.TableCell, ($$anchor, DatePicker_TableCell) => {
																												DatePicker_TableCell($$anchor, {
																													get value() {
																														return $.get(day);
																													},

																													children: ($$anchor, $$slotProps) => {
																														var fragment_19 = $.comment();
																														var node_24 = $.first_child(fragment_19);

																														$.component(node_24, () => DatePicker.TableCellTrigger, ($$anchor, DatePicker_TableCellTrigger) => {
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

																														$.append($$anchor, fragment_19);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_18);
																										});

																										$.append($$anchor, fragment_17);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_16);
																						});

																						$.append($$anchor, fragment_15);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_7);
															};

															$.component(node_8, () => DatePicker.Context, ($$anchor, DatePicker_Context) => {
																DatePicker_Context($$anchor, { children, $$slots: { default: true } });
															});
														}

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											var node_25 = $.sibling(node_7, 2);

											$.component(node_25, () => DatePicker.View, ($$anchor, DatePicker_View_1) => {
												DatePicker_View_1($$anchor, {
													view: 'month',
													children: ($$anchor, $$slotProps) => {
														var fragment_21 = $.comment();
														var node_26 = $.first_child(fragment_21);

														{
															const children = ($$anchor, datePicker = $.noop) => {
																var fragment_22 = root();
																var node_27 = $.first_child(fragment_22);

																$.component(node_27, () => DatePicker.ViewControl, ($$anchor, DatePicker_ViewControl_1) => {
																	DatePicker_ViewControl_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_23 = root_1();
																			var node_28 = $.first_child(fragment_23);

																			$.component(node_28, () => DatePicker.PrevTrigger, ($$anchor, DatePicker_PrevTrigger_1) => {
																				DatePicker_PrevTrigger_1($$anchor, {});
																			});

																			var node_29 = $.sibling(node_28, 2);

																			$.component(node_29, () => DatePicker.ViewTrigger, ($$anchor, DatePicker_ViewTrigger_1) => {
																				DatePicker_ViewTrigger_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_24 = $.comment();
																						var node_30 = $.first_child(fragment_24);

																						$.component(node_30, () => DatePicker.RangeText, ($$anchor, DatePicker_RangeText_1) => {
																							DatePicker_RangeText_1($$anchor, {});
																						});

																						$.append($$anchor, fragment_24);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_31 = $.sibling(node_29, 2);

																			$.component(node_31, () => DatePicker.NextTrigger, ($$anchor, DatePicker_NextTrigger_1) => {
																				DatePicker_NextTrigger_1($$anchor, {});
																			});

																			$.append($$anchor, fragment_23);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_32 = $.sibling(node_27, 2);

																$.component(node_32, () => DatePicker.Table, ($$anchor, DatePicker_Table_1) => {
																	DatePicker_Table_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_25 = $.comment();
																			var node_33 = $.first_child(fragment_25);

																			$.component(node_33, () => DatePicker.TableBody, ($$anchor, DatePicker_TableBody_1) => {
																				DatePicker_TableBody_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_26 = $.comment();
																						var node_34 = $.first_child(fragment_26);

																						$.each(node_34, 17, () => datePicker()().getMonthsGrid({ columns: 4, format: 'short' }), $.index, ($$anchor, months) => {
																							var fragment_27 = $.comment();
																							var node_35 = $.first_child(fragment_27);

																							$.component(node_35, () => DatePicker.TableRow, ($$anchor, DatePicker_TableRow_2) => {
																								DatePicker_TableRow_2($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										var fragment_28 = $.comment();
																										var node_36 = $.first_child(fragment_28);

																										$.each(node_36, 17, () => $.get(months), $.index, ($$anchor, month, id, $$array_1) => {
																											var fragment_29 = $.comment();
																											var node_37 = $.first_child(fragment_29);

																											$.component(node_37, () => DatePicker.TableCell, ($$anchor, DatePicker_TableCell_1) => {
																												DatePicker_TableCell_1($$anchor, {
																													get value() {
																														return $.get(month).value;
																													},

																													children: ($$anchor, $$slotProps) => {
																														var fragment_30 = $.comment();
																														var node_38 = $.first_child(fragment_30);

																														$.component(node_38, () => DatePicker.TableCellTrigger, ($$anchor, DatePicker_TableCellTrigger_1) => {
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

																														$.append($$anchor, fragment_30);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_29);
																										});

																										$.append($$anchor, fragment_28);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_27);
																						});

																						$.append($$anchor, fragment_26);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_25);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_22);
															};

															$.component(node_26, () => DatePicker.Context, ($$anchor, DatePicker_Context_1) => {
																DatePicker_Context_1($$anchor, { children, $$slots: { default: true } });
															});
														}

														$.append($$anchor, fragment_21);
													},
													$$slots: { default: true }
												});
											});

											var node_39 = $.sibling(node_25, 2);

											$.component(node_39, () => DatePicker.View, ($$anchor, DatePicker_View_2) => {
												DatePicker_View_2($$anchor, {
													view: 'year',
													children: ($$anchor, $$slotProps) => {
														var fragment_32 = $.comment();
														var node_40 = $.first_child(fragment_32);

														{
															const children = ($$anchor, datePicker = $.noop) => {
																var fragment_33 = root();
																var node_41 = $.first_child(fragment_33);

																$.component(node_41, () => DatePicker.ViewControl, ($$anchor, DatePicker_ViewControl_2) => {
																	DatePicker_ViewControl_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_34 = root_1();
																			var node_42 = $.first_child(fragment_34);

																			$.component(node_42, () => DatePicker.PrevTrigger, ($$anchor, DatePicker_PrevTrigger_2) => {
																				DatePicker_PrevTrigger_2($$anchor, {});
																			});

																			var node_43 = $.sibling(node_42, 2);

																			$.component(node_43, () => DatePicker.ViewTrigger, ($$anchor, DatePicker_ViewTrigger_2) => {
																				DatePicker_ViewTrigger_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_35 = $.comment();
																						var node_44 = $.first_child(fragment_35);

																						$.component(node_44, () => DatePicker.RangeText, ($$anchor, DatePicker_RangeText_2) => {
																							DatePicker_RangeText_2($$anchor, {});
																						});

																						$.append($$anchor, fragment_35);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_45 = $.sibling(node_43, 2);

																			$.component(node_45, () => DatePicker.NextTrigger, ($$anchor, DatePicker_NextTrigger_2) => {
																				DatePicker_NextTrigger_2($$anchor, {});
																			});

																			$.append($$anchor, fragment_34);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_46 = $.sibling(node_41, 2);

																$.component(node_46, () => DatePicker.Table, ($$anchor, DatePicker_Table_2) => {
																	DatePicker_Table_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_36 = $.comment();
																			var node_47 = $.first_child(fragment_36);

																			$.component(node_47, () => DatePicker.TableBody, ($$anchor, DatePicker_TableBody_2) => {
																				DatePicker_TableBody_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_37 = $.comment();
																						var node_48 = $.first_child(fragment_37);

																						$.each(node_48, 17, () => datePicker()().getYearsGrid({ columns: 4 }), $.index, ($$anchor, years) => {
																							var fragment_38 = $.comment();
																							var node_49 = $.first_child(fragment_38);

																							$.component(node_49, () => DatePicker.TableRow, ($$anchor, DatePicker_TableRow_3) => {
																								DatePicker_TableRow_3($$anchor, {
																									children: ($$anchor, $$slotProps) => {
																										var fragment_39 = $.comment();
																										var node_50 = $.first_child(fragment_39);

																										$.each(node_50, 17, () => $.get(years), $.index, ($$anchor, year, id, $$array_2) => {
																											var fragment_40 = $.comment();
																											var node_51 = $.first_child(fragment_40);

																											$.component(node_51, () => DatePicker.TableCell, ($$anchor, DatePicker_TableCell_2) => {
																												DatePicker_TableCell_2($$anchor, {
																													get value() {
																														return $.get(year).value;
																													},

																													children: ($$anchor, $$slotProps) => {
																														var fragment_41 = $.comment();
																														var node_52 = $.first_child(fragment_41);

																														$.component(node_52, () => DatePicker.TableCellTrigger, ($$anchor, DatePicker_TableCellTrigger_2) => {
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

																														$.append($$anchor, fragment_41);
																													},
																													$$slots: { default: true }
																												});
																											});

																											$.append($$anchor, fragment_40);
																										});

																										$.append($$anchor, fragment_39);
																									},
																									$$slots: { default: true }
																								});
																							});

																							$.append($$anchor, fragment_38);
																						});

																						$.append($$anchor, fragment_37);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_36);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_33);
															};

															$.component(node_40, () => DatePicker.Context, ($$anchor, DatePicker_Context_2) => {
																DatePicker_Context_2($$anchor, { children, $$slots: { default: true } });
															});
														}

														$.append($$anchor, fragment_32);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}
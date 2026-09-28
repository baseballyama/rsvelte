import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker, parseDate } from '../../src/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Date_picker($$anchor, $$props) {
	$.push($$props, true);

	DatePicker($$anchor, {
		'data-testid': 'root',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => DatePicker.Label, ($$anchor, DatePicker_Label) => {
				DatePicker_Label($$anchor, { 'data-testid': 'label' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => DatePicker.Control, ($$anchor, DatePicker_Control) => {
				DatePicker_Control($$anchor, {
					'data-testid': 'control',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => DatePicker.Input, ($$anchor, DatePicker_Input) => {
							DatePicker_Input($$anchor, { 'data-testid': 'input' });
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => DatePicker.Trigger, ($$anchor, DatePicker_Trigger) => {
							DatePicker_Trigger($$anchor, { 'data-testid': 'trigger' });
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_1, 2);

			$.component(node_4, () => DatePicker.Positioner, ($$anchor, DatePicker_Positioner) => {
				DatePicker_Positioner($$anchor, {
					'data-testid': 'positioner',
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_5 = $.first_child(fragment_3);

						$.component(node_5, () => DatePicker.Content, ($$anchor, DatePicker_Content) => {
							DatePicker_Content($$anchor, {
								'data-testid': 'content',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_6 = $.first_child(fragment_4);

									$.component(node_6, () => DatePicker.YearSelect, ($$anchor, DatePicker_YearSelect) => {
										DatePicker_YearSelect($$anchor, { 'data-testid': 'year-select' });
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => DatePicker.MonthSelect, ($$anchor, DatePicker_MonthSelect) => {
										DatePicker_MonthSelect($$anchor, { 'data-testid': 'month-select' });
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => DatePicker.View, ($$anchor, DatePicker_View) => {
										DatePicker_View($$anchor, {
											view: 'day',
											'data-testid': 'view',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_9 = $.first_child(fragment_5);

												$.component(node_9, () => DatePicker.ViewControl, ($$anchor, DatePicker_ViewControl) => {
													DatePicker_ViewControl($$anchor, {
														'data-testid': 'view-control',
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_1();
															var node_10 = $.first_child(fragment_6);

															$.component(node_10, () => DatePicker.PrevTrigger, ($$anchor, DatePicker_PrevTrigger) => {
																DatePicker_PrevTrigger($$anchor, { 'data-testid': 'prev-trigger' });
															});

															var node_11 = $.sibling(node_10, 2);

															$.component(node_11, () => DatePicker.ViewTrigger, ($$anchor, DatePicker_ViewTrigger) => {
																DatePicker_ViewTrigger($$anchor, {
																	'data-testid': 'view-trigger',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = $.comment();
																		var node_12 = $.first_child(fragment_7);

																		$.component(node_12, () => DatePicker.RangeText, ($$anchor, DatePicker_RangeText) => {
																			DatePicker_RangeText($$anchor, { 'data-testid': 'range-text' });
																		});

																		$.append($$anchor, fragment_7);
																	},
																	$$slots: { default: true }
																});
															});

															var node_13 = $.sibling(node_11, 2);

															$.component(node_13, () => DatePicker.NextTrigger, ($$anchor, DatePicker_NextTrigger) => {
																DatePicker_NextTrigger($$anchor, { 'data-testid': 'next-trigger' });
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_14 = $.sibling(node_9, 2);

												$.component(node_14, () => DatePicker.Table, ($$anchor, DatePicker_Table) => {
													DatePicker_Table($$anchor, {
														'data-testid': 'table',
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root();
															var node_15 = $.first_child(fragment_8);

															$.component(node_15, () => DatePicker.TableHead, ($$anchor, DatePicker_TableHead) => {
																DatePicker_TableHead($$anchor, {
																	'data-testid': 'table-head',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_9 = $.comment();
																		var node_16 = $.first_child(fragment_9);

																		$.component(node_16, () => DatePicker.TableRow, ($$anchor, DatePicker_TableRow) => {
																			DatePicker_TableRow($$anchor, {
																				'data-testid': 'table-row',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_10 = $.comment();
																					var node_17 = $.first_child(fragment_10);

																					$.component(node_17, () => DatePicker.TableHeader, ($$anchor, DatePicker_TableHeader) => {
																						DatePicker_TableHeader($$anchor, { 'data-testid': 'table-header' });
																					});

																					$.append($$anchor, fragment_10);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_9);
																	},
																	$$slots: { default: true }
																});
															});

															var node_18 = $.sibling(node_15, 2);

															$.component(node_18, () => DatePicker.TableBody, ($$anchor, DatePicker_TableBody) => {
																DatePicker_TableBody($$anchor, {
																	'data-testid': 'table-body',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_11 = $.comment();
																		var node_19 = $.first_child(fragment_11);

																		$.component(node_19, () => DatePicker.TableRow, ($$anchor, DatePicker_TableRow_1) => {
																			DatePicker_TableRow_1($$anchor, {
																				'data-testid': 'table-row',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_12 = $.comment();
																					var node_20 = $.first_child(fragment_12);

																					{
																						let $0 = $.derived(() => parseDate('1970-01-01'));

																						$.component(node_20, () => DatePicker.TableCell, ($$anchor, DatePicker_TableCell) => {
																							DatePicker_TableCell($$anchor, {
																								get value() {
																									return $.get($0);
																								},
																								'data-testid': 'table-cell',
																								children: ($$anchor, $$slotProps) => {
																									var fragment_13 = $.comment();
																									var node_21 = $.first_child(fragment_13);

																									$.component(node_21, () => DatePicker.TableCellTrigger, ($$anchor, DatePicker_TableCellTrigger) => {
																										DatePicker_TableCellTrigger($$anchor, { 'data-testid': 'table-cell-trigger' });
																									});

																									$.append($$anchor, fragment_13);
																								},
																								$$slots: { default: true }
																							});
																						});
																					}

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

															$.append($$anchor, fragment_8);
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
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}
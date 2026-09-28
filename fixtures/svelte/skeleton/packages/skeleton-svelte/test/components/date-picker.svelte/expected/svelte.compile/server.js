import * as $ from 'svelte/internal/server';
import { DatePicker, parseDate } from '../../src/index.js';

export default function Date_picker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		DatePicker($$renderer, {
			'data-testid': 'root',
			children: ($$renderer) => {
				if (DatePicker.Label) {
					$$renderer.push('<!--[-->');
					DatePicker.Label($$renderer, { 'data-testid': 'label' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (DatePicker.Control) {
					$$renderer.push('<!--[-->');

					DatePicker.Control($$renderer, {
						'data-testid': 'control',
						children: ($$renderer) => {
							if (DatePicker.Input) {
								$$renderer.push('<!--[-->');
								DatePicker.Input($$renderer, { 'data-testid': 'input' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (DatePicker.Trigger) {
								$$renderer.push('<!--[-->');
								DatePicker.Trigger($$renderer, { 'data-testid': 'trigger' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (DatePicker.Positioner) {
					$$renderer.push('<!--[-->');

					DatePicker.Positioner($$renderer, {
						'data-testid': 'positioner',
						children: ($$renderer) => {
							if (DatePicker.Content) {
								$$renderer.push('<!--[-->');

								DatePicker.Content($$renderer, {
									'data-testid': 'content',
									children: ($$renderer) => {
										if (DatePicker.YearSelect) {
											$$renderer.push('<!--[-->');
											DatePicker.YearSelect($$renderer, { 'data-testid': 'year-select' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (DatePicker.MonthSelect) {
											$$renderer.push('<!--[-->');
											DatePicker.MonthSelect($$renderer, { 'data-testid': 'month-select' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (DatePicker.View) {
											$$renderer.push('<!--[-->');

											DatePicker.View($$renderer, {
												view: 'day',
												'data-testid': 'view',
												children: ($$renderer) => {
													if (DatePicker.ViewControl) {
														$$renderer.push('<!--[-->');

														DatePicker.ViewControl($$renderer, {
															'data-testid': 'view-control',
															children: ($$renderer) => {
																if (DatePicker.PrevTrigger) {
																	$$renderer.push('<!--[-->');
																	DatePicker.PrevTrigger($$renderer, { 'data-testid': 'prev-trigger' });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DatePicker.ViewTrigger) {
																	$$renderer.push('<!--[-->');

																	DatePicker.ViewTrigger($$renderer, {
																		'data-testid': 'view-trigger',
																		children: ($$renderer) => {
																			if (DatePicker.RangeText) {
																				$$renderer.push('<!--[-->');
																				DatePicker.RangeText($$renderer, { 'data-testid': 'range-text' });
																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DatePicker.NextTrigger) {
																	$$renderer.push('<!--[-->');
																	DatePicker.NextTrigger($$renderer, { 'data-testid': 'next-trigger' });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DatePicker.Table) {
														$$renderer.push('<!--[-->');

														DatePicker.Table($$renderer, {
															'data-testid': 'table',
															children: ($$renderer) => {
																if (DatePicker.TableHead) {
																	$$renderer.push('<!--[-->');

																	DatePicker.TableHead($$renderer, {
																		'data-testid': 'table-head',
																		children: ($$renderer) => {
																			if (DatePicker.TableRow) {
																				$$renderer.push('<!--[-->');

																				DatePicker.TableRow($$renderer, {
																					'data-testid': 'table-row',
																					children: ($$renderer) => {
																						if (DatePicker.TableHeader) {
																							$$renderer.push('<!--[-->');
																							DatePicker.TableHeader($$renderer, { 'data-testid': 'table-header' });
																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DatePicker.TableBody) {
																	$$renderer.push('<!--[-->');

																	DatePicker.TableBody($$renderer, {
																		'data-testid': 'table-body',
																		children: ($$renderer) => {
																			if (DatePicker.TableRow) {
																				$$renderer.push('<!--[-->');

																				DatePicker.TableRow($$renderer, {
																					'data-testid': 'table-row',
																					children: ($$renderer) => {
																						if (DatePicker.TableCell) {
																							$$renderer.push('<!--[-->');

																							DatePicker.TableCell($$renderer, {
																								value: parseDate('1970-01-01'),
																								'data-testid': 'table-cell',
																								children: ($$renderer) => {
																									if (DatePicker.TableCellTrigger) {
																										$$renderer.push('<!--[-->');
																										DatePicker.TableCellTrigger($$renderer, { 'data-testid': 'table-cell-trigger' });
																										$$renderer.push('<!--]-->');
																									} else {
																										$$renderer.push('<!--[!-->');
																										$$renderer.push('<!--]-->');
																									}
																								},
																								$$slots: { default: true }
																							});

																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});
	});
}
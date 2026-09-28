import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SearchQuery, ViewSelector } from '$lib/components';
import { FiltersBottomSheet, ParsedTagList, queryParamToMap } from '$lib/components/filters';
import QuickFilters from '$lib/components/filters/quickFilters.svelte';
import Button from '$lib/elements/forms/button.svelte';
import { View } from '$lib/helpers/load';
import { isSmallViewport } from '$lib/stores/viewport';
import { IconAdjustments, IconFilterLine, IconSearch } from '@appwrite.io/pink-icons-svelte';
import { Icon, Layout } from '@appwrite.io/pink-svelte';
import DisplaySettingsModal from './displaySettingsModal.svelte';
import { buildFilterCol } from '$lib/components/filters/quickFilters';
import { afterNavigate } from '$app/navigation';
import { parsedTags, setFilters } from '$lib/components/filters/setFilters';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div style="overflow-x: auto;"><!></div>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<div style="flex: 0 0 auto; max-width: 360px; min-width: 0;"><!></div>`);
var root_6 = $.from_html(`<header><!></header> <!> <!>`, 1);

export default function ResponsiveContainerHeader($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get($$props.columns, '$columns', $$stores);
	const $parsedTags = () => $.store_get(parsedTags, '$parsedTags', $$stores);
	const $isSmallViewport = () => $.store_get(isSmallViewport, '$isSmallViewport', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const searchButton = ($$anchor, $$arg0) => {
		let icon = $.derived_safe_equal(() => $.fallback($$arg0?.(), false));

		Button($$anchor, {
			ariaLabel: 'Search',
			secondary: true,
			get icon() {
				return $.get(icon);
			},
			$$events: { click: () => $.set(showSearch, !$.get(showSearch)) },
			children: ($$anchor, $$slotProps) => {
				Icon($$anchor, {
					get icon() {
						return IconSearch;
					}
				});
			},
			$$slots: { default: true }
		});
	};

	const settingsButton = ($$anchor, $$arg0) => {
		let icon = $.derived_safe_equal(() => $.fallback($$arg0?.(), false));

		Button($$anchor, {
			ariaLabel: 'Display settings',
			secondary: true,
			get icon() {
				return $.get(icon);
			},

			$$events: {
				click: () => $.set(showDisplaySettingsModal, !$.get(showDisplaySettingsModal))
			},

			children: ($$anchor, $$slotProps) => {
				Icon($$anchor, {
					get icon() {
						return IconAdjustments;
					}
				});
			},
			$$slots: { default: true }
		});
	};

	const filtersButton = ($$anchor, $$arg0) => {
		let icon = $.derived_safe_equal(() => $.fallback($$arg0?.(), false));

		Button($$anchor, {
			ariaLabel: 'Filters',
			text: true,
			get icon() {
				return $.get(icon);
			},

			get badge() {
				return $.get(filtersBadge);
			},
			$$events: { click: () => $.set(showFilters, !$.get(showFilters)) },
			children: ($$anchor, $$slotProps) => {
				Icon($$anchor, {
					get icon() {
						return IconFilterLine;
					}
				});
			},
			$$slots: { default: true }
		});
	};

	let view = $.prop($$props, 'view', 31, () => $.proxy(View.Table)),
		hideView = $.prop($$props, 'hideView', 3, false),
		hideColumns = $.prop($$props, 'hideColumns', 3, false),
		hasSearch = $.prop($$props, 'hasSearch', 3, false),
		searchPlaceholder = $.prop($$props, 'searchPlaceholder', 3, 'Search by ID'),
		hasFilters = $.prop($$props, 'hasFilters', 3, false),
		filtersStyle = $.prop($$props, 'filtersStyle', 3, 'chips'),
		analyticsSource = $.prop($$props, 'analyticsSource', 3, '');

	let hasDisplaySettings = $.derived(() => !hideView() || !hideColumns() && $columns()?.length);

	let numberOfOptions = $.derived(() => [
		hasSearch(),
		hasFilters() && $columns()?.length,
		$.get(hasDisplaySettings)
	].filter(Boolean).length);

	let showSearch = $.state(false);
	let showDisplaySettingsModal = $.state(false);
	let showFilters = $.state(false);
	const filterCols = $.derived(() => $columns().map((col) => col.filter !== false ? buildFilterCol(col) : null).filter(Boolean));
	const filtersBadge = $.derived(() => filtersStyle() === 'dropdown' && $parsedTags()?.length ? `${$parsedTags().length}` : undefined);

	afterNavigate((p) => {
		if (!hasFilters()) return;

		const paramQueries = p.to.url.searchParams.get('query');
		const localQueries = queryParamToMap(paramQueries || '[]');
		const localTags = Array.from(localQueries.keys());

		setFilters(localTags, $.get(filterCols), $columns());
	});

	var fragment_6 = root_6();
	var header = $.first_child(fragment_6);
	var node = $.child(header);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = $.comment();
				var node_1 = $.first_child(fragment_7);

				{
					var consequent_11 = ($$anchor) => {
						var fragment_8 = $.comment();
						var node_2 = $.first_child(fragment_8);

						$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
							Layout_Stack_1($$anchor, {
								gap: 'xl',
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_4();
									var node_3 = $.first_child(fragment_9);

									$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
										Layout_Stack_2($$anchor, {
											direction: 'row',
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_1();
												var node_4 = $.first_child(fragment_10);

												{
													var consequent = ($$anchor) => {
														var div = root();

														$.set_style(div, `--button-width: 100%; width: 100%`);

														var node_5 = $.child(div);

														$.snippet(node_5, () => $$props.children);
														$.reset(div);
														$.append($$anchor, div);
													};

													$.if(node_4, ($$render) => {
														if ($$props.children) $$render(consequent);
													});
												}

												var node_6 = $.sibling(node_4, 2);

												{
													var consequent_4 = ($$anchor) => {
														var fragment_11 = $.comment();
														var node_7 = $.first_child(fragment_11);

														{
															var consequent_1 = ($$anchor) => {
																searchButton($$anchor, () => true);
															};

															var consequent_2 = ($$anchor) => {
																filtersButton($$anchor, () => true);
															};

															var consequent_3 = ($$anchor) => {
																settingsButton($$anchor, () => true);
															};

															$.if(node_7, ($$render) => {
																if (hasSearch()) $$render(consequent_1); else if (hasFilters() && $columns()?.length) $$render(consequent_2, 1); else if ($.get(hasDisplaySettings)) $$render(consequent_3, 2);
															});
														}

														$.append($$anchor, fragment_11);
													};

													$.if(node_6, ($$render) => {
														if ($.get(numberOfOptions) === 1) $$render(consequent_4);
													});
												}

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									var node_8 = $.sibling(node_3, 2);

									{
										var consequent_8 = ($$anchor) => {
											var fragment_15 = $.comment();
											var node_9 = $.first_child(fragment_15);

											{
												let $0 = $.derived(() => `--button-width: calc(${100 / $.get(numberOfOptions)}% - var(--gap-s) / 2)`);

												$.component(node_9, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
													Layout_Stack_3($$anchor, {
														direction: 'row',
														gap: 's',
														get style() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_16 = root_2();
															var node_10 = $.first_child(fragment_16);

															{
																var consequent_5 = ($$anchor) => {
																	searchButton($$anchor);
																};

																$.if(node_10, ($$render) => {
																	if (hasSearch()) $$render(consequent_5);
																});
															}

															var node_11 = $.sibling(node_10, 2);

															{
																var consequent_6 = ($$anchor) => {
																	filtersButton($$anchor);
																};

																$.if(node_11, ($$render) => {
																	if (hasFilters() && $columns()?.length) $$render(consequent_6);
																});
															}

															var node_12 = $.sibling(node_11, 2);

															{
																var consequent_7 = ($$anchor) => {
																	settingsButton($$anchor);
																};

																$.if(node_12, ($$render) => {
																	if ($.get(hasDisplaySettings)) $$render(consequent_7);
																});
															}

															$.append($$anchor, fragment_16);
														},
														$$slots: { default: true }
													});
												});
											}

											$.append($$anchor, fragment_15);
										};

										$.if(node_8, ($$render) => {
											if ($.get(numberOfOptions) > 1) $$render(consequent_8);
										});
									}

									var node_13 = $.sibling(node_8, 2);

									{
										var consequent_9 = ($$anchor) => {
											SearchQuery($$anchor, {
												get placeholder() {
													return searchPlaceholder();
												}
											});
										};

										$.if(node_13, ($$render) => {
											if ($.get(showSearch) && hasSearch()) $$render(consequent_9);
										});
									}

									var node_14 = $.sibling(node_13, 2);

									{
										var consequent_10 = ($$anchor) => {
											var div_1 = root_3();
											var node_15 = $.child(div_1);

											ParsedTagList(node_15, {
												get columns() {
													return $$props.columns;
												},

												get analyticsSource() {
													return analyticsSource();
												}
											});

											$.reset(div_1);
											$.append($$anchor, div_1);
										};

										$.if(node_14, ($$render) => {
											if (hasFilters() && filtersStyle() === 'chips') $$render(consequent_10);
										});
									}

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_8);
					};

					var alternate = ($$anchor) => {
						var fragment_21 = $.comment();
						var node_16 = $.first_child(fragment_21);

						$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
							Layout_Stack_4($$anchor, {
								direction: 'row',
								justifyContent: 'space-between',
								alignItems: 'flex-start',
								children: ($$anchor, $$slotProps) => {
									var fragment_22 = root_1();
									var node_17 = $.first_child(fragment_22);

									$.component(node_17, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
										Layout_Stack_5($$anchor, {
											direction: 'row',
											alignItems: 'flex-start',
											gap: 'm',
											style: 'min-width: 0; flex: 1 1 auto;',
											children: ($$anchor, $$slotProps) => {
												var fragment_23 = root_1();
												var node_18 = $.first_child(fragment_23);

												{
													var consequent_12 = ($$anchor) => {
														var div_2 = root_5();
														var node_19 = $.child(div_2);

														SearchQuery(node_19, {
															get placeholder() {
																return searchPlaceholder();
															}
														});

														$.reset(div_2);
														$.append($$anchor, div_2);
													};

													$.if(node_18, ($$render) => {
														if (hasSearch()) $$render(consequent_12);
													});
												}

												var node_20 = $.sibling(node_18, 2);

												{
													var consequent_13 = ($$anchor) => {
														var fragment_24 = $.comment();
														var node_21 = $.first_child(fragment_24);

														$.component(node_21, () => Layout.Stack, ($$anchor, Layout_Stack_6) => {
															Layout_Stack_6($$anchor, {
																direction: 'row',
																alignItems: 'center',
																gap: 's',
																wrap: 'wrap',
																style: 'min-width: 0; flex: 1 1 auto;',
																children: ($$anchor, $$slotProps) => {
																	ParsedTagList($$anchor, {
																		get columns() {
																			return $$props.columns;
																		},

																		get analyticsSource() {
																			return analyticsSource();
																		}
																	});
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_24);
													};

													$.if(node_20, ($$render) => {
														if (hasFilters() && filtersStyle() === 'chips') $$render(consequent_13);
													});
												}

												$.append($$anchor, fragment_23);
											},
											$$slots: { default: true }
										});
									});

									var node_22 = $.sibling(node_17, 2);

									$.component(node_22, () => Layout.Stack, ($$anchor, Layout_Stack_7) => {
										Layout_Stack_7($$anchor, {
											direction: 'row',
											alignItems: 'center',
											justifyContent: 'flex-end',
											style: 'align-self: flex-start; white-space: nowrap;',
											children: ($$anchor, $$slotProps) => {
												var fragment_26 = root_2();
												var node_23 = $.first_child(fragment_26);

												{
													var consequent_14 = ($$anchor) => {
														{
															let $0 = $.derived(() => $.get(filterCols).filter((f) => f?.options));

															QuickFilters($$anchor, {
																get columns() {
																	return $$props.columns;
																},

																get analyticsSource() {
																	return analyticsSource();
																},
																buttonVariant: 'secondary',
																get filterCols() {
																	return $.get($0);
																}
															});
														}
													};

													$.if(node_23, ($$render) => {
														if (hasFilters() && filtersStyle() === 'dropdown') $$render(consequent_14);
													});
												}

												var node_24 = $.sibling(node_23, 2);

												{
													var consequent_15 = ($$anchor) => {
														ViewSelector($$anchor, {
															ui: 'new',
															get view() {
																return view();
															},

															get columns() {
																return $$props.columns;
															},

															get hideView() {
																return hideView();
															},

															get hideColumns() {
																return hideColumns();
															}
														});
													};

													$.if(node_24, ($$render) => {
														if ($.get(hasDisplaySettings)) $$render(consequent_15);
													});
												}

												var node_25 = $.sibling(node_24, 2);

												{
													var consequent_16 = ($$anchor) => {
														var fragment_29 = $.comment();
														var node_26 = $.first_child(fragment_29);

														$.snippet(node_26, () => $$props.children);
														$.append($$anchor, fragment_29);
													};

													$.if(node_25, ($$render) => {
														if ($$props.children) $$render(consequent_16);
													});
												}

												$.append($$anchor, fragment_26);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_22);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_21);
					};

					$.if(node_1, ($$render) => {
						if ($isSmallViewport()) $$render(consequent_11); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	$.reset(header);

	var node_27 = $.sibling(header, 2);

	{
		var consequent_17 = ($$anchor) => {
			DisplaySettingsModal($$anchor, {
				get columns() {
					return $$props.columns;
				},

				get hideColumns() {
					return hideColumns();
				},

				get hideView() {
					return hideView();
				},

				get show() {
					return $.get(showDisplaySettingsModal);
				},

				set show($$value) {
					$.set(showDisplaySettingsModal, $$value, true);
				},

				get view() {
					return view();
				},

				set view($$value) {
					view($$value);
				}
			});
		};

		$.if(node_27, ($$render) => {
			if ($.get(showDisplaySettingsModal)) $$render(consequent_17);
		});
	}

	var node_28 = $.sibling(node_27, 2);

	{
		var consequent_18 = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(filterCols).filter((f) => f?.options));

				FiltersBottomSheet($$anchor, {
					get columns() {
						return $$props.columns;
					},

					get analyticsSource() {
						return analyticsSource();
					},

					get filterCols() {
						return $.get($0);
					},

					get openBottomSheet() {
						return $.get(showFilters);
					},

					set openBottomSheet($$value) {
						$.set(showFilters, $$value, true);
					}
				});
			}
		};

		$.if(node_28, ($$render) => {
			if ($isSmallViewport() && $.get(showFilters)) $$render(consequent_18);
		});
	}

	$.append($$anchor, fragment_6);
	$.pop();
	$$cleanup();
}
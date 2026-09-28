import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { preferences } from '$lib/stores/preferences';
import { onMount } from 'svelte';

import {
	ActionMenu,
	Divider,
	Layout,
	Popover,
	Selector,
	Typography,
	Icon
} from '@appwrite.io/pink-svelte';

import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { Button } from '$lib/elements/forms';

var root = $.from_html(`<!> <div class="svelte-1woiqpp"><!></div> <!>`, 1);
var root_1 = $.from_html(`<div class="svelte-1woiqpp"><!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> `, 1);
var root_4 = $.from_html(`<!> Custom`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<div class="actions-menu-wrapper svelte-1woiqpp"><!></div>`);

export default function ColumnSelector($$anchor, $$props) {
	$.push($$props, true);

	const $columns = () => $.store_get($$props.columns, '$columns', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let isCustomTable = $.prop($$props, 'isCustomTable', 3, false),
		ui = $.prop($$props, 'ui', 3, 'legacy'),
		allowNoColumns = $.prop($$props, 'allowNoColumns', 3, false),
		showAnyway = $.prop($$props, 'showAnyway', 3, false),
		onPreferencesUpdated = $.prop($$props, 'onPreferencesUpdated', 3, null),
		onCustomOptionClick = $.prop($$props, 'onCustomOptionClick', 3, null);

	let search = $.state('');
	let filteredColumns = $.derived(() => $columns().filter((column) => !column.isAction && column.id !== '$sequence').filter((col) => !col.exclude && (col.title?.toLowerCase().includes($.get(search).toLowerCase()) || col.id?.toLowerCase().includes($.get(search).toLowerCase()))));
	let maxHeight = $.state('none');
	let containerRef = $.state(null);
	const isNewStyle = ui() === 'new';

	const calcMaxHeight = () => {
		if ($.get(containerRef)) {
			// get parent row element for correct top position
			const parent = $.get(containerRef)?.parentElement?.parentElement;

			const { top } = parent.getBoundingClientRect();

			$.set(maxHeight, `${window.innerHeight - top - 48}px`);
		}
	};

	const saveColumnPreferences = () => {
		const hiddenColumns = $columns().filter((n) => n.hide === true).map((n) => n.id);

		if (isCustomTable()) {
			onPreferencesUpdated()?.();
			preferences.setCustomTableColumns(page.params.table, hiddenColumns);
		} else {
			preferences.setColumns(hiddenColumns);
		}
	};

	onMount(() => {
		if (isCustomTable()) {
			const hiddenColumns = preferences.getCustomTableColumns(page.params.table);

			$$props.columns.update((n) => n.map((column) => {
				column.hide = hiddenColumns?.includes(column.id) ?? false;

				return column;
			}));
		} else {
			const prefs = preferences.getForRoute(page.route);

			if (prefs?.columns) {
				$$props.columns.update((n) => n.map((column) => {
					column.hide = prefs.columns?.includes(column.id) ?? false;

					return column;
				}));
			}
		}

		calcMaxHeight();
	});

	let selectedColumnsNumber = $.derived(() => $columns().reduce(
		(acc, column) => {
			if (column.hide || column.isAction) return acc;

			return ++acc;
		},
		0
	));

	function toggleColumn(column) {
		$$props.columns.update((cols) => cols.map((col) => col.id === column.id ? { ...col, hide: !col.hide } : col));
		saveColumnPreferences();
	}

	function selectAll() {
		$$props.columns.update((cols) => cols.map((col) => col.exclude
			? col
			: $.get(filteredColumns).some((fc) => fc.id === col.id && !col.disable) ? { ...col, hide: false } : col));

		saveColumnPreferences();
	}

	function deselectAll() {
		$$props.columns.update((cols) => {
			const realColumns = cols.filter((col) => !col.exclude && !col.isAction);
			const filtered = $.get(filteredColumns).filter((col) => !col.exclude && !col.isAction && !col.disable);

			if (filtered.length === 0) return cols;

			const visibleRealColumns = realColumns.filter((col) => !col.hide);

			if (!allowNoColumns() && visibleRealColumns.length <= 1) {
				return cols;
			}

			const willHideCount = filtered.filter((col) => !col.hide).length;

			if (!allowNoColumns() && visibleRealColumns.length - willHideCount < 1) {
				const [keep] = filtered;

				return cols.map((col) => {
					if (col.exclude || col.isAction) return col;
					if (!filtered.some((fc) => fc.id === col.id)) return col;

					if (col.id === keep.id) {
						const stillVisible = cols.filter((c) => !c.exclude && !c.isAction).filter((c) => c.id === keep.id
							? true
							: filtered.some((fc) => fc.id === c.id) ? false : !c.hide);

						if (stillVisible.length === 1 && typeof col.width === 'number') {
							return { ...col, hide: false, width: { min: col.width } };
						}

						return { ...col, hide: false };
					}

					return { ...col, hide: true };
				});
			}

			return cols.map((col) => col.exclude || col.isAction
				? col
				: filtered.some((fc) => fc.id === col.id) ? { ...col, hide: true } : col);
		});

		saveColumnPreferences();
	}

	let visibleRealColumns = $.derived(() => $columns().filter((col) => !col.exclude && !col.isAction && !col.hide));
	var fragment = $.comment();

	$.event('resize', $.window, calcMaxHeight);

	var node = $.first_child(fragment);

	{
		var consequent_4 = ($$anchor) => {
			const showActions = $.derived(() => $columns().length > 1);
			const placement = $.derived(() => isNewStyle ? 'bottom-start' : 'bottom-end');

			Popover($$anchor, {
				get placement() {
					return $.get(placement);
				},
				padding: 'none',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const toggle = $.derived(() => $$slotProps.toggle);
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.snippet(node_1, () => $$props.children, () => $.get(toggle), () => $.get(selectedColumnsNumber));
						$.append($$anchor, fragment_2);
					},

					tooltip: ($$anchor, $$slotProps) => {
						const toggle = $.derived(() => $$slotProps.toggle);
						var div = root_6();
						let styles;
						var node_2 = $.child(div);

						$.component(node_2, () => ActionMenu.Root, ($$anchor, ActionMenu_Root) => {
							ActionMenu_Root($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_5();
									var node_3 = $.first_child(fragment_3);

									{
										var consequent_1 = ($$anchor) => {
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack) => {
												Layout_Stack($$anchor, {
													gap: 'xs',
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = root_2();
														var node_5 = $.first_child(fragment_5);

														$.component(node_5, () => ActionMenu.Item.Input, ($$anchor, ActionMenu_Item_Input) => {
															ActionMenu_Item_Input($$anchor, {
																id: 'columns',
																placeholder: 'Search',
																get value() {
																	return $.get(search);
																},

																set value($$value) {
																	$.set(search, $$value, true);
																}
															});
														});

														var node_6 = $.sibling(node_5, 2);

														{
															var consequent = ($$anchor) => {
																var fragment_6 = $.comment();
																var node_7 = $.first_child(fragment_6);

																$.component(node_7, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
																	Layout_Stack_1($$anchor, {
																		gap: 's',
																		direction: 'row',
																		alignItems: 'center',
																		style: 'padding-block-end: 0.5rem',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_7 = root();
																			var node_8 = $.first_child(fragment_7);

																			Button(node_8, {
																				size: 'xs',
																				icon: true,
																				extraCompact: true,
																				$$events: { click: selectAll },
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text = $.text('Select all');

																					$.append($$anchor, text);
																				},
																				$$slots: { default: true }
																			});

																			var div_1 = $.sibling(node_8, 2);

																			$.set_style(div_1, '', {}, { height: '1rem' });

																			var node_9 = $.child(div_1);

																			Divider(node_9, { vertical: true });
																			$.reset(div_1);

																			var node_10 = $.sibling(div_1, 2);

																			Button(node_10, {
																				size: 'xs',
																				icon: true,
																				extraCompact: true,
																				$$events: { click: deselectAll },
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_1 = $.text('Deselect all');

																					$.append($$anchor, text_1);
																				},
																				$$slots: { default: true }
																			});

																			$.append($$anchor, fragment_7);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_6);
															};

															var alternate = ($$anchor) => {
																var div_2 = root_1();

																$.set_style(div_2, '', {}, { 'padding-inline': '0.6rem', 'padding-block-end': '0.5rem' });

																var node_11 = $.child(div_2);

																$.component(node_11, () => Typography.Text, ($$anchor, Typography_Text) => {
																	Typography_Text($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_2 = $.text('No results found');

																			$.append($$anchor, text_2);
																		},
																		$$slots: { default: true }
																	});
																});

																$.reset(div_2);
																$.append($$anchor, div_2);
															};

															$.if(node_6, ($$render) => {
																if ($.get(filteredColumns).length > 0) $$render(consequent); else $$render(alternate, -1);
															});
														}

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										};

										$.if(node_3, ($$render) => {
											if (isNewStyle && $.get(showActions)) $$render(consequent_1);
										});
									}

									var node_12 = $.sibling(node_3, 2);

									{
										let $0 = $.derived(() => $.get(showActions) ? 'has-actions' : '');

										$.component(node_12, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
											Layout_Stack_2($$anchor, {
												gap: 'none',
												direction: 'column',
												get class() {
													return `filter-modal-actions-menu ${$.get($0) ?? ''}`;
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_8 = $.comment();
													var node_13 = $.first_child(fragment_8);

													$.each(node_13, 17, () => $.get(filteredColumns), $.index, ($$anchor, column) => {
														var fragment_9 = $.comment();
														var node_14 = $.first_child(fragment_9);

														{
															var consequent_2 = ($$anchor) => {
																var fragment_10 = $.comment();
																var node_15 = $.first_child(fragment_10);

																{
																	let $0 = $.derived(() => allowNoColumns()
																		? false
																		: $.get(visibleRealColumns).length <= 1 && !$.get(column).hide || $.get(column).disable);

																	$.component(node_15, () => ActionMenu.Item.Button, ($$anchor, ActionMenu_Item_Button) => {
																		ActionMenu_Item_Button($$anchor, {
																			get disabled() {
																				return $.get($0);
																			},
																			$$events: { click: () => toggleColumn($.get(column)) },
																			children: ($$anchor, $$slotProps) => {
																				var fragment_11 = $.comment();
																				var node_16 = $.first_child(fragment_11);

																				$.component(node_16, () => Layout.Stack, ($$anchor, Layout_Stack_3) => {
																					Layout_Stack_3($$anchor, {
																						direction: 'row',
																						gap: 's',
																						children: ($$anchor, $$slotProps) => {
																							var fragment_12 = root_3();
																							var node_17 = $.first_child(fragment_12);

																							{
																								let $0 = $.derived(() => !$.get(column).hide);

																								$.component(node_17, () => Selector.Checkbox, ($$anchor, Selector_Checkbox) => {
																									Selector_Checkbox($$anchor, {
																										size: 's',
																										get checked() {
																											return $.get($0);
																										},
																										$$events: { change: () => toggleColumn($.get(column)) }
																									});
																								});
																							}

																							var text_3 = $.sibling(node_17);

																							$.template_effect(() => $.set_text(text_3, ` ${$.get(column).title ?? ''}`));
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
																}

																$.append($$anchor, fragment_10);
															};

															$.if(node_14, ($$render) => {
																if (!$.get(column)?.exclude) $$render(consequent_2);
															});
														}

														$.append($$anchor, fragment_9);
													});

													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});
									}

									var node_18 = $.sibling(node_12, 2);

									{
										var consequent_3 = ($$anchor) => {
											var fragment_13 = root_2();
											var node_19 = $.first_child(fragment_13);

											Divider(node_19, {});

											var node_20 = $.sibling(node_19, 2);

											$.component(node_20, () => Layout.Stack, ($$anchor, Layout_Stack_4) => {
												Layout_Stack_4($$anchor, {
													gap: 's',
													direction: 'row',
													style: 'padding-block-start: 0.175rem',
													children: ($$anchor, $$slotProps) => {
														Button($$anchor, {
															text: true,
															size: 's',
															fullWidth: true,
															$$events: {
																click: () => {
																	$.get(toggle)();
																	onCustomOptionClick()();
																}
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_15 = $.comment();
																var node_21 = $.first_child(fragment_15);

																$.component(node_21, () => Layout.Stack, ($$anchor, Layout_Stack_5) => {
																	Layout_Stack_5($$anchor, {
																		direction: 'row',
																		gap: 's',
																		alignItems: 'center',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_16 = root_4();
																			var node_22 = $.first_child(fragment_16);

																			Icon(node_22, {
																				get icon() {
																					return IconPlus;
																				},
																				size: 's'
																			});

																			$.next();
																			$.append($$anchor, fragment_16);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_15);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_13);
										};

										$.if(node_18, ($$render) => {
											if (onCustomOptionClick() && isCustomTable()) $$render(consequent_3);
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div);
						$.bind_this(div, ($$value) => $.set(containerRef, $$value), () => $.get(containerRef));
						$.template_effect(() => styles = $.set_style(div, '', styles, { 'max-height': $.get(maxHeight) }));
						$.append($$anchor, div);
					}
				}
			});
		};

		$.if(node, ($$render) => {
			if ($columns()?.length || showAnyway()) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}
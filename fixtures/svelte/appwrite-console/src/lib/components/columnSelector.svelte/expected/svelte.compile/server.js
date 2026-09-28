import * as $ from 'svelte/internal/server';
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

export default function ColumnSelector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			columns,
			isCustomTable = false,
			ui = 'legacy',
			allowNoColumns = false,
			showAnyway = false,
			children,
			onPreferencesUpdated = null,
			onCustomOptionClick = null
		} = $$props;

		let search = '';
		let filteredColumns = $.derived(() => $.store_get($$store_subs ??= {}, '$columns', columns).filter((column) => !column.isAction && column.id !== '$sequence').filter((col) => !col.exclude && (col.title?.toLowerCase().includes(search.toLowerCase()) || col.id?.toLowerCase().includes(search.toLowerCase()))));
		let maxHeight = 'none';
		let containerRef = null;
		const isNewStyle = ui === 'new';

		const calcMaxHeight = () => {
			if (containerRef) {
				// get parent row element for correct top position
				const parent = containerRef?.parentElement?.parentElement;

				const { top } = parent.getBoundingClientRect();

				maxHeight = `${window.innerHeight - top - 48}px`;
			}
		};

		const saveColumnPreferences = () => {
			const hiddenColumns = $.store_get($$store_subs ??= {}, '$columns', columns).filter((n) => n.hide === true).map((n) => n.id);

			if (isCustomTable) {
				onPreferencesUpdated?.();
				preferences.setCustomTableColumns(page.params.table, hiddenColumns);
			} else {
				preferences.setColumns(hiddenColumns);
			}
		};

		onMount(() => {
			if (isCustomTable) {
				const hiddenColumns = preferences.getCustomTableColumns(page.params.table);

				columns.update((n) => n.map((column) => {
					column.hide = hiddenColumns?.includes(column.id) ?? false;

					return column;
				}));
			} else {
				const prefs = preferences.getForRoute(page.route);

				if (prefs?.columns) {
					columns.update((n) => n.map((column) => {
						column.hide = prefs.columns?.includes(column.id) ?? false;

						return column;
					}));
				}
			}

			calcMaxHeight();
		});

		let selectedColumnsNumber = $.derived(() => $.store_get($$store_subs ??= {}, '$columns', columns).reduce(
			(acc, column) => {
				if (column.hide || column.isAction) return acc;

				return ++acc;
			},
			0
		));

		function toggleColumn(column) {
			columns.update((cols) => cols.map((col) => col.id === column.id ? { ...col, hide: !col.hide } : col));
			saveColumnPreferences();
		}

		function selectAll() {
			columns.update((cols) => cols.map((col) => col.exclude
				? col
				: filteredColumns().some((fc) => fc.id === col.id && !col.disable) ? { ...col, hide: false } : col));

			saveColumnPreferences();
		}

		function deselectAll() {
			columns.update((cols) => {
				const realColumns = cols.filter((col) => !col.exclude && !col.isAction);
				const filtered = filteredColumns().filter((col) => !col.exclude && !col.isAction && !col.disable);

				if (filtered.length === 0) return cols;

				const visibleRealColumns = realColumns.filter((col) => !col.hide);

				if (!allowNoColumns && visibleRealColumns.length <= 1) {
					return cols;
				}

				const willHideCount = filtered.filter((col) => !col.hide).length;

				if (!allowNoColumns && visibleRealColumns.length - willHideCount < 1) {
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

		let visibleRealColumns = $.derived(() => $.store_get($$store_subs ??= {}, '$columns', columns).filter((col) => !col.exclude && !col.isAction && !col.hide));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if ($.store_get($$store_subs ??= {}, '$columns', columns)?.length || showAnyway) {
				$$renderer.push('<!--[0-->');

				const showActions = $.store_get($$store_subs ??= {}, '$columns', columns).length > 1;
				const placement = isNewStyle ? 'bottom-start' : 'bottom-end';

				Popover($$renderer, {
					placement,
					padding: 'none',
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { toggle }) => {
							children($$renderer, toggle, selectedColumnsNumber());
							$$renderer.push(`<!---->`);
						},

						tooltip: ($$renderer, { toggle }) => {
							{
								$$renderer.push(`<div class="actions-menu-wrapper svelte-1woiqpp"${$.attr_style('', { 'max-height': maxHeight })}>`);

								if (ActionMenu.Root) {
									$$renderer.push('<!--[-->');

									ActionMenu.Root($$renderer, {
										children: ($$renderer) => {
											if (isNewStyle && showActions) {
												$$renderer.push('<!--[0-->');

												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 'xs',
														children: ($$renderer) => {
															if (ActionMenu.Item.Input) {
																$$renderer.push('<!--[-->');

																ActionMenu.Item.Input($$renderer, {
																	id: 'columns',
																	placeholder: 'Search',
																	get value() {
																		return search;
																	},

																	set value($$value) {
																		search = $$value;
																		$$settled = false;
																	}
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (filteredColumns().length > 0) {
																$$renderer.push('<!--[0-->');

																if (Layout.Stack) {
																	$$renderer.push('<!--[-->');

																	Layout.Stack($$renderer, {
																		gap: 's',
																		direction: 'row',
																		alignItems: 'center',
																		style: 'padding-block-end: 0.5rem',
																		children: ($$renderer) => {
																			Button($$renderer, {
																				size: 'xs',
																				icon: true,
																				extraCompact: true,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Select all`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!----> <div class="svelte-1woiqpp"${$.attr_style('', { height: '1rem' })}>`);
																			Divider($$renderer, { vertical: true });
																			$$renderer.push(`<!----></div> `);

																			Button($$renderer, {
																				size: 'xs',
																				icon: true,
																				extraCompact: true,
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Deselect all`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!---->`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															} else {
																$$renderer.push(`<!--[-1--><div class="svelte-1woiqpp"${$.attr_style('', { 'padding-inline': '0.6rem', 'padding-block-end': '0.5rem' })}>`);

																if (Typography.Text) {
																	$$renderer.push('<!--[-->');

																	Typography.Text($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->No results found`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(`</div>`);
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]--> `);

											if (Layout.Stack) {
												$$renderer.push('<!--[-->');

												Layout.Stack($$renderer, {
													gap: 'none',
													direction: 'column',
													class: `filter-modal-actions-menu ${showActions ? 'has-actions' : ''}`,
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array = $.ensure_array_like(filteredColumns());

														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
															let column = each_array[$$index];

															if (!column?.exclude) {
																$$renderer.push('<!--[0-->');

																if (ActionMenu.Item.Button) {
																	$$renderer.push('<!--[-->');

																	ActionMenu.Item.Button($$renderer, {
																		disabled: allowNoColumns
																			? false
																			: visibleRealColumns().length <= 1 && !column.hide || column.disable,

																		children: ($$renderer) => {
																			if (Layout.Stack) {
																				$$renderer.push('<!--[-->');

																				Layout.Stack($$renderer, {
																					direction: 'row',
																					gap: 's',
																					children: ($$renderer) => {
																						if (Selector.Checkbox) {
																							$$renderer.push('<!--[-->');
																							Selector.Checkbox($$renderer, { size: 's', checked: !column.hide });
																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}

																						$$renderer.push(` ${$.escape(column.title)}`);
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
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]-->`);
														}

														$$renderer.push(`<!--]-->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (onCustomOptionClick && isCustomTable) {
												$$renderer.push('<!--[0-->');
												Divider($$renderer, {});
												$$renderer.push(`<!----> `);

												if (Layout.Stack) {
													$$renderer.push('<!--[-->');

													Layout.Stack($$renderer, {
														gap: 's',
														direction: 'row',
														style: 'padding-block-start: 0.175rem',
														children: ($$renderer) => {
															Button($$renderer, {
																text: true,
																size: 's',
																fullWidth: true,
																children: ($$renderer) => {
																	if (Layout.Stack) {
																		$$renderer.push('<!--[-->');

																		Layout.Stack($$renderer, {
																			direction: 'row',
																			gap: 's',
																			alignItems: 'center',
																			children: ($$renderer) => {
																				Icon($$renderer, { icon: IconPlus, size: 's' });
																				$$renderer.push(`<!----> Custom`);
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
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											} else {
												$$renderer.push('<!--[-1-->');
											}

											$$renderer.push(`<!--]-->`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</div>`);
							}
						}
					}
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
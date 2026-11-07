import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { resize } from "../helpers/actions/resize";
import { getCssName, getStyle } from "../helpers/columnWidth";
import Filter from "./inlineFilters/Filter.svelte";
import { setID } from "@svar-ui/lib-dom";

var root = $.from_html(`<div role="button" tabindex="0"><div class="wx-text svelte-1t83xbl"> </div></div>`);
var root_1 = $.from_html(`<div aria-hidden="true"></div>`);
var root_2 = $.from_html(`<div class="wx-collapse svelte-1t83xbl" role="button" tabindex="0"><i></i></div>`);
var root_3 = $.from_html(`<div class="wx-text svelte-1t83xbl"> </div>`);
var root_4 = $.from_html(`<div class="wx-grip svelte-1t83xbl" role="presentation" aria-label="Resize column"><div class="svelte-1t83xbl"></div></div>`);
var root_5 = $.from_html(`<div class="wx-order svelte-1t83xbl"> </div>`);
var root_6 = $.from_html(`<!> <i></i>`, 1);
var root_7 = $.from_html(`<div class="wx-sort svelte-1t83xbl"><!></div>`);
var root_8 = $.from_html(`<div role="columnheader"><!> <!> <!> <!></div>`);

export default function HeaderCell($$anchor, $$props) {
	$.push($$props, true);

	const $sortMarks = () => $.store_get(sortMarks, '$sortMarks', $$stores);
	const $scrollLeft = () => $.store_get(scrollLeft, '$scrollLeft', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const api = getContext("grid-store");
	const { sortMarks, scrollLeft } = api.getReactiveState();
	let start;
	let sortMark = $.derived(() => $sortMarks()[$$props.column.id]);

	function down(node) {
		start = $$props.cell.flexgrow ? node.parentNode.clientWidth : $$props.cell.width;
	}

	function move(dx) {
		resizeColumn(dx, true);
	}

	function up(dx) {
		resizeColumn(dx, false);
	}

	function resizeColumn(dx, inProgress) {
		api.exec("resize-column", {
			id: $$props.cell.id,
			width: Math.max(1, start + dx),
			inProgress
		});
	}

	function sort(ev) {
		if (!$$props.column.sort || $$props.cell.filter) return;

		if ($.get(sortMark)?.order) {
			$.get(sortMark).order = $.get(sortMark)?.order === "asc" ? "desc" : "asc";
		}

		api.exec("sort-rows", {
			key: $$props.cell.id,
			add: ev.ctrlKey || ev.metaKey,
			order: $.get(sortMark)?.order
		});
	}

	function collapse(ev) {
		if (ev) ev.stopPropagation();

		api.exec("collapse-column", { id: $$props.cell.id, row: $$props.row });
	}

	function toggleCollapseColumn(ev) {
		if (ev.key === "Enter") collapse();
	}

	function toggleSortColumn(ev) {
		if (ev.key === "Enter" && !$$props.cell.filter) sort(ev);
	}

	let isCollapsed = $.derived(() => $$props.cell.collapsed && $$props.column?.collapsed);
	const isCenterColumn = $.derived(() => $$props.hasSplit && ($$props.column?.fixed === 0 || !$$props.column?.fixed));

	const centerBounds = $.derived(() => {
		if (!$$props.hasSplit || !$.get(isCenterColumn)) return { visible: false, clip: "" };

		const width = $$props.cell.width || $$props.column.width;
		const x = $$props.deltaLeft + $$props.cell.left - $scrollLeft();
		const centerRight = $$props.viewportWidth - $$props.rightColumnsWidth;

		if (x + width <= $$props.leftColumnsWidth || x >= centerRight) {
			return { visible: false, clip: "" };
		}

		const hiddenLeft = Math.max(0, $$props.leftColumnsWidth - x);
		const hiddenRight = Math.max(0, x + width - centerRight);

		return {
			visible: true,
			clip: hiddenLeft || hiddenRight
				? `clip-path:inset(0px ${hiddenRight}px 0px ${hiddenLeft}px);`
				: ""
		};
	});

	// 1) no split: all collapsed columns render with content
	// 2) split + fixed: fixed columns render with content
	// 3) split + center: only when visible in center area (clip if partially hidden)
	const showCollapsedContent = $.derived(() => !$$props.hasSplit || !$.get(isCenterColumn) || $.get(centerBounds).visible);

	const collapsedClip = $.derived(() => $$props.hasSplit && $.get(isCenterColumn) && $.get(centerBounds).visible ? $.get(centerBounds).clip : "");

	let collapsedTextStyle = $.derived(() => $.get(showCollapsedContent)
		? `top:-${$$props.bodyHeight / 2}px;position:absolute;`
		: "");

	let style = $.derived(() => getStyle($$props.cell.width, $$props.cell.flexgrow, $$props.column.fixed, $$props.column.left, $$props.cell.right ?? $$props.column.right, $$props.cell.height + ($.get(isCollapsed) && $.get(showCollapsedContent) ? $$props.bodyHeight : 0)) + $.get(collapsedClip));
	const css = $.derived(() => getCssName($$props.column, $$props.cell, $$props.columnStyle));

	function getCell() {
		return Object.fromEntries(Object.entries($$props.cell).filter(([key]) => key !== "cell"));
	}

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var div = root();
					var div_1 = $.child(div);
					var text = $.only_child(div_1, true);

					$.reset(div);

					$.template_effect(
						($0) => {
							$.set_class(div, 1, `wx-cell ${$.get(css) ?? ''} ${($$props.cell.css || '') ?? ''} wx-collapsed`, 'svelte-1t83xbl');
							$.set_style(div, $.get(style));
							$.set_attribute(div, 'aria-label', `Expand column ${$$props.cell.text || ""}`);
							$.set_attribute(div, 'aria-expanded', !$$props.cell.collapsed);
							$.set_attribute(div, 'data-header-id', $0);
							$.set_style(div_1, $.get(collapsedTextStyle));
							$.set_text(text, $$props.cell.text || "");
						},
						[() => setID($$props.column.id)]
					);

					$.delegated('keydown', div, toggleCollapseColumn);
					$.delegated('click', div, collapse);
					$.append($$anchor, div);
				};

				var alternate = ($$anchor) => {
					var div_2 = root_1();

					$.template_effect(
						($0) => {
							$.set_class(div_2, 1, `wx-cell ${$.get(css) ?? ''} ${($$props.cell.css || '') ?? ''} wx-collapsed`, 'svelte-1t83xbl');
							$.set_style(div_2, $.get(style));
							$.set_attribute(div_2, 'data-header-id', $0);
						},
						[() => setID($$props.column.id)]
					);

					$.append($$anchor, div_2);
				};

				$.if(node_2, ($$render) => {
					if ($.get(showCollapsedContent)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate_2 = ($$anchor) => {
			var div_3 = root_8();
			let classes;
			var node_3 = $.child(div_3);

			{
				var consequent_2 = ($$anchor) => {
					var div_4 = root_2();
					var i = $.only_child(div_4);

					$.template_effect(() => {
						$.set_attribute(div_4, 'aria-label', $$props.cell.collapsed ? "Expand column" : "Collapse column");
						$.set_attribute(div_4, 'aria-expanded', !$$props.cell.collapsed);
						$.set_class(i, 1, `wxi-angle-${$$props.cell.collapsed ? 'down' : 'right'}`, 'svelte-1t83xbl');
					});

					$.delegated('keydown', div_4, toggleCollapseColumn);
					$.delegated('click', div_4, collapse);
					$.append($$anchor, div_4);
				};

				$.if(node_3, ($$render) => {
					if ($$props.cell.collapsible) $$render(consequent_2);
				});
			}

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent_3 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_5 = $.first_child(fragment_2);

					{
						let $0 = $.derived(getCell);

						$.component(node_5, () => $$props.cell.cell, ($$anchor, cell_cell) => {
							cell_cell($$anchor, {
								get api() {
									return api;
								},

								get cell() {
									return $.get($0);
								},

								get column() {
									return $$props.column;
								},

								get row() {
									return $$props.row;
								},
								onaction: ({ action, data }) => api.exec(action, data)
							});
						});
					}

					$.append($$anchor, fragment_2);
				};

				var consequent_4 = ($$anchor) => {
					Filter($$anchor, {
						get filter() {
							return $$props.cell.filter;
						},

						get column() {
							return $$props.column;
						}
					});
				};

				var alternate_1 = ($$anchor) => {
					var div_5 = root_3();
					var text_1 = $.only_child(div_5, true);

					$.template_effect(() => $.set_text(text_1, $$props.cell.text || ""));
					$.append($$anchor, div_5);
				};

				$.if(node_4, ($$render) => {
					if ($$props.cell.cell) $$render(consequent_3); else if ($$props.cell.filter) $$render(consequent_4, 1); else $$render(alternate_1, -1);
				});
			}

			var node_6 = $.sibling(node_4, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_6 = root_4();

					$.action(div_6, ($$node, $$action_arg) => resize?.($$node, $$action_arg), () => ({ down, move, up }));
					$.delegated('click', div_6, (ev) => ev.stopPropagation());
					$.append($$anchor, div_6);
				};

				$.if(node_6, ($$render) => {
					if ($$props.column.resize && $$props.lastRow && !$$props.cell._hidden) $$render(consequent_5);
				});
			}

			var node_7 = $.sibling(node_6, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_7 = root_7();
					var node_8 = $.child(div_7);

					{
						var consequent_7 = ($$anchor) => {
							var fragment_4 = root_6();
							var node_9 = $.first_child(fragment_4);

							{
								var consequent_6 = ($$anchor) => {
									var div_8 = root_5();
									var text_2 = $.only_child(div_8, true);

									$.template_effect(() => $.set_text(text_2, $.get(sortMark).index + 1));
									$.append($$anchor, div_8);
								};

								$.if(node_9, ($$render) => {
									if (typeof $.get(sortMark).index !== "undefined") $$render(consequent_6);
								});
							}

							var i_1 = $.sibling(node_9, 2);

							$.template_effect(() => $.set_class(i_1, 1, `wxi-arrow-${$.get(sortMark).order === 'asc' ? 'up' : 'down'}`, 'svelte-1t83xbl'));
							$.append($$anchor, fragment_4);
						};

						$.if(node_8, ($$render) => {
							if ($.get(sortMark)) $$render(consequent_7);
						});
					}

					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				$.if(node_7, ($$render) => {
					if ($$props.sortRow) $$render(consequent_8);
				});
			}

			$.reset(div_3);

			$.template_effect(
				($0) => {
					classes = $.set_class(div_3, 1, `wx-cell ${$.get(css) ?? ''} ${($$props.cell.css || '') ?? ''}`, 'svelte-1t83xbl', classes, {
						'wx-filter': $$props.cell.filter,
						'wx-fixed-right': $$props.column.fixed && $$props.column.fixed.right
					});

					$.set_style(div_3, $.get(style));
					$.set_attribute(div_3, 'data-header-id', $0);
					$.set_attribute(div_3, 'tabindex', !$$props.cell._hidden && $$props.column.sort && !$$props.cell.filter ? "0" : undefined);
					$.set_attribute(div_3, 'aria-colindex', $$props.column._colindex);
					$.set_attribute(div_3, 'aria-colspan', $$props.cell.colspan > 1 ? $$props.cell.colspan : undefined);
					$.set_attribute(div_3, 'aria-rowspan', $$props.cell.rowspan > 1 ? $$props.cell.rowspan : undefined);

					$.set_attribute(div_3, 'aria-sort', !$.get(sortMark)?.order || $$props.cell.filter
						? "none"
						: $.get(sortMark)?.order === "asc" ? "ascending" : "descending");
				},
				[() => setID($$props.column.id)]
			);

			$.delegated('click', div_3, sort);
			$.delegated('keydown', div_3, toggleSortColumn);
			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if ($.get(isCollapsed)) $$render(consequent_1); else $$render(alternate_2, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['keydown', 'click']);
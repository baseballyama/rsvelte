import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, tick, onMount, untrack } from "svelte";
import { onresize } from "../helpers/actions/onresize";
import { reorder as drag, getOffset } from "../helpers/actions/reorder";
import { resetAutoScroll, tryAutoScroll } from "../helpers/actions/dragscroll";
import { clickOutside, delegateClick, locate, setID, locateID, getID } from "@svar-ui/lib-dom";
import { hotkeys, defaultHotkeys } from "@svar-ui/grid-store";
import { scrollTo } from "@svar-ui/grid-store";
import Cell from "./Cell.svelte";
import HeaderFooter from "./HeaderFooter.svelte";
import Overlay from "./Overlay.svelte";
import Editor from "./inlineEditors/Editor.svelte";
import Print from "./print/Print.svelte";

var root = $.from_html(`<div class="wx-header-wrapper svelte-kalntq"><!></div>`);
var root_1 = $.from_html(`<div class="wx-cell wx-collapsed svelte-kalntq"></div>`);
var root_2 = $.from_html(`<div role="row" tabindex="-1"></div>`);
var root_3 = $.from_html(`<div><div class="wx-table-box svelte-kalntq"><div class="wx-scroll svelte-kalntq"><!> <div class="wx-body svelte-kalntq"><!> <div class="wx-data svelte-kalntq"></div></div> <!></div></div></div> <!>`, 1);

export default function Layout($$anchor, $$props) {
	$.push($$props, true);

	const $_columns = () => $.store_get(_columns, '$_columns', $$stores);
	const $_sizes = () => $.store_get(_sizes, '$_sizes', $$stores);
	const $split = () => $.store_get(split, '$split', $$stores);
	const $scrollLeft = () => $.store_get(scrollLeft, '$scrollLeft', $$stores);
	const $data = () => $.store_get(data, '$data', $$stores);
	const $scrollTop = () => $.store_get(scrollTop, '$scrollTop', $$stores);
	const $_rowHeightFromData = () => $.store_get(_rowHeightFromData, '$_rowHeightFromData', $$stores);
	const $dynamic = () => $.store_get(dynamic, '$dynamic', $$stores);
	const $selectedRows = () => $.store_get(selectedRows, '$selectedRows', $$stores);
	const $focusCell = () => $.store_get(focusCell, '$focusCell', $$stores);
	const $select = () => $.store_get(select, '$select', $$stores);
	const $tree = () => $.store_get(tree, '$tree', $$stores);
	const $reorder = () => $.store_get(reorder, '$reorder', $$stores);
	const $undo = () => $.store_get(undo, '$undo', $$stores);
	const $editor = () => $.store_get(editor, '$editor', $$stores);
	const $_print = () => $.store_get(_print, '$_print', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const api = getContext("grid-store");

	const {
		dynamic,
		_columns,
		flatData: data,
		split,
		_sizes,
		selectedRows,
		select,
		editor,
		scroll,
		scrollLeft,
		scrollTop,
		tree,
		focusCell,
		_print,
		undo,
		reorder,
		_rowHeightFromData
	} = api.getReactiveState();

	// will be calculated once, after rendering
	let SCROLLSIZE = $.state(0);

	onMount(() => $.set(SCROLLSIZE, getScrollSize(), true));

	let bodyClientHeight = $.state(0);

	const hasAny = $.derived(() => {
		return $_columns().some((col) => !col.hidden && col.flexgrow);
	});

	const defaultRowHeight = $.derived(() => $_sizes().rowHeight);
	let tableNode;

	// draggableRows: boolean for all rows, or a (row) => boolean predicate
	const isRowDraggable = (row) => typeof $$props.draggableRows === "function" ? $$props.draggableRows(row) : $$props.draggableRows;

	let // reorder
	dragItem = $.state(null);

	let dragNode = $.state(null);
	let rowHeights = [];
	let renderedHeight = $.state(0);
	let renderEnd = $.state(0);

	const fullWidth = $.derived(() => $_columns().reduce(
		(acc, col) => {
			if (!col.hidden) {
				acc += col.width;
			}

			return acc;
		},
		0
	));

	// $inspect(fullWidth, "fullWidth");
	// mark split left columns
	const leftColumns = $.derived(() => {
		let columns = [];
		let width = 0;

		if ($split().left) {
			columns = $_columns().slice(0, $split().left).filter((c) => !c.hidden).map((a) => ({ ...a }));

			columns.forEach((a) => {
				a.fixed = { left: 1, leftSize: $split().left };
				a.left = width;
				width += a.width;
			});

			if (columns.length) columns[columns.length - 1].fixed.left = -1;
		}

		return { columns, width };
	});

	// mark split right columns
	const rightColumns = $.derived(() => {
		let columns = [];
		let width = 0;

		if ($split().right) {
			columns = $_columns().slice($split().right * -1).filter((c) => !c.hidden).map((a) => ({ ...a }));

			for (let i = columns.length - 1; i >= 0; i--) {
				const col = columns[i];

				col.fixed = { right: 1 };
				col.right = width;
				width += col.width;
			}

			if (columns.length) columns[0].fixed = { right: -1 };
		}

		return { columns, width };
	});

	// $inspect(leftColumns, "leftColumns");
	const centerColumns = $.derived(() => {
		const center = $_columns().slice($split().left, $_columns().length - ($split().right ?? 0)).filter((c) => !c.hidden);

		center.forEach((a) => {
			a.fixed = 0;
		});

		return center;
	});

	const EXTRACOLUMNS = 1;

	const renderColumns = $.derived(() => {
		let data, header, footer;

		// get visible columns
		const left = $scrollLeft();

		const right = $scrollLeft() + $$props.clientWidth;
		let start = 0;
		let end = 0;
		let sum = 0;
		let d = 0;

		$.get(centerColumns).forEach((col, index) => {
			if (left > sum) {
				start = index;
				d = sum;
			}

			sum = sum + col.width;

			if (right > sum) end = index + EXTRACOLUMNS;
		});

		// header and footer cells correction depending on colSpans
		const rightSpanDelta = { header: 0, footer: 0 };

		for (let i = end; i >= start; i--) {
			["header", "footer"].forEach((key) => {
				if ($.get(centerColumns)[i]) $.get(centerColumns)[i][key].forEach((hCell) => {
					const colspan = hCell.colspan;

					if (colspan && colspan > 1) {
						const diff = colspan - (end - i + 1);

						if (diff > 0) {
							rightSpanDelta[key] = Math.max(rightSpanDelta[key], diff);
						}
					}
				});
			});
		}

		// include visible header/footer spans
		const headerPos = getHeaderPosition(start, d, "header");

		const footerPos = getHeaderPosition(start, d, "footer");
		const dh = headerPos.delta;
		const csH = headerPos.index;
		const df = footerPos.delta;
		const csF = footerPos.index;
		const renderAll = $.get(hasAny) && $.get(fullWidth) > $$props.clientWidth;

		if (renderAll) {
			data = header = footer = [
				...$.get(leftColumns).columns,
				...$.get(centerColumns),
				...$.get(rightColumns).columns
			];
		} else {
			data = [
				...$.get(leftColumns).columns,
				...$.get(centerColumns).slice(start, end + 1),
				...$.get(rightColumns).columns
			];

			header = [
				...$.get(leftColumns).columns,
				...$.get(centerColumns).slice(csH, end + rightSpanDelta.header + 1),
				...$.get(rightColumns).columns
			];

			footer = [
				...$.get(leftColumns).columns,
				...$.get(centerColumns).slice(csF, end + rightSpanDelta.footer + 1),
				...$.get(rightColumns).columns
			];
		}

		return renderAll
			? { data, header, footer, d: 0, df: 0, dh: 0 }
			: { data, header, footer, d, df, dh };
	});

	// $inspect(renderColumns, "renderColumns");
	const headerHeight = $.derived(() => $$props.header ? $_sizes().headerHeight : 0);

	const footerHeight = $.derived(() => $$props.footer && $data().length ? $_sizes().footerHeight : 0);
	const hasHScroll = $.derived(() => $$props.clientWidth && $$props.clientHeight ? $.get(fullWidth) >= $$props.clientWidth : false);
	const visibleRowsHeight = $.derived(() => $$props.clientHeight - $.get(headerHeight) - $.get(footerHeight) - ($.get(hasHScroll) ? $.get(SCROLLSIZE) : 0));
	const visibleRows = $.derived(() => Math.ceil($.get(visibleRowsHeight) / $.get(defaultRowHeight)) + 1);
	let hasVScroll = $.state(false);

	function setVScroll() {
		$.set(
			hasVScroll,
			$$props.clientWidth && $$props.clientHeight
				? $.get(fullHeight) + $.get(headerHeight) + $.get(footerHeight) >= $$props.clientHeight - ($.get(fullWidth) >= $$props.clientWidth ? $.get(SCROLLSIZE) : 0)
				: false,
			true
		);
	}

	$.user_effect(() => {
		$.get(bodyClientHeight);
		untrack(() => requestAnimationFrame(setVScroll));
	});

	$.user_effect(() => {
		$$props.clientHeight;
		untrack(setVScroll);
	});

	const contentWidth = $.derived(() => $.get(hasAny) && $.get(fullWidth) <= $$props.clientWidth
		? $$props.clientWidth - ($.get(hasVScroll) ? $.get(SCROLLSIZE) : 0)
		: $.get(fullWidth));

	// set global width
	// if we have flexible columns
	// then ignore the fullWidth as it doesn't include flex columns and has no meaning in this context
	const globalWidth = $.derived(() => $.get(hasAny) && $.get(fullWidth) <= $$props.clientWidth
		? $$props.clientWidth
		: $.get(contentWidth) < $$props.clientWidth
			? $.get(fullWidth) + ($.get(hasVScroll) ? $.get(SCROLLSIZE) : 0)
			: -1);

	// $inspect(globalWidth, "globalWidth");
	const bodyContentHeight = $.derived(() => $.get(footerHeight)
		? Math.min($.get(bodyClientHeight) + 1, $.get(visibleRowsHeight) - +$$props.footer)
		: $.get(visibleRowsHeight));

	// request data if necessary
	const EXTRAROWS = 2;

	const renderRows = $.derived(() => {
		let start = 0, deltaTop = 0;

		if ($$props.autoRowHeight) {
			let st = $scrollTop();

			while (st > 0) {
				st -= rowHeights[start] || $.get(defaultRowHeight);
				start++;
			}

			// space to first rendered row
			deltaTop = $scrollTop() - st;

			for (let i = Math.max(0, start - EXTRAROWS - 1); i < start; i++) deltaTop -= rowHeights[start - i] || $.get(defaultRowHeight);

			start = Math.max(0, start - EXTRAROWS);
		} else {
			if ($_rowHeightFromData()) {
				let startInd = 0;
				let topHeight = 0;

				for (let i = 0; i < $data().length; i++) {
					const height = $data()[i].rowHeight || $.get(defaultRowHeight);

					if (topHeight + height > $scrollTop()) {
						startInd = i;

						break;
					}

					topHeight += height;
				}

				start = Math.max(0, startInd - EXTRAROWS);

				for (let i = 0; i < start; i++) {
					deltaTop += $data()[i].rowHeight || $.get(defaultRowHeight);
				}

				let visibleRowsCount = 0;
				let currentHeight = 0;

				for (let i = startInd + 1; i < $data().length; i++) {
					const height = $data()[i].rowHeight || $.get(defaultRowHeight);

					visibleRowsCount++;

					if (currentHeight + height > $.get(visibleRowsHeight)) {
						break;
					}

					currentHeight += height;
				}

				const end = Math.min($dynamic() ? $dynamic().rowCount : $data().length, startInd + visibleRowsCount + EXTRAROWS);

				return { d: deltaTop, start, end };
			}

			start = Math.floor($scrollTop() / $.get(defaultRowHeight));
			start = Math.max(0, start - EXTRAROWS);
			deltaTop = start * $.get(defaultRowHeight);
		}

		const end = Math.min($dynamic() ? $dynamic().rowCount : $data().length, start + $.get(visibleRows) + EXTRAROWS);

		return { d: deltaTop, start, end };
	});

	let lastCall = {};

	$.user_effect(() => {
		if ($dynamic() && (lastCall.start !== $.get(renderRows).start || lastCall.end !== $.get(renderRows).end)) {
			const { start, end } = $.get(renderRows);

			lastCall = { start, end };
			api.exec("request-data", { row: { start, end } });
		}
	});

	const dataRows = $.derived(() => {
		if ($dynamic()) return $data(); else {
			return $data().slice($.get(renderRows).start, $.get(renderRows).end);
		}
	});

	//get visible selection
	const visibleSelection = $.derived(() => $selectedRows().filter((s) => $.get(dataRows).some((r) => r.id === s)));

	let renderStart = $.derived(() => $.get(renderRows).start);

	const fullHeight = $.derived(() => {
		const count = $dynamic() ? $dynamic().rowCount : $data().length;

		if ($$props.autoRowHeight) {
			return $.get(renderedHeight) + $.get(renderRows).d + (count - $.get(renderEnd)) * $.get(defaultRowHeight);
		}

		if (!$_rowHeightFromData()) {
			return count * $.get(defaultRowHeight);
		}

		let totalHeight = 0;

		for (let i = 0; i < count; i++) totalHeight += $data()[i].rowHeight || $.get(defaultRowHeight);

		return totalHeight;
	});

	function onScroll(ev) {
		const top = ev.target.scrollTop;
		const left = ev.target.scrollLeft;

		if (top !== $scrollTop() || left !== $scrollLeft()) api.exec("scroll-to", { top, left });
	}

	function lockSelection(ev) {
		// we prevent default on mousedown reaction to stop the unwanted text selection
		// in the same time we need to have focus-in, so trigger it manually
		//
		// in future, it will be optimal to block text selection directly, without affecting focus related event
		if (ev.shiftKey) ev.preventDefault();

		tableNode.focus();
	}

	function checkDraggable() {
		return !!$_columns().find((c) => !!c.draggable);
	}

	let postDrag;
	let movementY;

	const bodyClickHandlers = {
		dblclick: (id, ev) => {
			const data = { id, column: locateID(ev, "data-col-id") };

			api.exec("open-editor", data);
		},

		click: (id, ev) => {
			if (postDrag) return;

			const column = locateID(ev, "data-col-id");

			if ($focusCell()?.id !== id) api.exec("focus-cell", { row: id, column, eventSource: "click" });
			if ($select() === false) return;

			const toggle = $$props.multiselect && (ev.ctrlKey || ev.metaKey);
			const range = $$props.multiselect && ev.shiftKey;

			if (toggle || $selectedRows().length > 1 || !$selectedRows().includes(id)) {
				api.exec("select-row", { id, toggle, range });
			}
		},

		"toggle-row": (id) => {
			const row = api.getRow(id);

			api.exec(row.open !== false ? "close-row" : "open-row", { id });
		},

		"ignore-click": () => {
			return false;
		}
	};

	const dragScrollConfig = $.derived(() => ({
		top: $.get(headerHeight),
		bottom: $.get(footerHeight),
		left: $.get(leftColumns).width,
		xScroll: $.get(hasHScroll),
		yScroll: $.get(hasVScroll),
		sense: $$props.autoRowHeight && $.get(dragNode)
			? $.get(dragNode).offsetHeight
			: Math.max($_sizes().rowHeight, 40),
		node: tableNode && tableNode.firstElementChild
	}));

	function startDrag(ev, context) {
		const { container, sourceNode, from } = context;
		const hasDraggable = checkDraggable();

		if (hasDraggable && !sourceNode.getAttribute("draggable-data")) return false;

		$.set(dragItem, from, true);

		if ($tree() && api.getRow($.get(dragItem)).open) api.exec("close-row", { id: $.get(dragItem), nested: true });

		// default to drag source (target may be shifted by this moment)
		const itemNode = locate(sourceNode);

		$.set(dragNode, itemNode.cloneNode(true), true);
		$.get(dragNode).classList.remove("wx-selected");
		$.get(dragNode).querySelectorAll("[tabindex]").forEach((element) => element.setAttribute("tabindex", "-1"));
		container.appendChild($.get(dragNode));

		const offsetX = $scrollLeft() - $.get(renderColumns).d;
		const vScrollSize = $.get(hasVScroll) ? $.get(SCROLLSIZE) : 0;

		container.style.width = Math.min($$props.clientWidth - vScrollSize, $.get(hasAny) && $.get(fullWidth) <= $$props.clientWidth
			? $.get(contentWidth)
			: $.get(contentWidth) - vScrollSize) + offsetX + "px";

		const itemPos = getOffset(itemNode);

		context.offset = { x: offsetX, y: -Math.round(itemPos.height / 2) };

		if (!movementY) movementY = ev.clientY;
	}

	function moveDrag(ev, context) {
		const { from } = context;
		const pos = context.pos;
		const box = getOffset(tableNode);

		pos.x = box.x;

		const min = $.get(dragScrollConfig).top;

		if (pos.y < min) pos.y = min; else {
			const max = box.height - ($.get(hasHScroll) && $.get(SCROLLSIZE) > 0
				? $.get(SCROLLSIZE)
				: Math.round($.get(dragScrollConfig).sense / 2)) - $.get(dragScrollConfig).bottom;

			if (pos.y > max) pos.y = max;
		}

		if (tableNode.contains(context.targetNode)) {
			const targetRow = locate(context.targetNode);
			const to = targetRow && getID(targetRow);

			if (to && to !== from) {
				context.to = to;

				const rowHeight = $$props.autoRowHeight ? $.get(dragNode)?.offsetHeight : $_sizes().rowHeight;

				if ($scrollTop() === 0 || pos.y > min + rowHeight - 1) {
					const targetRect = targetRow.getBoundingClientRect();
					const dragNodeOffset = getOffset($.get(dragNode));
					const dragNodePos = dragNodeOffset.y;
					const targetNodePos = targetRect.y;
					const dir = dragNodePos > targetNodePos ? -1 : 1;
					const initialMode = dir === 1 ? "after" : "before";
					const flat = api.getState().flatData;
					const diff = Math.abs(flat.findIndex((r) => r.id === from) - flat.findIndex((r) => r.id === to));

					const mode = diff !== 1
						? initialMode === "before" ? "after" : "before"
						: initialMode;

					if (diff === 1) {
						// prevent moving items near borders
						if (dir === -1 && ev.clientY > movementY) return;

						if (dir === 1 && ev.clientY < movementY) return;
					}

					movementY = ev.clientY;
					api.exec("move-item", { id: from, target: to, mode, inProgress: true });
				}
			}

			$$props.onreorder && $$props.onreorder({ event: ev, context });
		}

		tryAutoScroll(ev, box, context, $.get(dragScrollConfig));
	}

	function endDrag(ev, context) {
		const { from, to } = context;

		api.exec("move-item", { id: from, target: to, inProgress: false });

		// block potential clicks after mouseup
		postDrag = setTimeout(
			() => {
				postDrag = 0;
			},
			1
		);

		$.set(dragItem, $.set(dragNode, movementY = null, true), true);
		resetAutoScroll(context);
	}

	// for header and footer (e.g. type): include visible spans
	function getHeaderPosition(start, deltaLeft, type) {
		let delta = deltaLeft;
		let index = start;

		if ($.get(centerColumns).length) {
			let spanStartInd = $.get(centerColumns // max value to compare with
			).length;

			// find min index of the column which colspan is visible
			for (let i = start; i >= 0; i--) {
				const colHeader = $.get(centerColumns)[i][type];

				colHeader.forEach((h) => {
					if (h.colspan > 1 && i > start - h.colspan && i < spanStartInd) {
						spanStartInd = i;
					}
				});
			}

			if (spanStartInd !== $.get(centerColumns).length && spanStartInd < start) {
				for (let i = spanStartInd; i < start; i++) {
					delta -= $.get(centerColumns)[i].width;
				}

				index = spanStartInd;
			}
		}

		return { index, delta };
	}

	function getScrollSize() {
		const div = document.createElement("div");

		div.style.cssText = "position:absolute;left:-1000px;width:100px;padding:0px;margin:0px;min-height:100px;overflow-y:scroll;";
		document.body.appendChild(div);

		const width = div.offsetWidth - div.clientWidth;

		document.body.removeChild(div);

		return width;
	}

	// with at least one flexible column, size the box to 100% to match the container
	const style = $.derived(() => $.get(hasAny) && $.get(fullWidth) <= $$props.clientWidth
		? "width:100%;"
		: $.get(globalWidth) > 0 ? `width:${$.get(globalWidth)}px;` : "");

	let dataEl;

	function adjustHeight() {
		// make sure the UI is updated before syncing the state
		tick().then(() => {
			let rh = 0;
			let re = $.get(renderStart);

			Array.from(dataEl.children).forEach((row, i) => {
				rowHeights[$.get(renderStart) + i] = row.offsetHeight;
				rh += row.offsetHeight;
				re++;
			});

			$.set(renderedHeight, rh, true);
			$.set(renderEnd, re, true);
		});
	}

	$.user_effect(() => $.get(dataRows) && $$props.autoRowHeight && adjustHeight());

	$.user_effect(() => {
		$.get(renderColumns);
		$.get(dataRows);

		untrack(() => {
			if ($focusCell()) {
				const rowExists = $.get(dataRows).some((row) => row.id === $focusCell().row);
				const cellExists = rowExists && $.get(renderColumns).data.some((col) => col.id === $focusCell().column && !col.collapsed);

				if (!cellExists) {
					api.exec("focus-cell", { eventSource: "destroy" });
				}
			}
		});
	});

	/* focus is a focusable cell which either belongs to visible selection 
	   or is the first visible cell in grid, which maybe scrolled up due to EXTRAROWS 
	   If select is false, focusCell can be outside selection*/
	let focus = $.state(void 0);

	$.user_effect(() => {
		if ($focusCell() && (!$select() || !$.get(visibleSelection).length || $.get(visibleSelection).includes($focusCell().row))) $.set(focus, { ...$focusCell() }, true); else if ($.get(dataRows).length && $.get(renderColumns).data.length) {
			if (!$.get(focus) || $.get(visibleSelection).length && !$.get(visibleSelection).includes($.get(focus).row) || $.get(dataRows).findIndex((r) => r.id === $.get(focus).row) === -1 || $.get(renderColumns).data.findIndex((c) => c.id === $.get(focus).column && !c.collapsed) === -1) {
				const row = $.get(visibleSelection)[0] || $.get(dataRows)[0].id;
				const cind = $.get(renderColumns).data.findIndex((c) => !c.collapsed);

				if (cind !== -1) $.set(focus, { row, column: $.get(renderColumns).data[cind].id }, true); else $.set(focus, null);
			}
		} else $.set(focus, null);
	});

	const viewportWidth = $.derived(() => ($.get(globalWidth) > 0 ? $.get(globalWidth) : $$props.clientWidth) - ($.get(hasVScroll) ? $.get(SCROLLSIZE) : 0));
	var fragment = root_3();
	var div_1 = $.first_child(fragment);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	{
		var consequent = ($$anchor) => {
			var div_4 = root();
			var node_1 = $.child(div_4);

			HeaderFooter(node_1, {
				get contentWidth() {
					return $.get(contentWidth);
				},

				get viewportWidth() {
					return $.get(viewportWidth);
				},

				get deltaLeft() {
					return $.get(renderColumns).dh;
				},

				get columns() {
					return $.get(renderColumns).header;
				},

				get columnStyle() {
					return $$props.columnStyle;
				},

				get bodyHeight() {
					return $.get(bodyContentHeight);
				},

				get leftColumnsWidth() {
					return $.get(leftColumns).width;
				},

				get rightColumnsWidth() {
					return $.get(rightColumns).width;
				}
			});

			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node, ($$render) => {
			if ($$props.header) $$render(consequent);
		});
	}

	var div_5 = $.sibling(node, 2);
	var node_2 = $.child(div_5);

	{
		var consequent_1 = ($$anchor) => {
			Overlay($$anchor, {
				get overlay() {
					return $$props.overlay;
				}
			});
		};

		$.if(node_2, ($$render) => {
			if ($$props.overlay) $$render(consequent_1);
		});
	}

	var div_6 = $.sibling(node_2, 2);

	$.each(div_6, 23, () => $.get(dataRows), (row) => row.id, ($$anchor, row, rIndex) => {
		const isSelected = $.derived(() => $selectedRows().indexOf($.get(row).id) !== -1);
		var div_7 = root_2();
		let classes;

		$.each(div_7, 21, () => $.get(renderColumns).data, (column) => column.id, ($$anchor, column) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			{
				var consequent_2 = ($$anchor) => {
					var div_8 = root_1();

					$.append($$anchor, div_8);
				};

				var consequent_3 = ($$anchor) => {
					Editor($$anchor, {
						get row() {
							return $.get(row);
						},

						get column() {
							return $.get(column);
						}
					});
				};

				var alternate = ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(focus)?.row === $.get(row).id && $.get(focus)?.column === $.get(column).id);

						Cell($$anchor, {
							get row() {
								return $.get(row);
							},

							get column() {
								return $.get(column);
							},

							get columnStyle() {
								return $$props.columnStyle;
							},

							get cellStyle() {
								return $$props.cellStyle;
							},

							get reorder() {
								return reorder;
							},

							get focusable() {
								return $.get($0);
							}
						});
					}
				};

				$.if(node_3, ($$render) => {
					if ($.get(column).collapsed) $$render(consequent_2); else if ($editor()?.id === $.get(row).id && $editor().column === $.get(column).id) $$render(consequent_3, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_2);
		});

		$.reset(div_7);

		$.template_effect(
			($0, $1, $2, $3) => {
				classes = $.set_class(div_7, 1, $0, 'svelte-kalntq', classes, {
					'wx-autoheight': $$props.autoRowHeight,
					'wx-selected': $.get(isSelected),
					'wx-inactive': $.get(dragItem) === $.get(row).id
				});

				$.set_attribute(div_7, 'data-id', $1);
				$.set_attribute(div_7, 'data-context-id', $2);
				$.set_attribute(div_7, 'draggable', $3);
				$.set_style(div_7, `${$$props.autoRowHeight ? "min-height" : "height"}:${$.get(row).rowHeight || $.get(defaultRowHeight)}px;`);
				$.set_attribute(div_7, 'aria-rowindex', $.get(rIndex));
				$.set_attribute(div_7, 'aria-expanded', $.get(row).open);
				$.set_attribute(div_7, 'aria-level', $tree() ? $.get(row).$level + 1 : undefined);
				$.set_attribute(div_7, 'aria-selected', $tree() ? $.get(isSelected) : undefined);
			},
			[
				() => "wx-row" + ($$props.rowStyle ? " " + $$props.rowStyle($.get(row)) : ""),
				() => setID($.get(row).id),
				() => setID($.get(row).id),
				() => isRowDraggable($.get(row)) ? "true" : null
			]
		);

		$.append($$anchor, div_7);
	});

	$.reset(div_6);
	$.bind_this(div_6, ($$value) => dataEl = $$value, () => dataEl);
	$.reset(div_5);
	$.action(div_5, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => () => $focusCell() && api.exec("focus-cell", { eventSource: "click" }));
	$.action(div_5, ($$node, $$action_arg) => delegateClick?.($$node, $$action_arg), () => bodyClickHandlers);
	$.effect(() => $.bind_element_size(div_5, 'clientHeight', ($$value) => $.set(bodyClientHeight, $$value)));

	var node_4 = $.sibling(div_5, 2);

	{
		var consequent_4 = ($$anchor) => {
			HeaderFooter($$anchor, {
				type: "footer",
				get contentWidth() {
					return $.get(contentWidth);
				},

				get deltaLeft() {
					return $.get(renderColumns).df;
				},

				get columns() {
					return $.get(renderColumns).footer;
				},

				get columnStyle() {
					return $$props.columnStyle;
				}
			});
		};

		$.if(node_4, ($$render) => {
			if ($$props.footer && $data().length) $$render(consequent_4);
		});
	}

	$.reset(div_3);

	$.action(div_3, ($$node, $$action_arg) => scrollTo?.($$node, $$action_arg), () => ({
		scroll,
		scrollLeft,
		scrollTop,
		getWidth: () => $$props.clientWidth - ($.get(hasVScroll) ? $.get(SCROLLSIZE) : 0),
		getHeight: () => $.get(visibleRowsHeight),
		getScrollMargin: () => $.get(leftColumns).width + $.get(rightColumns).width
	}));

	$.reset(div_2);
	$.bind_this(div_2, ($$value) => tableNode = $$value, () => tableNode);
	$.action(div_2, ($$node, $$action_arg) => onresize?.($$node, $$action_arg), () => $$props.resize);

	$.action(div_2, ($$node, $$action_arg) => drag?.($$node, $$action_arg), () => ({
		start: startDrag,
		move: moveDrag,
		end: endDrag,
		getReorder: () => $reorder(),
		getDraggableInfo: () => ({ hasDraggable: checkDraggable() })
	}));

	$.action(div_2, ($$node, $$action_arg) => hotkeys?.($$node, $$action_arg), () => ({
		keys: $$props.hotkeys !== false && {
			...defaultHotkeys,
			"ctrl+z": $undo(),
			"ctrl+y": $undo(),
			...$$props.hotkeys
		},
		exec: (v) => api.exec("hotkey", v)
	}));

	$.reset(div_1);

	var node_5 = $.sibling(div_1, 2);

	{
		var consequent_5 = ($$anchor) => {
			Print($$anchor, {
				get config() {
					return $_print();
				},

				get rowStyle() {
					return $$props.rowStyle;
				},

				get columnStyle() {
					return $$props.columnStyle;
				},

				get cellStyle() {
					return $$props.cellStyle;
				},

				get header() {
					return $$props.header;
				},

				get footer() {
					return $$props.footer;
				},

				get reorder() {
					return reorder;
				}
			});
		};

		$.if(node_5, ($$render) => {
			if ($_print()) $$render(consequent_5);
		});
	}

	$.template_effect(() => {
		$.set_class(div_1, 1, `wx-grid ${$$props.responsiveLevel ? `wx-responsive-${$$props.responsiveLevel}` : ""}`, 'svelte-kalntq');

		$.set_style(div_1, `--header-height:${$.get(headerHeight) ?? ''}px; --footer-height:${$.get(footerHeight) ?? ''}px;--split-left-width:${$.get(leftColumns).width ?? ''}px;
		--split-right-width:${$.get(rightColumns).width ?? ''}px;`);

		$.set_style(div_2, $.get(style));
		$.set_attribute(div_2, 'role', $tree() ? "treegrid" : "grid");
		$.set_attribute(div_2, 'aria-colcount', $.get(renderColumns).data.length);
		$.set_attribute(div_2, 'aria-rowcount', $.get(dataRows).length);
		$.set_attribute(div_2, 'aria-multiselectable', $tree() && $$props.multiselect ? true : undefined);
		$.set_style(div_3, `overflow-x:${$.get(hasHScroll) ? 'scroll' : 'hidden'};overflow-y:${$.get(hasVScroll) ? 'scroll' : 'hidden'};`);
		$.set_style(div_5, `width:${$.get(contentWidth) ?? ''}px;height:${$.get(fullHeight) ?? ''}px;`);
		$.set_style(div_6, `padding-top:${$.get(renderRows).d ?? ''}px;padding-left:${$.get(renderColumns).d ?? ''}px;`);
	});

	$.event('scroll', div_3, onScroll);
	$.delegated('mousedown', div_5, (ev) => lockSelection(ev));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['mousedown']);
import * as $ from 'svelte/internal/server';
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

export default function Layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			header,
			footer,
			overlay,
			multiselect,
			onreorder,
			draggableRows,
			rowStyle,
			columnStyle,
			cellStyle,
			autoRowHeight,
			resize,
			clientWidth,
			clientHeight,
			responsiveLevel,
			hotkeys: hotkeysConfig
		} = $$props;

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
		let SCROLLSIZE = 0;

		onMount(() => SCROLLSIZE = getScrollSize());

		let bodyClientHeight = 0;

		const hasAny = $.derived(() => {
			return $.store_get($$store_subs ??= {}, '$_columns', _columns).some((col) => !col.hidden && col.flexgrow);
		});

		const defaultRowHeight = $.derived(() => $.store_get($$store_subs ??= {}, '$_sizes', _sizes).rowHeight);
		let tableNode;

		// draggableRows: boolean for all rows, or a (row) => boolean predicate
		const isRowDraggable = (row) => typeof draggableRows === "function" ? draggableRows(row) : draggableRows;

		let // reorder
		dragItem = null;

		let dragNode = null;
		let rowHeights = [];
		let renderedHeight = 0;
		let renderEnd = 0;

		const fullWidth = $.derived(() => $.store_get($$store_subs ??= {}, '$_columns', _columns).reduce(
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

			if ($.store_get($$store_subs ??= {}, '$split', split).left) {
				columns = $.store_get($$store_subs ??= {}, '$_columns', _columns).slice(0, $.store_get($$store_subs ??= {}, '$split', split).left).filter((c) => !c.hidden).map((a) => ({ ...a }));

				columns.forEach((a) => {
					a.fixed = {
						left: 1,
						leftSize: $.store_get($$store_subs ??= {}, '$split', split).left
					};

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

			if ($.store_get($$store_subs ??= {}, '$split', split).right) {
				columns = $.store_get($$store_subs ??= {}, '$_columns', _columns).slice($.store_get($$store_subs ??= {}, '$split', split).right * -1).filter((c) => !c.hidden).map((a) => ({ ...a }));

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
			const center = $.store_get($$store_subs ??= {}, '$_columns', _columns).slice($.store_get($$store_subs ??= {}, '$split', split).left, $.store_get($$store_subs ??= {}, '$_columns', _columns).length - ($.store_get($$store_subs ??= {}, '$split', split).right ?? 0)).filter((c) => !c.hidden);

			center.forEach((a) => {
				a.fixed = 0;
			});

			return center;
		});

		const EXTRACOLUMNS = 1;

		const renderColumns = $.derived(() => {
			let data, header, footer;

			// get visible columns
			const left = $.store_get($$store_subs ??= {}, '$scrollLeft', scrollLeft);

			const right = $.store_get($$store_subs ??= {}, '$scrollLeft', scrollLeft) + clientWidth;
			let start = 0;
			let end = 0;
			let sum = 0;
			let d = 0;

			centerColumns().forEach((col, index) => {
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
					if (centerColumns()[i]) centerColumns()[i][key].forEach((hCell) => {
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
			const renderAll = hasAny() && fullWidth() > clientWidth;

			if (renderAll) {
				data = header = footer = [
					...leftColumns().columns,
					...centerColumns(),
					...rightColumns().columns
				];
			} else {
				data = [
					...leftColumns().columns,
					...centerColumns().slice(start, end + 1),
					...rightColumns().columns
				];

				header = [
					...leftColumns().columns,
					...centerColumns().slice(csH, end + rightSpanDelta.header + 1),
					...rightColumns().columns
				];

				footer = [
					...leftColumns().columns,
					...centerColumns().slice(csF, end + rightSpanDelta.footer + 1),
					...rightColumns().columns
				];
			}

			return renderAll
				? { data, header, footer, d: 0, df: 0, dh: 0 }
				: { data, header, footer, d, df, dh };
		});

		// $inspect(renderColumns, "renderColumns");
		const headerHeight = $.derived(() => header
			? $.store_get($$store_subs ??= {}, '$_sizes', _sizes).headerHeight
			: 0);

		const footerHeight = $.derived(() => footer && $.store_get($$store_subs ??= {}, '$data', data).length
			? $.store_get($$store_subs ??= {}, '$_sizes', _sizes).footerHeight
			: 0);

		const hasHScroll = $.derived(() => clientWidth && clientHeight ? fullWidth() >= clientWidth : false);
		const visibleRowsHeight = $.derived(() => clientHeight - headerHeight() - footerHeight() - (hasHScroll() ? SCROLLSIZE : 0));
		const visibleRows = $.derived(() => Math.ceil(visibleRowsHeight() / defaultRowHeight()) + 1);
		let hasVScroll = false;

		function setVScroll() {
			hasVScroll = clientWidth && clientHeight
				? fullHeight() + headerHeight() + footerHeight() >= clientHeight - (fullWidth() >= clientWidth ? SCROLLSIZE : 0)
				: false;
		}

		const contentWidth = $.derived(() => hasAny() && fullWidth() <= clientWidth
			? clientWidth - (hasVScroll ? SCROLLSIZE : 0)
			: fullWidth());

		// set global width
		// if we have flexible columns
		// then ignore the fullWidth as it doesn't include flex columns and has no meaning in this context
		const globalWidth = $.derived(() => hasAny() && fullWidth() <= clientWidth
			? clientWidth
			: contentWidth() < clientWidth ? fullWidth() + (hasVScroll ? SCROLLSIZE : 0) : -1);

		// $inspect(globalWidth, "globalWidth");
		const bodyContentHeight = $.derived(() => footerHeight()
			? Math.min(bodyClientHeight + 1, visibleRowsHeight() - +footer)
			: visibleRowsHeight());

		// request data if necessary
		const EXTRAROWS = 2;

		const renderRows = $.derived(() => {
			let start = 0, deltaTop = 0;

			if (autoRowHeight) {
				let st = $.store_get($$store_subs ??= {}, '$scrollTop', scrollTop);

				while (st > 0) {
					st -= rowHeights[start] || defaultRowHeight();
					start++;
				}

				// space to first rendered row
				deltaTop = $.store_get($$store_subs ??= {}, '$scrollTop', scrollTop) - st;

				for (let i = Math.max(0, start - EXTRAROWS - 1); i < start; i++) deltaTop -= rowHeights[start - i] || defaultRowHeight();

				start = Math.max(0, start - EXTRAROWS);
			} else {
				if ($.store_get($$store_subs ??= {}, '$_rowHeightFromData', _rowHeightFromData)) {
					let startInd = 0;
					let topHeight = 0;

					for (let i = 0; i < $.store_get($$store_subs ??= {}, '$data', data).length; i++) {
						const height = $.store_get($$store_subs ??= {}, '$data', data)[i].rowHeight || defaultRowHeight();

						if (topHeight + height > $.store_get($$store_subs ??= {}, '$scrollTop', scrollTop)) {
							startInd = i;

							break;
						}

						topHeight += height;
					}

					start = Math.max(0, startInd - EXTRAROWS);

					for (let i = 0; i < start; i++) {
						deltaTop += $.store_get($$store_subs ??= {}, '$data', data)[i].rowHeight || defaultRowHeight();
					}

					let visibleRowsCount = 0;
					let currentHeight = 0;

					for (let i = startInd + 1; i < $.store_get($$store_subs ??= {}, '$data', data).length; i++) {
						const height = $.store_get($$store_subs ??= {}, '$data', data)[i].rowHeight || defaultRowHeight();

						visibleRowsCount++;

						if (currentHeight + height > visibleRowsHeight()) {
							break;
						}

						currentHeight += height;
					}

					const end = Math.min(
						$.store_get($$store_subs ??= {}, '$dynamic', dynamic)
							? $.store_get($$store_subs ??= {}, '$dynamic', dynamic).rowCount
							: $.store_get($$store_subs ??= {}, '$data', data).length,
						startInd + visibleRowsCount + EXTRAROWS
					);

					return { d: deltaTop, start, end };
				}

				start = Math.floor($.store_get($$store_subs ??= {}, '$scrollTop', scrollTop) / defaultRowHeight());
				start = Math.max(0, start - EXTRAROWS);
				deltaTop = start * defaultRowHeight();
			}

			const end = Math.min(
				$.store_get($$store_subs ??= {}, '$dynamic', dynamic)
					? $.store_get($$store_subs ??= {}, '$dynamic', dynamic).rowCount
					: $.store_get($$store_subs ??= {}, '$data', data).length,
				start + visibleRows() + EXTRAROWS
			);

			return { d: deltaTop, start, end };
		});

		let lastCall = {};

		const dataRows = $.derived(() => {
			if ($.store_get($$store_subs ??= {}, '$dynamic', dynamic)) return $.store_get($$store_subs ??= {}, '$data', data); else {
				return $.store_get($$store_subs ??= {}, '$data', data).slice(renderRows().start, renderRows().end);
			}
		});

		//get visible selection
		const visibleSelection = $.derived(() => $.store_get($$store_subs ??= {}, '$selectedRows', selectedRows).filter((s) => dataRows().some((r) => r.id === s)));

		let renderStart = $.derived(() => renderRows().start);

		const fullHeight = $.derived(() => {
			const count = $.store_get($$store_subs ??= {}, '$dynamic', dynamic)
				? $.store_get($$store_subs ??= {}, '$dynamic', dynamic).rowCount
				: $.store_get($$store_subs ??= {}, '$data', data).length;

			if (autoRowHeight) {
				return renderedHeight + renderRows().d + (count - renderEnd) * defaultRowHeight();
			}

			if (!$.store_get($$store_subs ??= {}, '$_rowHeightFromData', _rowHeightFromData)) {
				return count * defaultRowHeight();
			}

			let totalHeight = 0;

			for (let i = 0; i < count; i++) totalHeight += $.store_get($$store_subs ??= {}, '$data', data)[i].rowHeight || defaultRowHeight();

			return totalHeight;
		});

		function onScroll(ev) {
			const top = ev.target.scrollTop;
			const left = ev.target.scrollLeft;

			if (top !== $.store_get($$store_subs ??= {}, '$scrollTop', scrollTop) || left !== $.store_get($$store_subs ??= {}, '$scrollLeft', scrollLeft)) api.exec("scroll-to", { top, left });
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
			return !!$.store_get($$store_subs ??= {}, '$_columns', _columns).find((c) => !!c.draggable);
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

				if ($.store_get($$store_subs ??= {}, '$focusCell', focusCell)?.id !== id) api.exec("focus-cell", { row: id, column, eventSource: "click" });
				if ($.store_get($$store_subs ??= {}, '$select', select) === false) return;

				const toggle = multiselect && (ev.ctrlKey || ev.metaKey);
				const range = multiselect && ev.shiftKey;

				if (toggle || $.store_get($$store_subs ??= {}, '$selectedRows', selectedRows).length > 1 || !$.store_get($$store_subs ??= {}, '$selectedRows', selectedRows).includes(id)) {
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
			top: headerHeight(),
			bottom: footerHeight(),
			left: leftColumns().width,
			xScroll: hasHScroll(),
			yScroll: hasVScroll,
			sense: autoRowHeight && dragNode
				? dragNode.offsetHeight
				: Math.max($.store_get($$store_subs ??= {}, '$_sizes', _sizes).rowHeight, 40),
			node: tableNode && tableNode.firstElementChild
		}));

		function startDrag(ev, context) {
			const { container, sourceNode, from } = context;
			const hasDraggable = checkDraggable();

			if (hasDraggable && !sourceNode.getAttribute("draggable-data")) return false;

			dragItem = from;

			if ($.store_get($$store_subs ??= {}, '$tree', tree) && api.getRow(dragItem).open) api.exec("close-row", { id: dragItem, nested: true });

			// default to drag source (target may be shifted by this moment)
			const itemNode = locate(sourceNode);

			dragNode = itemNode.cloneNode(true);
			dragNode.classList.remove("wx-selected");
			dragNode.querySelectorAll("[tabindex]").forEach((element) => element.setAttribute("tabindex", "-1"));
			container.appendChild(dragNode);

			const offsetX = $.store_get($$store_subs ??= {}, '$scrollLeft', scrollLeft) - renderColumns().d;
			const vScrollSize = hasVScroll ? SCROLLSIZE : 0;

			container.style.width = Math.min(clientWidth - vScrollSize, hasAny() && fullWidth() <= clientWidth ? contentWidth() : contentWidth() - vScrollSize) + offsetX + "px";

			const itemPos = getOffset(itemNode);

			context.offset = { x: offsetX, y: -Math.round(itemPos.height / 2) };

			if (!movementY) movementY = ev.clientY;
		}

		function moveDrag(ev, context) {
			const { from } = context;
			const pos = context.pos;
			const box = getOffset(tableNode);

			pos.x = box.x;

			const min = dragScrollConfig().top;

			if (pos.y < min) pos.y = min; else {
				const max = box.height - (hasHScroll() && SCROLLSIZE > 0 ? SCROLLSIZE : Math.round(dragScrollConfig().sense / 2)) - dragScrollConfig().bottom;

				if (pos.y > max) pos.y = max;
			}

			if (tableNode.contains(context.targetNode)) {
				const targetRow = locate(context.targetNode);
				const to = targetRow && getID(targetRow);

				if (to && to !== from) {
					context.to = to;

					const rowHeight = autoRowHeight
						? dragNode?.offsetHeight
						: $.store_get($$store_subs ??= {}, '$_sizes', _sizes).rowHeight;

					if ($.store_get($$store_subs ??= {}, '$scrollTop', scrollTop) === 0 || pos.y > min + rowHeight - 1) {
						const targetRect = targetRow.getBoundingClientRect();
						const dragNodeOffset = getOffset(dragNode);
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

				onreorder && onreorder({ event: ev, context });
			}

			tryAutoScroll(ev, box, context, dragScrollConfig());
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

			dragItem = dragNode = movementY = null;
			resetAutoScroll(context);
		}

		// for header and footer (e.g. type): include visible spans
		function getHeaderPosition(start, deltaLeft, type) {
			let delta = deltaLeft;
			let index = start;

			if (centerColumns().length) {
				let spanStartInd = centerColumns().length; // max value to compare with

				// find min index of the column which colspan is visible
				for (let i = start; i >= 0; i--) {
					const colHeader = centerColumns()[i][type];

					colHeader.forEach((h) => {
						if (h.colspan > 1 && i > start - h.colspan && i < spanStartInd) {
							spanStartInd = i;
						}
					});
				}

				if (spanStartInd !== centerColumns().length && spanStartInd < start) {
					for (let i = spanStartInd; i < start; i++) {
						delta -= centerColumns()[i].width;
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
		const style = $.derived(() => hasAny() && fullWidth() <= clientWidth
			? "width:100%;"
			: globalWidth() > 0 ? `width:${globalWidth()}px;` : "");

		let dataEl;

		function adjustHeight() {
			// make sure the UI is updated before syncing the state
			tick().then(() => {
				let rh = 0;
				let re = renderStart();

				Array.from(dataEl.children).forEach((row, i) => {
					rowHeights[renderStart() + i] = row.offsetHeight;
					rh += row.offsetHeight;
					re++;
				});

				renderedHeight = rh;
				renderEnd = re;
			});
		}

		/* focus is a focusable cell which either belongs to visible selection 
		   or is the first visible cell in grid, which maybe scrolled up due to EXTRAROWS 
		   If select is false, focusCell can be outside selection*/
		let focus = void 0;

		const viewportWidth = $.derived(() => (globalWidth() > 0 ? globalWidth() : clientWidth) - (hasVScroll ? SCROLLSIZE : 0));

		$$renderer.push(`<div${$.attr_class(`wx-grid ${responsiveLevel ? `wx-responsive-${responsiveLevel}` : ""}`, 'svelte-kalntq')}${$.attr_style(`--header-height:${$.stringify(headerHeight())}px; --footer-height:${$.stringify(footerHeight())}px;--split-left-width:${$.stringify(leftColumns().width)}px; --split-right-width:${$.stringify(rightColumns().width)}px;`)}><div class="wx-table-box svelte-kalntq"${$.attr_style(style())}${$.attr('role', $.store_get($$store_subs ??= {}, '$tree', tree) ? "treegrid" : "grid")}${$.attr('aria-colcount', renderColumns().data.length)}${$.attr('aria-rowcount', dataRows().length)}${$.attr('aria-multiselectable', $.store_get($$store_subs ??= {}, '$tree', tree) && multiselect ? true : undefined)}><div class="wx-scroll svelte-kalntq"${$.attr_style(`overflow-x:${hasHScroll() ? 'scroll' : 'hidden'};overflow-y:${hasVScroll ? 'scroll' : 'hidden'};`)}>`);

		if (header) {
			$$renderer.push(`<!--[0--><div class="wx-header-wrapper svelte-kalntq">`);

			HeaderFooter($$renderer, {
				contentWidth: contentWidth(),
				viewportWidth: viewportWidth(),
				deltaLeft: renderColumns().dh,
				columns: renderColumns().header,
				columnStyle,
				bodyHeight: bodyContentHeight(),
				leftColumnsWidth: leftColumns().width,
				rightColumnsWidth: rightColumns().width
			});

			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="wx-body svelte-kalntq"${$.attr_style(`width:${$.stringify(contentWidth())}px;height:${$.stringify(fullHeight())}px;`)}>`);

		if (overlay) {
			$$renderer.push('<!--[0-->');
			Overlay($$renderer, { overlay });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="wx-data svelte-kalntq"${$.attr_style(`padding-top:${$.stringify(renderRows().d)}px;padding-left:${$.stringify(renderColumns().d)}px;`)}><!--[-->`);

		const each_array = $.ensure_array_like(dataRows());

		for (let rIndex = 0, $$length = each_array.length; rIndex < $$length; rIndex++) {
			let row = each_array[rIndex];
			const isSelected = $.store_get($$store_subs ??= {}, '$selectedRows', selectedRows).indexOf(row.id) !== -1;

			$$renderer.push(`<div${$.attr_class("wx-row" + (rowStyle ? " " + rowStyle(row) : ""), 'svelte-kalntq', {
				'wx-autoheight': autoRowHeight,
				'wx-selected': isSelected,
				'wx-inactive': dragItem === row.id
			})}${$.attr('data-id', setID(row.id))}${$.attr('data-context-id', setID(row.id))}${$.attr('draggable', isRowDraggable(row) ? "true" : null)}${$.attr_style(`${autoRowHeight ? "min-height" : "height"}:${row.rowHeight || defaultRowHeight()}px;`)} role="row"${$.attr('aria-rowindex', rIndex)}${$.attr('aria-expanded', row.open)}${$.attr('aria-level', $.store_get($$store_subs ??= {}, '$tree', tree) ? row.$level + 1 : undefined)}${$.attr('aria-selected', $.store_get($$store_subs ??= {}, '$tree', tree) ? isSelected : undefined)} tabindex="-1"><!--[-->`);

			const each_array_1 = $.ensure_array_like(renderColumns().data);

			for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
				let column = each_array_1[$$index];

				if (column.collapsed) {
					$$renderer.push(`<!--[0--><div class="wx-cell wx-collapsed svelte-kalntq"></div>`);
				} else if ($.store_get($$store_subs ??= {}, '$editor', editor)?.id === row.id && $.store_get($$store_subs ??= {}, '$editor', editor).column === column.id) {
					$$renderer.push('<!--[1-->');
					Editor($$renderer, { row, column });
				} else {
					$$renderer.push('<!--[-1-->');

					Cell($$renderer, {
						row,
						column,
						columnStyle,
						cellStyle,
						reorder,
						focusable: focus?.row === row.id && focus?.column === column.id
					});
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (footer && $.store_get($$store_subs ??= {}, '$data', data).length) {
			$$renderer.push('<!--[0-->');

			HeaderFooter($$renderer, {
				type: "footer",
				contentWidth: contentWidth(),
				deltaLeft: renderColumns().df,
				columns: renderColumns().footer,
				columnStyle
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div></div> `);

		if ($.store_get($$store_subs ??= {}, '$_print', _print)) {
			$$renderer.push('<!--[0-->');

			Print($$renderer, {
				config: $.store_get($$store_subs ??= {}, '$_print', _print),
				rowStyle,
				columnStyle,
				cellStyle,
				header,
				footer,
				reorder
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}
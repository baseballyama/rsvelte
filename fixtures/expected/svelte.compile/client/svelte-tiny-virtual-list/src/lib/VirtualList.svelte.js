import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import SizeAndPositionManager from './SizeAndPositionManager.js';

import {
	ALIGNMENT,
	DIRECTION,
	SCROLL_CHANGE_REASON,
	SCROLL_PROP,
	SCROLL_PROP_LEGACY
} from './constants.js';

var root = $.from_html(`<div class="virtual-list-wrapper svelte-16nckvm"><!> <div class="virtual-list-inner svelte-16nckvm"></div> <!></div>`);

export default function VirtualList($$anchor, $$props) {
	$.push($$props, true);

	/** @import { VirtualListProps, VirtualListEvents, VirtualListSnippets } from './types.js'; */
	/** @type {VirtualListProps & VirtualListEvents & VirtualListSnippets} */
	let /* Props: */
		height = $.prop($$props, 'height', 3, '100%'),
		width = $.prop($$props, 'width', 3, '100%'),
		stickyIndices = $.prop($$props, 'stickyIndices', 19, () => []),
		scrollDirection = $.prop($$props, 'scrollDirection', 19, () => DIRECTION.VERTICAL),
		scrollToAlignment = $.prop($$props, 'scrollToAlignment', 19, () => ALIGNMENT.START),
		scrollToBehaviour = $.prop($$props, 'scrollToBehaviour', 3, 'instant'),
		overscanCount = $.prop($$props, 'overscanCount', 3, 3);

	/* Events: */
	// DEPRECATED
	/* Snippets: */
	// DEPRECATED
	let estimatedItemSize = $.derived(() => $$props.estimatedItemSize || typeof $$props.itemSize === 'number' && $$props.itemSize || 50);

	const sizeAndPositionManager = new SizeAndPositionManager($$props.itemSize, $$props.itemCount, $.get(estimatedItemSize));

	/** @type {HTMLDivElement} */
	let wrapper;

	let wrapperHeight = $.state(400);
	let wrapperWidth = $.state(400);

	/** @type {{ index: number, style: string }[]} */
	let items = $.state([]);

	/** @type {{ offset: number, changeReason: number }} */
	let scroll = $.state({
		offset: $$props.scrollOffset || $$props.scrollToIndex !== undefined && getOffsetForIndex($$props.scrollToIndex) || 0,
		changeReason: SCROLL_CHANGE_REASON.REQUESTED
	});

	let prevScroll = $.snapshot($.get(scroll));
	let heightNumber = $.derived(() => Number.isFinite(height()) ? Number(height()) : $.get(wrapperHeight));
	let widthNumber = $.derived(() => Number.isFinite(width()) ? Number(width()) : $.get(wrapperWidth));

	let prevProps = {
		scrollToIndex: $.snapshot($$props.scrollToIndex),
		scrollToAlignment: $.snapshot(scrollToAlignment()),
		scrollOffset: $.snapshot($$props.scrollOffset),
		itemCount: $.snapshot($$props.itemCount),
		itemSize: typeof $$props.itemSize === 'function' ? $$props.itemSize : $.snapshot($$props.itemSize),
		estimatedItemSize: $.snapshot($.get(estimatedItemSize)),
		heightNumber: $.snapshot($.get(heightNumber)),
		widthNumber: $.snapshot($.get(widthNumber)),
		stickyIndices: $.snapshot(stickyIndices())
	};

	/** @type {Record<number, string>} */
	let styleCache = $.state($.proxy({}));

	let wrapperStyle = $.state('');
	let innerStyle = $.state('');

	// Effect 0: Event listener
	$.user_effect(() => {
		/** @type {number | undefined} */
		let frame;

		/** @param {Event} event */
		const handleScrollAsync = (event) => {
			if (frame !== undefined) {
				cancelAnimationFrame(frame);
			}

			frame = requestAnimationFrame(() => {
				handleScroll(event);
				frame = undefined;
			});
		};

		const options = { passive: true };

		wrapper.addEventListener('scroll', handleScrollAsync, options);

		return () => {
			// @ts-expect-error because options is not really needed, but maybe in the future
			wrapper.removeEventListener('scroll', handleScrollAsync, options);
		};
	});

	// Effect 1: Update props from user provided props
	$.user_effect(() => {
		$$props.scrollToIndex;
		scrollToAlignment();
		$$props.scrollOffset;
		$$props.itemCount;
		$$props.itemSize;
		$.get(estimatedItemSize);
		$.get(heightNumber);
		$.get(widthNumber);
		stickyIndices();
		untrack(propsUpdated);
	});

	// Effect 2: Update scroll
	$.user_effect(() => {
		$.get(scroll);
		untrack(scrollUpdated);
	});

	function propsUpdated() {
		const scrollPropsHaveChanged = prevProps.scrollToIndex !== $$props.scrollToIndex || prevProps.scrollToAlignment !== scrollToAlignment();
		const itemPropsHaveChanged = prevProps.itemCount !== $$props.itemCount || prevProps.itemSize !== $$props.itemSize || prevProps.estimatedItemSize !== $.get(estimatedItemSize);
		let forceRecomputeSizes = false;

		if (itemPropsHaveChanged) {
			sizeAndPositionManager.updateConfig($$props.itemSize, $$props.itemCount, $.get(estimatedItemSize));
			forceRecomputeSizes = true;
		}

		if (prevProps.scrollOffset !== $$props.scrollOffset) {
			$.set(scroll, {
				offset: $$props.scrollOffset || 0,
				changeReason: SCROLL_CHANGE_REASON.REQUESTED
			});
		} else if (typeof $$props.scrollToIndex === 'number' && (scrollPropsHaveChanged || itemPropsHaveChanged)) {
			$.set(scroll, {
				offset: getOffsetForIndex($$props.scrollToIndex),
				changeReason: SCROLL_CHANGE_REASON.REQUESTED
			});
		}

		if (forceRecomputeSizes || prevProps.heightNumber !== $.get(heightNumber) || prevProps.widthNumber !== $.get(widthNumber) || prevProps.stickyIndices.toString() !== $.snapshot(stickyIndices()).toString()) {
			recomputeSizes();
		}

		prevProps = {
			scrollToIndex: $.snapshot($$props.scrollToIndex),
			scrollToAlignment: $.snapshot(scrollToAlignment()),
			scrollOffset: $.snapshot($$props.scrollOffset),
			itemCount: $.snapshot($$props.itemCount),
			itemSize: typeof $$props.itemSize === 'function' ? $$props.itemSize : $.snapshot($$props.itemSize),
			estimatedItemSize: $.snapshot($.get(estimatedItemSize)),
			heightNumber: $.snapshot($.get(heightNumber)),
			widthNumber: $.snapshot($.get(widthNumber)),
			stickyIndices: $.snapshot(stickyIndices())
		};
	}

	function scrollUpdated() {
		if (prevScroll.offset !== $.get(scroll).offset || prevScroll.changeReason !== $.get(scroll).changeReason) {
			refresh();
		}

		if (prevScroll.offset !== $.get(scroll).offset && $.get(scroll).changeReason === SCROLL_CHANGE_REASON.REQUESTED) {
			wrapper.scroll({
				[SCROLL_PROP[scrollDirection()]]: $.get(scroll).offset,
				behavior: scrollToBehaviour()
			});
		}

		prevScroll = $.snapshot($.get(scroll));
	}

	/**
	 * Recomputes the sizes of the items and updates the visible items.
	 */
	function refresh() {
		const containerSize = scrollDirection() === DIRECTION.VERTICAL ? $.get(heightNumber) : $.get(widthNumber);
		const totalSize = sizeAndPositionManager.getTotalSize();
		const maxOffset = Math.max(0, totalSize - containerSize);
		const clampedOffset = Math.min($.get(scroll).offset, maxOffset);
		const { start, end } = sizeAndPositionManager.getVisibleRange(containerSize, clampedOffset, overscanCount());

		/** @type {{ index: number, style: string }[]} */
		const visibleItems = [];

		const heightUnit = typeof height() === 'number' ? 'px' : '';
		const widthUnit = typeof width() === 'number' ? 'px' : '';

		$.set(wrapperStyle, `height:${height()}${heightUnit};width:${width()}${widthUnit};`);

		if (scrollDirection() === DIRECTION.VERTICAL) {
			$.set(innerStyle, `flex-direction:column;height:${totalSize}px;`);
		} else {
			$.set(innerStyle, `min-height:100%;width:${totalSize}px;`);
		}

		const hasStickyIndices = stickyIndices().length > 0;

		if (hasStickyIndices) {
			for (const index of stickyIndices()) {
				visibleItems.push({ index, style: getStyle(index, true) });
			}
		}

		if (start !== undefined && end !== undefined) {
			for (let index = start; index <= end; index++) {
				if (hasStickyIndices && stickyIndices().includes(index)) continue;

				visibleItems.push({ index, style: getStyle(index, false) });
			}

			if ($$props.onItemsUpdated) $$props.onItemsUpdated({ start, end });
			if ($$props.onListItemsUpdate) $$props.onListItemsUpdate({ start, end }); // DEPRECATED
		}

		$.set(items, visibleItems);
	}

	/**
	 * Recomputes the sizes of the items in the list.
	 */
	function recomputeSizes(startIndex = $$props.scrollToIndex) {
		$.set(styleCache, {}, true);

		if (startIndex !== undefined && startIndex >= 0) {
			sizeAndPositionManager.resetItem(startIndex);
		}

		refresh();
	}

	/**
	 * Calculates the offset for a given index based on the scroll direction and alignment.
	 * @param {number} index
	 */
	function getOffsetForIndex(index) {
		if (index < 0 || index >= $$props.itemCount) index = 0;

		return sizeAndPositionManager.getUpdatedOffsetForIndex(scrollToAlignment(), scrollDirection() === DIRECTION.VERTICAL ? $.get(heightNumber) : $.get(widthNumber), $.get(scroll).offset || 0, index);
	}

	/**
	 * Handles the scroll event on the wrapper element.
	 * @param {Event} event
	 */
	function handleScroll(event) {
		const offset = wrapper[SCROLL_PROP_LEGACY[scrollDirection()]];

		if (offset < 0 || $.get(scroll).offset === offset || event.target !== wrapper) return;

		$.set(scroll, { offset, changeReason: SCROLL_CHANGE_REASON.OBSERVED });

		if ($$props.onAfterScroll) $$props.onAfterScroll({ offset, event });
	}

	/**
	 * Returns the style for a given item index.
	 * @param {number} index The index of the item
	 * @param {boolean} sticky Whether the item should be sticky or not
	 */
	function getStyle(index, sticky) {
		if ($.get(styleCache)[index]) return $.get(styleCache)[index];

		const { size, offset } = sizeAndPositionManager.getSizeAndPositionForIndex(index);
		let style;

		if (scrollDirection() === DIRECTION.VERTICAL) {
			style = `left:0;width:100%;height:${size}px;`;

			if (sticky) {
				style += `position:sticky;flex-grow:0;z-index:1;top:0;margin-top:${offset}px;margin-bottom:${-(offset + size)}px;`;
			} else {
				style += `position:absolute;top:${offset}px;`;
			}
		} else {
			style = `top:0;width:${size}px;`;

			if (sticky) {
				style += `position:sticky;z-index:1;left:0;margin-left:${offset}px;margin-right:${-(offset + size)}px;`;
			} else {
				style += `position:absolute;height:100%;left:${offset}px;`;
			}
		}

		$.get(styleCache)[index] = style;

		return $.get(styleCache)[index];
	}

	var $$exports = { recomputeSizes };
	var div = root();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.header);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.header) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);

	$.each(div_1, 21, () => $.get(items), (item) => $$props.getKey ? $$props.getKey(item.index) : item.index, ($$anchor, item) => {
		var fragment_1 = $.comment();
		var node_2 = $.first_child(fragment_1);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.snippet(node_3, () => $$props.item || $$props.children, () => ({ style: $.get(item).style, index: $.get(item).index }));
				$.append($$anchor, fragment_2);
			};

			$.if(node_2, ($$render) => {
				if ($.get(item).index < $$props.itemCount) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_5 = $.first_child(fragment_3);

			$.snippet(node_5, () => $$props.footer);
			$.append($$anchor, fragment_3);
		};

		$.if(node_4, ($$render) => {
			if ($$props.footer) $$render(consequent_2);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => wrapper = $$value, () => wrapper);

	$.template_effect(() => {
		$.set_style(div, $.get(wrapperStyle));
		$.set_style(div_1, $.get(innerStyle));
	});

	$.bind_element_size(div, 'offsetHeight', ($$value) => $.set(wrapperHeight, $$value));
	$.bind_element_size(div, 'offsetWidth', ($$value) => $.set(wrapperWidth, $$value));
	$.append($$anchor, div);

	return $.pop($$exports);
}
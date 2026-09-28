import * as $ from 'svelte/internal/server';
import { virtualMasonry } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function VirtualMasonry($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items = [],
			columns = 3,
			gap = 16,
			height = 600,
			overscan = 200,
			getItemHeight,
			scrollToIndex,
			children,
			ariaLabel = "Virtual masonry grid",
			class: className,
			classes,
			contained = false
		} = $$props;

		const theme = $.derived(() => getTheme("virtualMasonry"));
		let container;
		let containerWidth = 0;
		let scrollTop = 0;
		let rafId;
		const styles = $.derived(() => virtualMasonry({ contained }));

		const containStyle = $.derived(() => {
			if (!contained) return "";

			const itemClasses = clsx(classes?.item);
			const hasCustomContain = (/\[contain:[^\]]+\]/).test(itemClasses);

			return hasCustomContain ? "" : "contain: layout style paint;";
		});

		// Calculate column width based on container width
		const columnWidth = $.derived(() => {
			if (containerWidth === 0) return 0;

			return (containerWidth - gap * (columns - 1)) / columns;
		});

		// Position items in columns
		const positionedItems = $.derived(() => {
			if (columnWidth() === 0) return [];

			const columnHeights = new Array(columns).fill(0);
			const positioned = [];

			for (let i = 0; i < items.length; i++) {
				// Find shortest column
				const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));

				const itemHeight = getItemHeight ? getItemHeight(items[i], i) : 200;

				positioned.push({
					item: items[i],
					index: i,
					x: shortestColumn * (columnWidth() + gap),
					y: columnHeights[shortestColumn],
					height: itemHeight,
					column: shortestColumn
				});

				columnHeights[shortestColumn] += itemHeight + gap;
			}

			return positioned;
		});

		// Total height is the tallest column
		const totalHeight = $.derived(() => {
			if (positionedItems().length === 0) return 0;

			return Math.max(...positionedItems().map((item) => item.y + item.height));
		});

		// Visible items based on scroll position with overscan
		const visibleItems = $.derived(() => {
			const viewportTop = scrollTop - overscan;
			const viewportBottom = scrollTop + height + overscan;

			return positionedItems().filter((item) => {
				const itemTop = item.y;
				const itemBottom = item.y + item.height;

				return itemBottom >= viewportTop && itemTop <= viewportBottom;
			});
		});

		// Performance optimized scroll handler using RAF
		function handleScroll() {
			if (rafId) cancelAnimationFrame(rafId);

			rafId = requestAnimationFrame(() => {
				if (container) scrollTop = container.scrollTop;
			});
		}

		// Scroll to specific index
		function scrollToIndexImpl(index) {
			if (!container || index < 0 || index >= items.length) return;

			const item = positionedItems()[index];

			if (item) {
				container.scrollTop = item.y;
			}
		}

		$$renderer.push(`<div role="list"${$.attr(
			'aria-label',
			// Bind scrollToIndex function to parent component
			// Measure container width on mount and resize
			ariaLabel
		)}${$.attr_class($.clsx(styles().container({ class: clsx(theme()?.container, className) })))}${$.attr_style(`height:${height}px; position:relative;`)}><div${$.attr_class($.clsx(styles().spacer({ class: clsx(theme()?.spacer, classes?.spacer) })))}${$.attr_style(`height:${totalHeight()}px;`)}><div${$.attr_class($.clsx(styles().content({ class: clsx(theme()?.content, classes?.content) })))}><!--[-->`);

		const each_array = $.ensure_array_like(visibleItems());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { item, index, x, y, height: itemHeight } = each_array[$$index];

			$$renderer.push(`<div role="listitem"${$.attr('aria-setsize', items.length)}${$.attr('aria-posinset', index + 1)}${$.attr_class($.clsx(styles().item({ class: clsx(theme()?.item, classes?.item) })))}${$.attr_style(`position:absolute; left:${x}px; top:${y}px; width:${columnWidth()}px; height:${itemHeight}px; ${containStyle()}`)}>`);
			children?.($$renderer, item, index);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div>`);
	});
}
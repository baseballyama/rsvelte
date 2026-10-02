import * as $ from 'svelte/internal/server';
import { virtualList } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function VirtualList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items = [],
			minItemHeight = 50,
			height = 400,
			overscan = 5,
			getItemHeight,
			scrollToIndex,
			children,
			ariaLabel = "Virtual scrolling list",
			class: className,
			classes,
			contained = false
		} = $$props;

		const theme = $.derived(() => getTheme("virtualList"));
		let container;
		let scrollTop = 0;
		let rafId;

		/**
		 * Whether to apply CSS containment for performance optimization.
		 * Defaults to false. This prop value takes precedence over any theme defaults.
		 * @default false
		 */
		const styles = $.derived(() => virtualList({ contained }));

		const containStyle = $.derived(() => {
			if (!contained) return "";

			// Flatten potential string | string[] | Record<string, boolean> via clsx
			const itemClasses = clsx(classes?.item);

			const hasCustomContain = (/\[contain:[^\]]+\]/).test(itemClasses);

			return hasCustomContain ? "" : "contain: layout style paint;";
		});

		// Total height of all items
		const totalHeight = $.derived(() => items.reduce((sum, item, i) => sum + (getItemHeight ? getItemHeight(item, i) : minItemHeight ?? 50), 0));

		// Sanitize and use the safe value in index calculations.
		const overscanSafe = $.derived(() => Math.max(0, Math.floor(overscan ?? 0)));

		// Find the first visible index
		const startIndex = $.derived(() => {
			let y = 0;

			for (let i = 0; i < items.length; i++) {
				const h = getItemHeight ? getItemHeight(items[i], i) : minItemHeight ?? 50;

				if (y + h > scrollTop) return Math.max(0, i - overscanSafe());

				y += h;
			}

			return 0;
		});

		// Find the last visible index
		const endIndex = $.derived(() => {
			let y = 0;

			for (let i = 0; i < items.length; i++) {
				const h = getItemHeight ? getItemHeight(items[i], i) : minItemHeight ?? 50;

				y += h;

				if (y >= scrollTop + height) return Math.min(items.length, i + overscanSafe() + 1);
			}

			return items.length;
		});

		// Items currently rendered
		const visibleItems = $.derived(() => items.slice(startIndex(), endIndex()));

		// Offset of the first visible item
		const offsetY = $.derived(() => items.slice(0, startIndex()).reduce((sum, item, i) => sum + (getItemHeight ? getItemHeight(item, i) : minItemHeight ?? 50), 0));

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

			let y = 0;

			for (let i = 0; i < index; i++) {
				y += getItemHeight ? getItemHeight(items[i], i) : minItemHeight ?? 50;
			}

			container.scrollTop = y;
		}

		$$renderer.push(`<div role="list"${$.attr(
			'aria-label',
			// Bind scrollToIndex function to parent component
			// Cleanup RAF on unmount
			ariaLabel
		)}${$.attr_class($.clsx(styles().container({ class: clsx(theme()?.container, className) })))}${$.attr_style(`height:${height}px; position:relative;`)}><div${$.attr_class($.clsx(styles().spacer({ class: clsx(theme()?.spacer, classes?.spacer) })))}${$.attr_style(`height:${totalHeight()}px;`)}><div${$.attr_class($.clsx(styles().content({ class: clsx(theme()?.content, classes?.content) })))}${$.attr_style(`transform:translateY(${offsetY()}px); will-change:transform;`)}><!--[-->`);

		const each_array = $.ensure_array_like(visibleItems());

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let item = each_array[i];

			$$renderer.push(`<div role="listitem"${$.attr('aria-setsize', items.length)}${$.attr('aria-posinset', startIndex() + i + 1)}${$.attr_class($.clsx(styles().item({ class: clsx(theme()?.item, classes?.item) })))}${$.attr_style(containStyle())}>`);
			children?.($$renderer, item, startIndex() + i);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div></div></div>`);
	});
}
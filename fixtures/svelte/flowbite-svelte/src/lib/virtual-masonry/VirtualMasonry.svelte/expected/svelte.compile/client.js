import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { virtualMasonry } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var root = $.from_html(`<div role="listitem"><!></div>`);
var root_1 = $.from_html(`<div role="list"><div><div></div></div></div>`);

export default function VirtualMasonry($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []),
		columns = $.prop($$props, 'columns', 3, 3),
		gap = $.prop($$props, 'gap', 3, 16),
		height = $.prop($$props, 'height', 3, 600),
		overscan = $.prop($$props, 'overscan', 3, 200),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, "Virtual masonry grid"),
		contained = $.prop($$props, 'contained', 3, false);

	const theme = $.derived(() => getTheme("virtualMasonry"));
	let container;
	let containerWidth = $.state(0);
	let scrollTop = $.state(0);
	let rafId;
	const styles = $.derived(() => virtualMasonry({ contained: contained() }));

	const containStyle = $.derived(() => {
		if (!contained()) return "";

		const itemClasses = clsx($$props.classes?.item);
		const hasCustomContain = (/\[contain:[^\]]+\]/).test(itemClasses);

		return hasCustomContain ? "" : "contain: layout style paint;";
	});

	// Calculate column width based on container width
	const columnWidth = $.derived(() => {
		if ($.get(containerWidth) === 0) return 0;

		return ($.get(containerWidth) - gap() * (columns() - 1)) / columns();
	});

	// Position items in columns
	const positionedItems = $.derived(() => {
		if ($.get(columnWidth) === 0) return [];

		const columnHeights = new Array(columns()).fill(0);
		const positioned = [];

		for (let i = 0; i < items().length; i++) {
			// Find shortest column
			const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));

			const itemHeight = $$props.getItemHeight ? $$props.getItemHeight(items()[i], i) : 200;

			positioned.push({
				item: items()[i],
				index: i,
				x: shortestColumn * ($.get(columnWidth) + gap()),
				y: columnHeights[shortestColumn],
				height: itemHeight,
				column: shortestColumn
			});

			columnHeights[shortestColumn] += itemHeight + gap();
		}

		return positioned;
	});

	// Total height is the tallest column
	const totalHeight = $.derived(() => {
		if ($.get(positionedItems).length === 0) return 0;

		return Math.max(...$.get(positionedItems).map((item) => item.y + item.height));
	});

	// Visible items based on scroll position with overscan
	const visibleItems = $.derived(() => {
		const viewportTop = $.get(scrollTop) - overscan();
		const viewportBottom = $.get(scrollTop) + height() + overscan();

		return $.get(positionedItems).filter((item) => {
			const itemTop = item.y;
			const itemBottom = item.y + item.height;

			return itemBottom >= viewportTop && itemTop <= viewportBottom;
		});
	});

	// Performance optimized scroll handler using RAF
	function handleScroll() {
		if (rafId) cancelAnimationFrame(rafId);

		rafId = requestAnimationFrame(() => {
			if (container) $.set(scrollTop, container.scrollTop, true);
		});
	}

	// Scroll to specific index
	function scrollToIndexImpl(index) {
		if (!container || index < 0 || index >= items().length) return;

		const item = $.get(positionedItems)[index];

		if (item) {
			container.scrollTop = item.y;
		}
	}

	// Bind scrollToIndex function to parent component
	$.user_effect(() => {
		if ($$props.scrollToIndex) {
			$$props.scrollToIndex(scrollToIndexImpl);
		}
	});

	// Measure container width on mount and resize
	$.user_effect(() => {
		if (!container) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				$.set(containerWidth, entry.contentRect.width, true);
			}
		});

		resizeObserver.observe(container);

		return () => {
			resizeObserver.disconnect();

			if (rafId) cancelAnimationFrame(rafId);
		};
	});

	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.each(div_2, 21, () => $.get(visibleItems), ({ item, index, x, y, height: itemHeight }) => index, ($$anchor, $$item) => {
		let item = () => $.get($$item).item;
		let index = () => $.get($$item).index;
		let x = () => $.get($$item).x;
		let y = () => $.get($$item).y;
		let itemHeight = () => $.get($$item).height;
		var div_3 = root();
		var node = $.child(div_3);

		$.snippet(node, () => $$props.children ?? $.noop, item, index);
		$.reset(div_3);

		$.template_effect(
			($0) => {
				$.set_attribute(div_3, 'aria-setsize', items().length);
				$.set_attribute(div_3, 'aria-posinset', index() + 1);
				$.set_class(div_3, 1, $0);
				$.set_style(div_3, `position:absolute; left:${x()}px; top:${y()}px; width:${$.get(columnWidth)}px; height:${itemHeight()}px; ${$.get(containStyle)}`);
			},
			[
				() => $.clsx($.get(styles).item({ class: clsx($.get(theme)?.item, $$props.classes?.item) }))
			]
		);

		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.bind_this(div, ($$value) => container = $$value, () => container);

	$.template_effect(
		($0, $1, $2) => {
			$.set_attribute(div, 'aria-label', ariaLabel());
			$.set_class(div, 1, $0);
			$.set_style(div, `height:${height()}px; position:relative;`);
			$.set_class(div_1, 1, $1);
			$.set_style(div_1, `height:${$.get(totalHeight)}px;`);
			$.set_class(div_2, 1, $2);
		},
		[
			() => $.clsx($.get(styles).container({ class: clsx($.get(theme)?.container, $$props.class) })),
			() => $.clsx($.get(styles).spacer({ class: clsx($.get(theme)?.spacer, $$props.classes?.spacer) })),
			() => $.clsx($.get(styles).content({ class: clsx($.get(theme)?.content, $$props.classes?.content) }))
		]
	);

	$.event('scroll', div, handleScroll);
	$.append($$anchor, div);
	$.pop();
}
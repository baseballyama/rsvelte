import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { virtualList } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

var root = $.from_html(`<div role="listitem"><!></div>`);
var root_1 = $.from_html(`<div role="list"><div><div></div></div></div>`);

export default function VirtualList($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []),
		minItemHeight = $.prop($$props, 'minItemHeight', 3, 50),
		height = $.prop($$props, 'height', 3, 400),
		overscan = $.prop($$props, 'overscan', 3, 5),
		ariaLabel = $.prop($$props, 'ariaLabel', 3, "Virtual scrolling list"),
		contained = $.prop($$props, 'contained', 3, false);

	const theme = $.derived(() => getTheme("virtualList"));
	let container;
	let scrollTop = $.state(0);
	let rafId;

	/**
	 * Whether to apply CSS containment for performance optimization.
	 * Defaults to false. This prop value takes precedence over any theme defaults.
	 * @default false
	 */
	const styles = $.derived(() => virtualList({ contained: contained() }));

	const containStyle = $.derived(() => {
		if (!contained()) return "";

		// Flatten potential string | string[] | Record<string, boolean> via clsx
		const itemClasses = clsx($$props.classes?.item);

		const hasCustomContain = (/\[contain:[^\]]+\]/).test(itemClasses);

		return hasCustomContain ? "" : "contain: layout style paint;";
	});

	// Total height of all items
	const totalHeight = $.derived(() => items().reduce(
		(sum, item, i) => sum + ($$props.getItemHeight
			? $$props.getItemHeight(item, i)
			: minItemHeight() ?? 50),
		0
	));

	// Sanitize and use the safe value in index calculations.
	const overscanSafe = $.derived(() => Math.max(0, Math.floor(overscan() ?? 0)));

	// Find the first visible index
	const startIndex = $.derived(() => {
		let y = 0;

		for (let i = 0; i < items().length; i++) {
			const h = $$props.getItemHeight
				? $$props.getItemHeight(items()[i], i)
				: minItemHeight() ?? 50;

			if (y + h > $.get(scrollTop)) return Math.max(0, i - $.get(overscanSafe));

			y += h;
		}

		return 0;
	});

	// Find the last visible index
	const endIndex = $.derived(() => {
		let y = 0;

		for (let i = 0; i < items().length; i++) {
			const h = $$props.getItemHeight
				? $$props.getItemHeight(items()[i], i)
				: minItemHeight() ?? 50;

			y += h;

			if (y >= $.get(scrollTop) + height()) return Math.min(items().length, i + $.get(overscanSafe) + 1);
		}

		return items().length;
	});

	// Items currently rendered
	const visibleItems = $.derived(() => items().slice($.get(startIndex), $.get(endIndex)));

	// Offset of the first visible item
	const offsetY = $.derived(() => items().slice(0, $.get(startIndex)).reduce(
		(sum, item, i) => sum + ($$props.getItemHeight
			? $$props.getItemHeight(item, i)
			: minItemHeight() ?? 50),
		0
	));

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

		let y = 0;

		for (let i = 0; i < index; i++) {
			y += $$props.getItemHeight
				? $$props.getItemHeight(items()[i], i)
				: minItemHeight() ?? 50;
		}

		container.scrollTop = y;
	}

	// Bind scrollToIndex function to parent component
	$.user_effect(() => {
		if ($$props.scrollToIndex) {
			$$props.scrollToIndex(scrollToIndexImpl);
		}
	});

	// Cleanup RAF on unmount
	$.user_effect(() => {
		return () => {
			if (rafId) cancelAnimationFrame(rafId);
		};
	});

	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.each(div_2, 23, () => $.get(visibleItems), (item, i) => $.get(startIndex) + i, ($$anchor, item, i) => {
		var div_3 = root();
		var node = $.child(div_3);

		$.snippet(node, () => $$props.children ?? $.noop, () => $.get(item), () => $.get(startIndex) + $.get(i));
		$.reset(div_3);

		$.template_effect(
			($0) => {
				$.set_attribute(div_3, 'aria-setsize', items().length);
				$.set_attribute(div_3, 'aria-posinset', $.get(startIndex) + $.get(i) + 1);
				$.set_class(div_3, 1, $0);
				$.set_style(div_3, $.get(containStyle));
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
			$.set_style(div_2, `transform:translateY(${$.get(offsetY)}px); will-change:transform;`);
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
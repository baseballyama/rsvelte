import * as $ from 'svelte/internal/server';
import { divider, dividerHitArea } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { nonPassiveTouch } from "$lib/utils/nonPassiveTouch";

export default function Divider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			direction,
			index,
			onMouseDown,
			onTouchStart,
			onKeyDown,
			isDragging,
			currentSize,
			class: className = ""
		} = $$props;

		const themeDivider = $.derived(() => getTheme("divider"));
		const themeDividerHitArea = $.derived(() => getTheme("dividerHitArea"));
		const isHorizontal = $.derived(() => direction === "horizontal");
		const roundedSize = $.derived(() => Math.round(currentSize));

		$$renderer.push(`<div role="separator" tabindex="0"${$.attr('aria-orientation', isHorizontal() ? "vertical" : "horizontal")}${$.attr('aria-label', `Resize ${isHorizontal() ? "horizontal" : "vertical"} panes`)}${$.attr('aria-valuenow', roundedSize())} aria-valuemin="0" aria-valuemax="100"${$.attr('aria-valuetext', `${roundedSize()} percent`)}${$.attr_class($.clsx(divider({
			direction,
			isDragging,
			class: clsx(themeDivider(), className)
		})))}><div${$.attr_class($.clsx(dividerHitArea({ direction, class: clsx(themeDividerHitArea(), className) })))}></div></div>`);
	});
}
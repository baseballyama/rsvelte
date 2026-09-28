import * as $ from 'svelte/internal/server';
import { getSplitPaneContext } from "$lib/context";
import Divider from "./Divider.svelte";
import { pane } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";

export default function Pane($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className = "", style = "" } = $$props;
		const theme = $.derived(() => getTheme("pane"));
		const context = getSplitPaneContext();
		const paneIndex = context ? context.registerPane() : 0;

		const paneStyle = $.derived(() => {
			const styles = [style];

			if (context) {
				const contextStyle = context.getPaneStyle(paneIndex);

				styles.push(contextStyle);
			}

			return styles.filter(Boolean).join("; ");
		});

		const showDivider = $.derived(() => context?.shouldRenderDivider(paneIndex) ?? false);
		const direction = $.derived(() => context?.getDirection() ?? "horizontal");
		const isDragging = $.derived(() => context?.getIsDragging() ?? false);

		$$renderer.push(`<div${$.attr_class($.clsx(pane({ class: clsx(theme(), className) })))}${$.attr_style(paneStyle())}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div> `);

		if (showDivider() && context) {
			$$renderer.push('<!--[0-->');

			Divider($$renderer, {
				direction: direction(),
				index: paneIndex,
				isDragging: isDragging(),
				currentSize: context.getPaneSize(paneIndex),
				onMouseDown: context.onMouseDown,
				onTouchStart: context.onTouchStart,
				onKeyDown: context.onKeyDown
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
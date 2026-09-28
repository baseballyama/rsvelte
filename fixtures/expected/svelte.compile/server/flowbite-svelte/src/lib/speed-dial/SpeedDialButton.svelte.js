import * as $ from 'svelte/internal/server';
import Button from "$lib/buttons/Button.svelte";
import Tooltip from "$lib/tooltip/Tooltip.svelte";
import { getContext, untrack } from "svelte";
import { speedDialButton } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";

export default function SpeedDialButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const context = getContext("speed-dial");

		let {
			children,
			name = "",
			color = "light",
			tooltip: _tooltip,
			pill = context.pill,
			textOutside = context.textOutside,
			textClass,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("SpeedDialButton", untrack(() => ({ textClass })), { textClass: "span" });

		const styling = $.derived(() => classes ?? { span: textClass });
		let tooltip = $.derived(() => _tooltip ?? context.tooltip);
		const theme = $.derived(() => getTheme("speedDialButton"));

		let $$d = $.derived(() => speedDialButton({ textOutside, noTooltip: tooltip() === "none" })),
			base = $.derived(() => $$d().base),
			span = $.derived(() => $$d().span);

		let spanCls = $.derived(() => tooltip() === "none" || textOutside
			? span()({ class: clsx(theme()?.span, styling().span) })
			: "sr-only");

		let buttonCls = $.derived(() => base()({ class: clsx(theme()?.base, className) }));

		Button($$renderer, $.spread_props([
			{ pill, color },
			restProps,
			{
				class: buttonCls(),
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!----> <span${$.attr_class($.clsx(spanCls()))}>${$.escape(name)}</span>`);
				},
				$$slots: { default: true }
			}
		]));

		$$renderer.push(`<!----> `);

		if (tooltip() !== "none") {
			$$renderer.push('<!--[0-->');

			Tooltip($$renderer, {
				placement: tooltip(),
				type: 'dark',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(name)}`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}
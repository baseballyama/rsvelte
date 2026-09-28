import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import Popper from "$lib/utils/Popper.svelte";
import { getSideAxis } from "@floating-ui/utils";
import { setContext, untrack } from "svelte";
import { speedDial } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";

export default function SpeedDial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			popperClass,
			placement = "top",
			pill = true,
			tooltip = "left",
			trigger = "hover",
			textOutside = false,
			class: className,
			classes,
			isOpen = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("SpeedDial", untrack(() => ({ popperClass })), { popperClass: "popper" });

		const styling = $.derived(() => classes ?? { popper: popperClass });
		const theme = $.derived(() => getTheme("speedDial"));

		const speedDialCtx = {
			get pill() {
				return pill;
			},

			get tooltip() {
				return tooltip;
			},

			get textOutside() {
				return textOutside;
			}
		};

		setContext("speed-dial", speedDialCtx);

		let vertical = $.derived(() => getSideAxis(placement) === "y");

		let $$d = $.derived(() => speedDial({ vertical: vertical() })),
			base = $.derived(() => $$d().base),
			popper = $.derived(() => $$d().popper);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Popper($$renderer, $.spread_props([
				restProps,
				{
					trigger,
					arrow: false,
					placement,
					class: base()({ class: clsx(theme()?.base, className) }),
					get isOpen() {
						return isOpen;
					},

					set isOpen($$value) {
						isOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<div${$.attr_class($.clsx(popper()({ class: clsx(theme()?.popper, styling().popper) })))}>`);
						children($$renderer);
						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { isOpen });
	});
}
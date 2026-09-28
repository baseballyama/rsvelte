import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import ToolbarButton from "../toolbar/ToolbarButton.svelte";
import Menu from "./Menu.svelte";
import { navbarHamburger } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { getNavbarStateContext, getNavbarBreakpointContext } from "$lib/context";
import { untrack } from "svelte";

export default function NavHamburger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			onclick,
			menuClass,
			class: className,
			classes,
			name = "Open main menu",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("NavHamburger", untrack(() => ({ menuClass })), { menuClass: "menu" });

		const styling = $.derived(() => classes ?? { menu: menuClass });
		const theme = $.derived(() => getTheme("navbarHamburger"));
		const navState = getNavbarStateContext();
		const navBreakpointCtx = getNavbarBreakpointContext();

		const $$d = $.derived(() => navbarHamburger({ breakpoint: navBreakpointCtx?.value ?? "md" })),
			base = $.derived(() => $$d().base),
			menu = $.derived(() => $$d().menu);

		const toggle = () => {
			if (!navState) return;

			navState.hidden = !navState.hidden;
		};

		ToolbarButton($$renderer, $.spread_props([
			{ name, onclick: onclick || toggle },
			restProps,
			{
				class: base()({ class: clsx(theme()?.base, className) }),
				children: ($$renderer) => {
					Menu($$renderer, {
						class: menu()({ class: clsx(theme()?.menu, styling().menu) })
					});
				},
				$$slots: { default: true }
			}
		]));
	});
}
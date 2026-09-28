import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import ToolbarButton from "../toolbar/ToolbarButton.svelte";
import Menu from "./Menu.svelte";
import { navbarHamburger } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { getNavbarStateContext, getNavbarBreakpointContext } from "$lib/context";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'onclick',
	'menuClass',
	'class',
	'classes',
	'name'
]);

export default function NavHamburger($$anchor, $$props) {
	$.push($$props, true);

	let name = $.prop($$props, 'name', 3, "Open main menu"),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("NavHamburger", untrack(() => ({ menuClass: $$props.menuClass })), { menuClass: "menu" });

	const styling = $.derived(() => $$props.classes ?? { menu: $$props.menuClass });
	const theme = $.derived(() => getTheme("navbarHamburger"));
	const navState = getNavbarStateContext();
	const navBreakpointCtx = getNavbarBreakpointContext();

	const $$d = $.derived(() => navbarHamburger({ breakpoint: navBreakpointCtx?.value ?? "md" })),
		base = $.derived(() => $.get($$d).base),
		menu = $.derived(() => $.get($$d).menu);

	const toggle = () => {
		if (!navState) return;

		navState.hidden = !navState.hidden;
	};

	{
		let $0 = $.derived(() => $$props.onclick || toggle);
		let $1 = $.derived(() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }));

		ToolbarButton($$anchor, $.spread_props(
			{
				get name() {
					return name();
				},

				get onclick() {
					return $.get($0);
				}
			},
			() => restProps,
			{
				get class() {
					return $.get($1);
				},

				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => $.get(menu)({ class: clsx($.get(theme)?.menu, $.get(styling).menu) }));

						Menu($$anchor, {
							get class() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}
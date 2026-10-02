import * as $ from 'svelte/internal/server';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { navbarLi } from "./theme";
import { getNavbarStateContext, getNavbarBreakpointContext } from "$lib/context";

export default function NavLi($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let navState = getNavbarStateContext();
		let navBreakpointCtx = getNavbarBreakpointContext();

		let {
			children,
			onclick,
			activeClass,
			nonActiveClass,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("navbarLi"));
		let active = $.derived(() => navState?.activeUrl ? restProps.href === navState.activeUrl : false);

		let liClass = $.derived(() => navbarLi({
			breakpoint: navBreakpointCtx?.value ?? "md",
			hidden: navState?.hidden ?? true,
			class: clsx(
				active()
					? activeClass ?? navState?.activeClass
					: nonActiveClass ?? navState?.nonActiveClass,
				theme(),
				className
			)
		}));

		function handleClick(event) {
			// Close the mobile menu when a link is clicked
			if (navState && restProps.href !== undefined && !navState.hidden) {
				navState.hidden = true;
			}

			// Call original onclick handler if provided
			if (onclick) {
				// Cast the handler to accept a standard MouseEvent
				onclick(event);
			}
		}

		$$renderer.push(`<li>`);

		if (restProps.href === undefined) {
			$$renderer.push(`<!--[0--><button${$.attributes({ role: 'presentation', ...restProps, class: $.clsx(liClass()) })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attributes({ ...restProps, class: $.clsx(liClass()) })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></a>`);
		}

		$$renderer.push(`<!--]--></li>`);
	});
}
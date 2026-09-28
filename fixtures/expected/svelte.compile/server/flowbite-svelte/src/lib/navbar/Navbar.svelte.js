import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import NavContainer from "./NavContainer.svelte";
import { navbar } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import { setNavbarStateContext, setNavbarBreakpointContext } from "$lib/context";
import { untrack } from "svelte";

export default function Navbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			fluid,
			navContainerClass,
			class: className,
			closeOnClickOutside = true,
			breakpoint = "md",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("navbar"));
		let navState = { hidden: true };

		setNavbarStateContext(navState);

		let breakpointState = { value: untrack(() => breakpoint) };

		setNavbarBreakpointContext(breakpointState);

		// Add reference to the navbar element
		let navbarElement;

		let toggle = () => {
			navState.hidden = !navState.hidden;
		};

		function handleDocumentClick(event) {
			if (!closeOnClickOutside) return;

			// Check if the click was outside the navbar AND the dropdown is open
			if (!navState.hidden && navbarElement && !navbarElement.contains(event.target)) {
				navState.hidden = true;
			}
		}

		$$renderer.push(`<nav><div${$.attributes({
			...restProps,
			class: $.clsx(navbar({ class: clsx(theme(), className) }))
		})}>`);

		NavContainer($$renderer, {
			fluid,
			class: clsx(navContainerClass),
			children: ($$renderer) => {
				children($$renderer, { hidden: navState.hidden, toggle, NavContainer });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></nav>`);
	});
}
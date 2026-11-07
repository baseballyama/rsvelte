import * as $ from 'svelte/internal/server';
import { trapFocus } from "$lib/utils/actions";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { setSidebarContext, setActiveUrlContext } from "$lib/context";
import { sineIn } from "svelte/easing";
import { writable } from "svelte/store";
import { fly } from "svelte/transition";
import { sidebar } from "./theme";
import { untrack } from "svelte";

export default function Sidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			isOpen = false,
			closeSidebar,
			isSingle = true,
			breakpoint = "md",
			alwaysOpen = false,
			position = "fixed",
			activateClickOutside = true,
			backdrop = true,
			backdropClass,
			transition = fly,
			params,
			divClass,
			ariaLabel,
			nonActiveClass,
			activeClass,
			activeUrl = "",
			class: className,
			classes,
			disableBreakpoints = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Sidebar", untrack(() => ({ backdropClass, divClass, nonActiveClass, activeClass })), {
			backdropClass: "backdrop",
			divClass: "div",
			nonActiveClass: "nonactive",
			activeClass: "active"
		});

		const styling = $.derived(() => classes ?? {
			backdrop: backdropClass,
			div: divClass,
			nonactive: nonActiveClass,
			active: activeClass
		});

		const theme = $.derived(() => getTheme("sidebar"));
		const breakpointValues = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 };
		let innerWidth = -1;

		let isLargeScreen = $.derived(() => disableBreakpoints
			? false
			: alwaysOpen || innerWidth >= breakpointValues[breakpoint]);

		// Create reactive context for activeUrl using getter
		const activeUrlContext = {
			get value() {
				return activeUrl;
			}
		};

		setActiveUrlContext(activeUrlContext);

		const $$d = $.derived(() => sidebar({
				isOpen,
				breakpoint,
				position,
				backdrop,
				alwaysOpen: alwaysOpen && !disableBreakpoints
			})),
			base = $.derived(() => $$d().base),
			active = $.derived(() => $$d().active),
			nonactive = $.derived(() => $$d().nonactive),
			div = $.derived(() => $$d().div),
			backdropCls = $.derived(() => $$d().backdrop);

		const selectedStore = $.derived(() => isSingle ? writable(null) : undefined);

		let sidebarCtx = {
			get closeSidebar() {
				return closeSidebar;
			},

			get activeClass() {
				return active()({ class: clsx(theme()?.active, styling().active) });
			},

			get nonActiveClass() {
				return nonactive()({ class: clsx(theme()?.nonactive, styling().nonactive) });
			},

			get isSingle() {
				return isSingle;
			},

			get selected() {
				return selectedStore();
			}
		};

		let transitionParams = $.derived(() => params ? params : { x: -320, duration: 200, easing: sineIn });

		setSidebarContext(sidebarCtx);

		// Handler for Escape key
		const handleEscape = () => {
			closeSidebar?.();
		};

		if (!disableBreakpoints) {
			$$renderer.push('<!--[0-->');

			if (isOpen || isLargeScreen()) {
				$$renderer.push('<!--[0-->');

				if (isOpen && !alwaysOpen) {
					$$renderer.push('<!--[0-->');

					if (backdrop && activateClickOutside) {
						$$renderer.push(`<!--[0--><div role="presentation"${$.attr_class($.clsx(backdropCls()({ class: clsx(theme()?.backdrop, styling().backdrop) })))}></div>`);
					} else if (backdrop && !activateClickOutside) {
						$$renderer.push(`<!--[1--><div role="presentation"${$.attr_class($.clsx(backdropCls()({ class: clsx(theme()?.backdrop, styling().backdrop) })))}></div>`);
					} else if (!backdrop && activateClickOutside) {
						$$renderer.push(`<!--[2--><div role="presentation" class="fixed start-0 top-0 z-50 h-full w-full"></div>`);
					} else if (!backdrop && !activateClickOutside) {
						$$renderer.push(`<!--[3--><div role="presentation" class="fixed start-0 top-0 z-50 h-full w-full"></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <aside${$.attributes({
					...restProps,
					class: $.clsx(base()({ class: clsx(theme()?.base, className) })),
					'aria-label': ariaLabel
				})}><div${$.attr_class($.clsx(div()({ class: clsx(theme()?.base, styling().div) })))}>`);

				children($$renderer);
				$$renderer.push(`<!----></div></aside>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><aside${$.attributes({
				...restProps,
				class: $.clsx(base()({ class: clsx(theme()?.base, className) })),
				'aria-label': ariaLabel
			})}><div${$.attr_class($.clsx(div()({ class: clsx(theme()?.base, styling().div) })))}>`);

			children($$renderer);
			$$renderer.push(`<!----></div></aside>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
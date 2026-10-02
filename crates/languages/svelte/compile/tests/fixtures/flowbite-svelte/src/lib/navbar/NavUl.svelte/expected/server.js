import * as $ from 'svelte/internal/server';
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { sineIn } from "svelte/easing";
import { prefersReducedMotion } from "svelte/motion";
import { fade, fly, scale, slide } from "svelte/transition";
import { navbarUl } from "./theme";
import { getNavbarStateContext, getNavbarBreakpointContext } from "$lib/context";
import { untrack } from "svelte";

export default function NavUl($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let navState = getNavbarStateContext();
		let navBreakpointCtx = getNavbarBreakpointContext();

		let {
			children,
			activeUrl = void 0,
			ulClass,
			slideParams,
			transition = slide,
			transitionParams,
			activeClass,
			nonActiveClass,
			respectMotionPreference = true,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("NavUl", untrack(() => ({ ulClass, activeClass, nonActiveClass })), {
			ulClass: "ul",
			activeClass: "active",
			nonActiveClass: "nonActive"
		});

		const styling = $.derived(() => classes ?? { ul: ulClass, active: activeClass, nonActive: nonActiveClass });
		const theme = $.derived(() => getTheme("navbarUl"));

		// Default parameters for different transitions
		const getDefaultParams = (transitionFn) => {
			if (transitionFn === slide) return { delay: 0, duration: 200, easing: sineIn };
			if (transitionFn === fly) return { delay: 0, duration: 200, y: -10, easing: sineIn };
			if (transitionFn === fade) return { delay: 0, duration: 200, easing: sineIn };
			if (transitionFn === scale) return { delay: 0, duration: 200, start: 0.95, easing: sineIn };

			return { delay: 0, duration: 200, easing: sineIn };
		};

		// Support legacy slideParams prop
		const defaultParams = $.derived(() => getDefaultParams(transition));

		const finalParams = $.derived(() => transitionParams ?? slideParams ?? defaultParams());

		// Create motion-aware parameters
		const transitionOptions = $.derived(() => () => {
			if (respectMotionPreference && prefersReducedMotion.current) {
				return { ...finalParams(), duration: 0, delay: 0 };
			}

			return finalParams();
		});

		let hidden = $.derived(() => navState?.hidden ?? true);

		let $$d = $.derived(() => navbarUl({
				hidden: hidden(),
				breakpoint: navBreakpointCtx?.value ?? "md"
			})),
			base = $.derived(() => $$d().base),
			ul = $.derived(() => $$d().ul),
			active = $.derived(() => $$d().active),
			nonActive = $.derived(() => $$d().nonActive);

		let divCls = $.derived(() => base()({ class: clsx(theme()?.base, className) }));
		let ulCls = $.derived(() => ul()({ class: clsx(theme()?.ul, styling().ul) }));

		if (!hidden()) {
			$$renderer.push(`<!--[0--><div${$.attributes({ ...restProps, class: $.clsx(divCls()) })}><ul${$.attr_class($.clsx(ulCls()))}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></ul></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...restProps, class: $.clsx(divCls()) })}><ul${$.attr_class($.clsx(ulCls()))}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></ul></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { activeUrl });
	});
}
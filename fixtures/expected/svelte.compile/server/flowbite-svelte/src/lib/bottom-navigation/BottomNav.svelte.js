import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { setBottomNavContext } from "$lib/context";
import { bottomNav } from "./theme";
import { untrack } from "svelte";

export default function BottomNav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			header,
			position = "fixed",
			navType = "default",
			class: className,
			classes,
			outerClass,
			innerClass,
			activeClass,
			activeUrl = "",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("BottomNav", untrack(() => ({ innerClass, outerClass })), { innerClass: "inner", outerClass: "class" });

		const styling = $.derived(() => classes ?? { inner: innerClass });

		// Theme context
		const theme = $.derived(() => getTheme("bottomNav"));

		const activeCls = $.derived(() => cn("text-primary-700 dark:text-primary-700 hover:text-primary-900 dark:hover:text-primary-900", activeClass));

		// Create reactive context using getters
		const reactiveCtx = {
			get activeClass() {
				return activeCls();
			},

			get activeUrl() {
				return activeUrl;
			},

			get navType() {
				return navType;
			}
		};

		setBottomNavContext(reactiveCtx);

		const $$d = $.derived(() => bottomNav({ position, navType })),
			base = $.derived(() => $$d().base),
			inner = $.derived(() => $$d().inner);

		$$renderer.push(`<div${$.attributes({
			...restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className ?? outerClass) }))
		})}>`);

		if (header) {
			$$renderer.push('<!--[0-->');
			header($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(inner()({ class: clsx(theme()?.inner, styling().inner) })))}>`);
		children($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}
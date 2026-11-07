import * as $ from 'svelte/internal/server';
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { getBottomNavContext } from "$lib/context";
import { bottomNavItem } from "./theme";
import { untrack } from "svelte";

export default function BottomNavItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			btnName,
			appBtnPosition = "middle",
			activeClass,
			class: className,
			classes,
			btnClass,
			spanClass,
			active: manualActive,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("BottomNavItem", untrack(() => ({ spanClass, btnClass })), { spanClass: "span", btnClass: "class" });

		const styling = $.derived(() => classes ?? { span: spanClass });

		// Theme context
		const theme = $.derived(() => getTheme("bottomNavItem"));

		const context = getBottomNavContext();
		let navUrl = $.derived(() => context?.activeUrl || "");

		const $$d = $.derived(() => bottomNavItem({ navType: context?.navType, appBtnPosition })),
			base = $.derived(() => $$d().base),
			span = $.derived(() => $$d().span);

		// Determine active state based on manual prop or URL matching
		let isActive = $.derived(() => {
			const href = restProps.href ?? "";

			return manualActive !== undefined
				? !!manualActive
				: navUrl()
					? href === "/"
						? navUrl() === "/"
						: href && (navUrl() === href || navUrl().startsWith(href + "/") || href !== "/" && navUrl().replace(/^https?:\/\/[^/]+/, "").startsWith(href))
					: false;
		});

		function getCommonClass() {
			return base()({
				class: clsx(isActive() && (activeClass ?? context?.activeClass), theme()?.base, className ?? btnClass)
			});
		}

		function getSpanClass() {
			return span()({
				class: clsx(isActive() && (activeClass ?? context?.activeClass), theme()?.span, styling().span)
			});
		}

		/* eslint-disable  @typescript-eslint/no-explicit-any */
		const commonProps = $.derived(() => ({ "aria-label": btnName, class: getCommonClass(), ...restProps }));

		const anchorProps = $.derived(() => ({ ...commonProps() }));
		const buttonProps = $.derived(() => ({ ...commonProps(), type: "button" }));

		if (restProps.href === undefined) {
			$$renderer.push(`<!--[0--><button${$.attributes({ ...buttonProps() })}>`);
			children($$renderer);
			$$renderer.push(`<!----> <span${$.attr_class($.clsx(getSpanClass()))}>${$.escape(btnName)}</span></button>`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attributes({ ...anchorProps() })}>`);
			children($$renderer);
			$$renderer.push(`<!----> <span${$.attr_class($.clsx(getSpanClass()))}>${$.escape(btnName)}</span></a>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
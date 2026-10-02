import * as $ from 'svelte/internal/server';
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { fade } from "svelte/transition";
import { badge } from "./theme";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

export default function Badge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			icon,
			badgeStatus = true,
			color = "primary",
			large = false,
			dismissable = false,
			closeAriaLabel = "Remove badge",
			class: className,
			classes,
			border,
			href,
			target,
			rounded,
			transition = fade,
			params,
			aClass,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Badge", untrack(() => ({ aClass })), { aClass: "linkClass" });

		const styling = $.derived(() => classes ?? { linkClass: aClass });

		// Theme context
		const theme = $.derived(() => getTheme("badge"));

		const $$d = $.derived(() => badge({ color, size: large ? "large" : "small", rounded, border })),
			base = $.derived(() => $$d().base),
			linkClass = $.derived(() => $$d().linkClass);

		let ref = undefined;

		const close = () => {
			if (ref?.dispatchEvent(new Event("close", { bubbles: true, cancelable: true }))) {
				badgeStatus = false;
			}
		};

		createDismissableContext(close);

		if (badgeStatus) {
			$$renderer.push(`<!--[0--><div${$.attributes({
				...restProps,
				class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
			})}>`);

			if (href) {
				$$renderer.push(`<!--[0--><a${$.attr('href', href)}${$.attr('target', target)}${$.attr_class($.clsx(linkClass()({ class: clsx(theme()?.linkClass, styling().linkClass) })))}>`);
				children($$renderer);
				$$renderer.push(`<!----></a>`);
			} else {
				$$renderer.push('<!--[-1-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--> `);

			if (dismissable) {
				$$renderer.push('<!--[0-->');

				if (icon) {
					$$renderer.push('<!--[0-->');

					CloseButton($$renderer, {
						class: 'ms-1.5 -me-1.5',
						color,
						size: large ? "sm" : "xs",
						ariaLabel: closeAriaLabel,
						children: ($$renderer) => {
							icon($$renderer);
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');

					CloseButton($$renderer, {
						class: 'ms-1.5 -me-1.5',
						color,
						size: large ? "sm" : "xs",
						ariaLabel: closeAriaLabel
					});
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { badgeStatus });
	});
}
import * as $ from 'svelte/internal/server';
import { fade } from "svelte/transition";
import { banner } from "./theme";
import clsx from "clsx";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

export default function Banner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			header,
			open = true,
			dismissable = true,
			closeAriaLabel = "Remove banner",
			color = "gray",
			type,
			class: className,
			classes,
			innerClass,
			transition = fade,
			params,
			closeClass,
			onclose,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Banner", untrack(() => ({ innerClass, closeClass })), { innerClass: "insideDiv", closeClass: "dismissable" });

		const styling = $.derived(() => classes ?? { insideDiv: innerClass, dismissable: closeClass });

		// Theme context
		const theme = $.derived(() => getTheme("banner"));

		const $$d = $.derived(() => banner({ type, color })),
			base = $.derived(() => $$d().base),
			insideDiv = $.derived(() => $$d().insideDiv),
			dismissableClass = $.derived(() => $$d().dismissable);

		let ref = undefined;

		function close(event) {
			if (ref?.dispatchEvent(new Event("close", { bubbles: true, cancelable: true }))) {
				open = false;
				onclose?.(event);
			}
		}

		createDismissableContext(close);

		if (open) {
			$$renderer.push(`<!--[0--><div${$.attributes({
				tabindex: '-1',
				class: $.clsx(base()({ class: clsx(theme()?.base, className) })),
				...restProps
			})}><div${$.attr_class($.clsx(insideDiv()({ class: clsx(theme()?.insideDiv, styling().insideDiv) })))}>`);

			children?.($$renderer);
			$$renderer.push(`<!----></div> `);

			if (dismissable) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-end">`);

				CloseButton($$renderer, {
					class: dismissableClass()({ class: clsx(theme()?.dismissable, styling().dismissable) }),
					color,
					ariaLabel: closeAriaLabel
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { open });
	});
}
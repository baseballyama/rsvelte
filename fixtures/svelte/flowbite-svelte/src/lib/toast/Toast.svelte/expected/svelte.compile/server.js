import * as $ from 'svelte/internal/server';
import CloseButton from "$lib/utils/CloseButton.svelte";
import { toast } from "./theme";
import { fly } from "svelte/transition";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

export default function Toast($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			icon,
			toastStatus = true,
			dismissable = true,
			closeAriaLabel = "Remove toast",
			color = "primary",
			position,
			iconClass,
			contentClass,
			align = true,
			params,
			transition = fly,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Toast", untrack(() => ({ iconClass, contentClass })), { iconClass: "icon", contentClass: "content" });

		const styling = $.derived(() => classes ?? { icon: iconClass, content: contentClass });
		const theme = $.derived(() => getTheme("toast"));

		const $$d = $.derived(() => toast({ color, position, align })),
			base = $.derived(() => $$d().base),
			iconVariants = $.derived(() => $$d().icon),
			content = $.derived(() => $$d().content),
			close = $.derived(() => $$d().close);

		let ref = undefined;

		function _close() {
			if (ref?.dispatchEvent(new Event("close", { bubbles: true, cancelable: true }))) {
				toastStatus = false;
			}
		}

		createDismissableContext(_close);

		if (toastStatus) {
			$$renderer.push(`<!--[0--><div${$.attributes({
				role: 'alert',
				...restProps,
				class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
			})}>`);

			if (icon) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(iconVariants()({ class: clsx(theme()?.icon, styling().icon) })))}>`);
				icon($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(content()({ class: clsx(theme()?.content, styling().content) })))}>`);
			children($$renderer);
			$$renderer.push(`<!----></div> `);

			if (dismissable) {
				$$renderer.push('<!--[0-->');

				CloseButton($$renderer, {
					class: close()({ class: clsx(theme()?.close, classes?.close) }),
					ariaLabel: closeAriaLabel,
					color
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { toastStatus });
	});
}
import * as $ from 'svelte/internal/server';
import { fade } from "svelte/transition";
import { alert } from "./theme";
import clsx from "clsx";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";

export default function Alert($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			icon,
			alertStatus = true,
			closeIcon: CloseIcon,
			closeAriaLabel = "Remove alert",
			color = "primary",
			rounded = true,
			border,
			class: className,
			dismissable,
			transition = fade,
			params,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// Theme context
		const theme = $.derived(() => getTheme("alert"));

		let divCls = $.derived(() => alert({
			color,
			rounded,
			border,
			icon: !!icon,
			dismissable,
			class: clsx(theme(), className)
		}));

		let ref = undefined;

		function close() {
			if (ref?.dispatchEvent(new Event("close", { bubbles: true, cancelable: true }))) {
				alertStatus = false;
			}
		}

		createDismissableContext(close);

		if (alertStatus) {
			$$renderer.push(`<!--[0--><div${$.attributes({ role: 'alert', ...restProps, class: $.clsx(divCls()) })}>`);

			if (icon) {
				$$renderer.push('<!--[0-->');
				icon($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (icon || dismissable) {
				$$renderer.push(`<!--[0--><div>`);
				children($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--> `);

			if (dismissable) {
				$$renderer.push('<!--[0-->');

				if (CloseIcon) {
					$$renderer.push('<!--[0-->');

					CloseButton($$renderer, {
						class: '-my-1.5 ms-auto -me-1.5',
						color,
						ariaLabel: closeAriaLabel,
						children: ($$renderer) => {
							if (CloseIcon) {
								$$renderer.push('<!--[-->');
								CloseIcon($$renderer, {});
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');

					CloseButton($$renderer, {
						class: '-my-1.5 ms-auto -me-1.5',
						color,
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
		$.bind_props($$props, { alertStatus });
	});
}
import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { anchor } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function A($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			color = "primary",
			asButton = false,
			onclick,
			href = "#",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("anchor"));
		let linkCls = $.derived(() => anchor({ color, class: clsx(theme(), className) }));

		// Handle click events when in button mode
		function handleClick(event) {
			if (asButton) {
				event.preventDefault(); // Prevent default anchor behavior
			}

			// Forward the onclick handler if provided
			if (onclick) {
				onclick(event);
			}
		}

		let buttonProps = $.derived(() => () => {
			const { href, target, rel, download, ...filtered } = restProps;

			return filtered;
		});

		if (asButton) {
			$$renderer.push(`<!--[0--><button${$.attributes({ type: 'button', class: $.clsx(linkCls()), ...buttonProps() })}>`);
			children($$renderer);
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attributes({ href, class: $.clsx(linkCls()), ...restProps })}>`);
			children($$renderer);
			$$renderer.push(`<!----></a>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
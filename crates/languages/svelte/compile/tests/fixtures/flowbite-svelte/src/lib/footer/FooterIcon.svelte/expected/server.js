import * as $ from 'svelte/internal/server';
import { footerIcon } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function FooterIcon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			href,
			ariaLabel,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("footerIcon"));

		if (href) {
			$$renderer.push(`<!--[0--><a${$.attributes({
				...restProps,
				href,
				'aria-label': ariaLabel,
				class: $.clsx(footerIcon({ class: clsx(theme(), className) }))
			})}>`);

			children($$renderer);
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push('<!--[-1-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}
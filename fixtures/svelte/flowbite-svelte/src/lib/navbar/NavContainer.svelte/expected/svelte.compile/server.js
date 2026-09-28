import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { navbarContainer } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function NavContainer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			fluid,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("navbarContainer"));

		$$renderer.push(`<div${$.attributes({
			...restProps,
			class: $.clsx(navbarContainer({ fluid, class: clsx(theme(), className) }))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}
import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { navbarBrand } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function NavBrand($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("navbarBrand"));

		$$renderer.push(`<a${$.attributes({
			...restProps,
			class: $.clsx(navbarBrand({ class: clsx(theme(), className) }))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></a>`);
	});
}
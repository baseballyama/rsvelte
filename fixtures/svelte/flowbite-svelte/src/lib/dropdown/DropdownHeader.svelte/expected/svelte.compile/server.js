import * as $ from 'svelte/internal/server';
import { dropdownHeader } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function DropdownHeader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("dropdownHeader"));

		$$renderer.push(`<div${$.attributes({
			...restProps,
			class: $.clsx(dropdownHeader({ class: clsx(theme(), className) }))
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}
import * as $ from 'svelte/internal/server';
import { dropdownDivider } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function DropdownDivider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("dropdownDivider"));

		$$renderer.push(`<div${$.attributes({
			...restProps,
			class: $.clsx(dropdownDivider({ class: clsx(theme(), className) }))
		})}></div>`);
	});
}
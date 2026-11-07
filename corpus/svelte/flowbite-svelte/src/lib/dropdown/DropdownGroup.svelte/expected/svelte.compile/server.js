import * as $ from 'svelte/internal/server';
import { dropdownGroup } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function DropdownGroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("dropdownGroup"));

		$$renderer.push(`<ul${$.attributes({
			...restProps,
			class: $.clsx(dropdownGroup({ class: clsx(theme(), className) }))
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></ul>`);
	});
}
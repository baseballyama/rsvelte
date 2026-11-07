import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { secondary } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function Secondary($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("secondary"));

		$$renderer.push(`<small${$.attributes({
			...restProps,
			class: $.clsx(secondary({ class: clsx(theme(), className) }))
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></small>`);
	});
}
import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { paragraph } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function P($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className = "text-gray-900 dark:text-white",
			height = "normal",
			align = "left",
			justify = false,
			italic,
			firstUpper = false,
			whitespace = "normal",
			size = "base",
			space = "normal",
			weight = "normal",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("paragraph"));

		let classP = $.derived(() => paragraph({
			height,
			size,
			weight,
			space,
			align,
			justify,
			italic,
			firstUpper,
			whitespace,
			class: clsx(theme(), className)
		}));

		$$renderer.push(`<p${$.attributes({ ...restProps, class: $.clsx(classP()) })}>`);
		children($$renderer);
		$$renderer.push(`<!----></p>`);
	});
}
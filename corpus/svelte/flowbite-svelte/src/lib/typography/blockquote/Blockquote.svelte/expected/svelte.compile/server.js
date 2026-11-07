import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { blockquote } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function Blockquote($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			border,
			italic = true,
			bg,
			alignment = "left",
			size = "lg",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("blockquote"));

		let blockquoteCls = $.derived(() => blockquote({
			border,
			italic,
			bg,
			alignment,
			size,
			class: clsx(theme(), className)
		}));

		$$renderer.push(`<blockquote${$.attributes({ ...restProps, class: $.clsx(blockquoteCls()) })}>`);
		children($$renderer);
		$$renderer.push(`<!----></blockquote>`);
	});
}
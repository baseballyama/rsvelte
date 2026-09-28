import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { span } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function Span($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			italic,
			underline,
			linethrough,
			uppercase,
			gradient,
			highlight,
			decoration,
			decorationColor,
			decorationThickness,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("span"));

		let classSpan = $.derived(() => span({
			italic,
			underline,
			linethrough,
			uppercase,
			gradient,
			highlight,
			decoration,
			decorationColor,
			decorationThickness,
			class: clsx(theme(), className)
		}));

		$$renderer.push(`<span${$.attributes({ ...restProps, class: $.clsx(classSpan()) })}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></span>`);
	});
}
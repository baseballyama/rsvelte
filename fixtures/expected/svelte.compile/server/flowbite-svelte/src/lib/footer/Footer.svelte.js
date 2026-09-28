import * as $ from 'svelte/internal/server';
import { footer } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function Footer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			footerType = "default",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("footer"));
		const footerCls = $.derived(() => footer({ footerType, class: clsx(theme(), className) }));

		$$renderer.push(`<footer${$.attributes({ ...restProps, class: $.clsx(footerCls()) })}>`);
		children($$renderer);
		$$renderer.push(`<!----></footer>`);
	});
}
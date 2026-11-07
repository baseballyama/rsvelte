import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { layout } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function Layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("layout"));
		let divCls = $.derived(() => layout({ class: clsx(theme(), className) }));

		$$renderer.push(`<div${$.attributes({ ...restProps, class: $.clsx(divCls()) })}>`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}
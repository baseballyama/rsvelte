import * as $ from 'svelte/internal/server';
import { kbd } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function Kbd($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("kbd"));
		const kbdCls = $.derived(() => kbd({ class: clsx(theme(), className) }));

		$$renderer.push(`<kbd${$.attributes({ ...restProps, class: $.clsx(kbdCls()) })}>`);
		children($$renderer);
		$$renderer.push(`<!----></kbd>`);
	});
}
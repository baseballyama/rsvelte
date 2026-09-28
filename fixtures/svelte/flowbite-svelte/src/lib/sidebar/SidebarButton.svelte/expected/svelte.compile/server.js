import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { sidebarButton } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function SidebarButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			breakpoint = "md",
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("sidebarButton"));

		const $$d = $.derived(() => sidebarButton({ breakpoint })),
			base = $.derived(() => $$d().base),
			svg = $.derived(() => $$d().svg);

		$$renderer.push(`<button${$.attributes({
			...restProps,
			type: 'button',
			class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
		})}><span class="sr-only">Open sidebar</span> <svg${$.attr_class($.clsx(svg()({ class: clsx(theme()?.svg, classes?.svg) })))} aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path></svg></button>`);
	});
}
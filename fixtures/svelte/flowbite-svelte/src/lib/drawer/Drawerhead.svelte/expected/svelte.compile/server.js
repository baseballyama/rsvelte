import * as $ from 'svelte/internal/server';
import { drawerhead } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function Drawerhead($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			closeIcon,
			children,
			buttonClass,
			svgClass,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Drawerhead", untrack(() => ({ buttonClass, svgClass })), { buttonClass: "button", svgClass: "svg" });

		const styling = $.derived(() => classes ?? { button: buttonClass, svg: svgClass });
		const theme = $.derived(() => getTheme("drawer"));

		const $$d = $.derived(drawerhead),
			base = $.derived(() => $$d().base),
			button = $.derived(() => $$d().button),
			svg = $.derived(() => $$d().svg);

		$$renderer.push(`<div${$.attr_class($.clsx(base()({ class: clsx(theme()?.base, className) })))}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (closeIcon) {
			$$renderer.push('<!--[0-->');
			closeIcon($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({
				type: 'button',
				...restProps,
				class: $.clsx(button()({ class: clsx(styling().button) }))
			})}><svg${$.attr_class($.clsx(svg()({ class: clsx(styling().svg) })))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"></path></svg> <span class="sr-only">Close drawer</span></button>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}
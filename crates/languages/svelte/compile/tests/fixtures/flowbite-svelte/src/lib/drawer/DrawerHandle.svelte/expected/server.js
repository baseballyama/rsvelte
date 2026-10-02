import * as $ from 'svelte/internal/server';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { drawerhandle } from "./theme";
import { getDrawerContext } from "$lib/context";

export default function DrawerHandle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			placement,
			"aria-label": ariaLabel,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const ctx = getDrawerContext();
		const theme = $.derived(() => getTheme("drawerhandle"));

		let $$d = $.derived(() => drawerhandle({ placement: placement ?? ctx?.placement ?? "left" })),
			base = $.derived(() => $$d().base),
			handle = $.derived(() => $$d().handle);

		$$renderer.push(`<button${$.attributes({
			type: 'button',
			'aria-label': ariaLabel,
			...restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----> <span${$.attr_class($.clsx(handle()({ class: clsx(theme()?.handle, classes?.handle) })))}></span></button>`);
	});
}
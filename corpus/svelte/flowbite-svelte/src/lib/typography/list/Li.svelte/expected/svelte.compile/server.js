import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { getListContext } from "$lib/context";

export default function Li($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			icon,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const ctx = getListContext();
		let liCls = $.derived(() => clsx(ctx?.ctxClass, icon && "flex items-center", className));

		$$renderer.push(`<li${$.attributes({ ...restProps, class: $.clsx(liCls()) })}>`);
		children($$renderer);
		$$renderer.push(`<!----></li>`);
	});
}
import * as $ from 'svelte/internal/server';
import { setContext } from "svelte";
import { timeline } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function Timeline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			order = "default",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("timeline"));

		// svelte-ignore state_referenced_locally
		setContext("order", order);

		const olCls = $.derived(() => timeline({ order, class: clsx(theme(), className) }));

		$$renderer.push(`<ol${$.attributes({ ...restProps, class: $.clsx(olCls()) })}>`);
		children($$renderer);
		$$renderer.push(`<!----></ol>`);
	});
}
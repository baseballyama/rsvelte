import * as $ from 'svelte/internal/server';
import { bottomNavHeaderItem } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function BottomNavHeaderItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			itemName,
			active,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// Theme context
		const theme = $.derived(() => getTheme("bottomNavHeaderItem"));

		let base = $.derived(() => bottomNavHeaderItem({ active, class: clsx(theme(), className) }));

		$$renderer.push(`<button${$.attributes({ ...restProps, class: $.clsx(base()) })}>${$.escape(itemName)}</button>`);
	});
}
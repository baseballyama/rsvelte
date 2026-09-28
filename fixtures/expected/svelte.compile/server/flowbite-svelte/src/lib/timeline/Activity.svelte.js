import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { activity } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function Activity($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("activity"));

		$$renderer.push(`<ol${$.attributes({
			...restProps,
			class: $.clsx(activity({ class: clsx(theme(), className) }))
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></ol>`);
	});
}
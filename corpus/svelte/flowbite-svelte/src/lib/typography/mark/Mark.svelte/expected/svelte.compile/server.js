import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { mark } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function Mark($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("mark"));

		$$renderer.push(`<mark${$.attributes({
			...restProps,
			class: $.clsx(mark({ class: clsx(theme(), className) }))
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></mark>`);
	});
}
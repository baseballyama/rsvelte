import * as $ from 'svelte/internal/server';
import { thumbnail } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function Thumbnail($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { selected, class: className, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("thumbnail"));

		$$renderer.push(`<img${$.attributes({
			...restProps,
			class: $.clsx(thumbnail({ selected, class: clsx(theme(), className) }))
		})} onload="this.__e=event" onerror="this.__e=event"/>`);
	});
}
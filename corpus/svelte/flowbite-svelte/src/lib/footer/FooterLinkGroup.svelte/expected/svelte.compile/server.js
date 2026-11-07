import * as $ from 'svelte/internal/server';
import { footerLinkGroup } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function FooterLinkGroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;
		const theme = $.derived(() => getTheme("footerLinkGroup"));

		$$renderer.push(`<ul${$.attributes({
			...restProps,
			class: $.clsx(footerLinkGroup({ class: clsx(theme(), className) }))
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></ul>`);
	});
}
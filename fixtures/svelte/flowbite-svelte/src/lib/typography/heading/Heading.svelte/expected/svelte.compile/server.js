import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { heading } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function Heading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			tag = "h1",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("heading"));
		let headingCls = $.derived(() => heading({ tag, class: clsx(theme(), className) }));

		$.element(
			$$renderer,
			tag,
			() => {
				$$renderer.push(`${$.attributes({ ...restProps, class: $.clsx(headingCls()) })}`);
			},
			() => {
				children($$renderer);
				$$renderer.push(`<!---->`);
			}
		);
	});
}
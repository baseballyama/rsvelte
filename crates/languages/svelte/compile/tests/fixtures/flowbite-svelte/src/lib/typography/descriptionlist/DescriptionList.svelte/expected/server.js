import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { descriptionList } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function DescriptionList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			tag,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("descriptionList"));
		let descCls = $.derived(() => descriptionList({ tag, class: clsx(theme(), className) }));

		$.element(
			$$renderer,
			tag,
			() => {
				$$renderer.push(`${$.attributes({ ...restProps, class: $.clsx(descCls()) })}`);
			},
			() => {
				children($$renderer);
				$$renderer.push(`<!---->`);
			}
		);
	});
}
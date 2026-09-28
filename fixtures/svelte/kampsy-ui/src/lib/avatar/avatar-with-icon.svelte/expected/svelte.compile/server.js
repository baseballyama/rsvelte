import * as $ from 'svelte/internal/server';
import { avatarIconBase, sizeStyle } from "./styles.js";

export default function Avatar_with_icon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			size = 32,
			icon,
			iconBackground = false,
			class: klass,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let iconSize = $.derived(() => Math.round(size / 2.1));

		$$renderer.push(`<span${$.attributes({
			...rest,
			class: $.clsx([
				avatarIconBase,
				iconBackground ? "" : "bg-transparent",
				klass
			]),
			style: sizeStyle(size)
		})}><span class="flex items-center justify-center"${$.attr_style(`width: ${$.stringify(iconSize())}px; height: ${$.stringify(iconSize())}px;`)}>`);

		icon($$renderer);
		$$renderer.push(`<!----></span></span>`);
	});
}
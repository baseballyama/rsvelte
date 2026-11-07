import * as $ from 'svelte/internal/server';
import { clickOutside } from "@svar-ui/lib-dom";

export default function InlineDropdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			position = "bottom",
			align = "start",
			autoFit = true,
			oncancel = null,
			width = "100%",
			css = "",
			children
		} = $$props;

		let node;

		function down(e) {
			oncancel && oncancel(e);
		}

		$$renderer.push(`<div${$.attr_class(`wx-dropdown ${`wx-${position}-${align}`} ${$.stringify(css)}`, 'svelte-12vw1za')}${$.attr_style(`width:${$.stringify(width)}`)}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}
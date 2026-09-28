import * as $ from 'svelte/internal/server';
import { clickOutside } from "@svar-ui/lib-dom";
import { fly } from "svelte/transition";

export default function SideArea($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { position = "right", css = "", children, oncancel } = $$props;

		$$renderer.push(`<div${$.attr_class(`wx-sidearea wx-pos-${$.stringify(position)} ${$.stringify(css)}`, 'svelte-4hvxcm')}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}
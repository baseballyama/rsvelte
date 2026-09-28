import * as $ from 'svelte/internal/server';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { cn } from "$lib/utils.js";

export default function Doc_tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		if (Tabs.Root) {
			$$renderer.push('<!--[-->');
			Tabs.Root($$renderer, $.spread_props([{ class: cn("relative mt-6 w-full", className) }, restProps]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}
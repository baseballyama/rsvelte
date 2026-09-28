import * as $ from 'svelte/internal/server';
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { cn } from "$lib/utils.js";

export default function Doc_tabs_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		if (Tabs.List) {
			$$renderer.push('<!--[-->');

			Tabs.List($$renderer, $.spread_props([
				{
					class: cn("justify-start gap-4 rounded-none bg-transparent px-2 md:px-0", className),
					'data-llm-ignore': true
				},
				restProps
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}
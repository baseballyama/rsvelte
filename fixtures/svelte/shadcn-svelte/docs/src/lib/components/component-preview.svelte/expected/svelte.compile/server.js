import * as $ from 'svelte/internal/server';
import ComponentPreviewTabs from "./component-preview-tabs.svelte";

export default function Component_preview($$renderer, $$props) {
	let {
		name,
		type = "example",
		class: className,
		align = "center",
		hideCode = false,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	if (type === "block") {
		$$renderer.push(`<!--[0--><div class="relative aspect-[4/2.5] w-full overflow-hidden rounded-md border md:-mx-4" data-llm-ignore=""><img${$.attr('src', `/img/registry/${$.stringify(name)}-light.png`)}${$.attr('alt', name)}${$.attr('width', 1440)}${$.attr('height', 900)} class="absolute start-0 top-0 z-20 w-[970px] max-w-none bg-background sm:w-7xl md:hidden dark:hidden md:dark:hidden"/> <img${$.attr('src', `/img/registry/${$.stringify(name)}-dark.png`)}${$.attr('alt', name)}${$.attr('width', 1440)}${$.attr('height', 900)} class="absolute start-0 top-0 z-20 hidden w-[970px] max-w-none bg-background sm:w-7xl md:hidden dark:block md:dark:hidden"/> <div class="absolute inset-0 hidden w-[1600px] bg-background md:block"><iframe${$.attr('src', `/view/${$.stringify(name)}`)} class="size-full"${$.attr('title', name)}></iframe></div></div>`);
	} else if (type === "component" || type === "example") {
		$$renderer.push('<!--[1-->');
		ComponentPreviewTabs($$renderer, $.spread_props([{ name, class: className, align, hideCode }, restProps]));
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Integration_cardv5($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: _class = "", isCenter = false } = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(cn("relative z-30 flex size-12 rounded-full border bg-white shadow-sm shadow-black/5 dark:bg-white/5 dark:backdrop-blur-md", _class)))}><div${$.attr_class($.clsx(cn("m-auto size-fit *:size-5", isCenter && "*:size-8")))}>`);
		children($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}
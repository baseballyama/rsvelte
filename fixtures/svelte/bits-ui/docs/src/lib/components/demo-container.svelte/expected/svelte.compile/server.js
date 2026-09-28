import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";
import OpenInStackblitz from "./open-in-stackblitz.svelte";

export default function Demo_container($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			align = "center",
			size = "default",
			class: className,
			name,
			componentName = name,
			wrapperClass,
			children
		} = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(cn("rounded-tl-card rounded-tr-card border-muted ring-transparent! relative mt-6 border-2 bg-zinc-50 dark:bg-neutral-900/50", wrapperClass)))} data-llm-ignore=""><div${$.attr_class($.clsx(cn(
			"preview flex w-full justify-center p-12",
			{
				"items-center": align === "center",
				"items-start": align === "start",
				"items-end": align === "end",
				"min-h-[443px]": size === "default",
				"min-h-[200px]": size === "xs",
				"min-h-[300px]": size === "sm",
				"min-h-[600px]": size === "lg"
			},
			className
		)))}>`);

		children($$renderer);
		$$renderer.push(`<!----></div> `);

		if (name) {
			$$renderer.push('<!--[0-->');
			OpenInStackblitz($$renderer, { demoName: name, componentName });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}
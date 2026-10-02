import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils";

export default function Step($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, title, titleBaseClass } = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(cn("relative pb-10 pl-8", className)))}>`);

		if (title) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cn("mb-2 flex h-8 items-center", titleBaseClass)))}><span class="absolute -left-4 flex size-8 items-center justify-center rounded-full border border-border bg-card font-mono text-xs font-medium text-foreground [counter-increment:step] before:content-[counter(step)]"></span> <h3 class="text-base leading-none font-medium">${$.escape(title)}</h3></div>`);
		} else {
			$$renderer.push(`<!--[-1--><span class="absolute top-1 -left-4 flex size-8 items-center justify-center rounded-full border border-border bg-card font-mono text-xs font-medium text-foreground [counter-increment:step] before:content-[counter(step)]"></span>`);
		}

		$$renderer.push(`<!--]--> <div class="text-base leading-relaxed text-foreground/70">`);
		children?.($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}
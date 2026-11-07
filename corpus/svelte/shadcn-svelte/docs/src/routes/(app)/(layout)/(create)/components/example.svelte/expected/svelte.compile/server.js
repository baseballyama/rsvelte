import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

export default function Example($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			title,
			containerClass,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			'data-slot': 'example',
			class: $.clsx(cn("mx-auto flex w-full max-w-lg min-w-0 flex-col gap-1 self-stretch lg:max-w-none", containerClass)),
			...restProps
		})}>`);

		if (title) {
			$$renderer.push(`<!--[0--><div class="px-1.5 py-2 text-xs font-medium text-muted-foreground">${$.escape(title)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div data-slot="example-content"${$.attr_class($.clsx(cn("flex min-w-0 flex-1 flex-col items-start gap-6 rounded-xl bg-card p-12 text-foreground *:[div:not([class*='w-'])]:w-full", className)))}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}
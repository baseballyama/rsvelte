import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Code($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<code${$.attributes({
			class: $.clsx(cn("rounded-button bg-muted text-foreground/60 relative inline-flex h-[27px] items-center justify-center px-[8px] font-mono text-xs font-medium tracking-tighter sm:text-sm", className, "custom")),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></code>`);
	});
}
import * as $ from 'svelte/internal/server';
import { buttonVariants } from "./index.js";
import { cn } from "$lib/utils/styles.js";

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			variant = "default",
			size = "default",
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<button${$.attributes({
			class: $.clsx(cn(buttonVariants({ variant, size }), className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></button>`);
	});
}
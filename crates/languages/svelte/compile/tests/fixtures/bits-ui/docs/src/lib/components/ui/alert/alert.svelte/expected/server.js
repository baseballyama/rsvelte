import * as $ from 'svelte/internal/server';
import { alertVariants } from "./index.js";
import { cn } from "$lib/utils/styles.js";

export default function Alert($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			variant = "note",
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn(alertVariants({ variant }), className)),
			...restProps,
			role: 'alert'
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}
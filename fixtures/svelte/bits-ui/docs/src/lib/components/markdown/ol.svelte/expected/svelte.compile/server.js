import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Ol($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<ol${$.attributes({
			class: $.clsx(cn("my-6 ml-6 list-decimal", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ol>`);
	});
}
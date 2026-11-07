import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";

export default function Ul($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<ul${$.attributes({
			class: $.clsx(cn("my-4 ml-6 list-disc", className)),
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></ul>`);
	});
}
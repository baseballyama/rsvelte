import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Li($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<li${$.attributes({ class: $.clsx(cn(className)), ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></li>`);
	});
}
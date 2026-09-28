import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Emoji_picker_viewport($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<div${$.attributes({
			...rest,
			class: $.clsx(cn('border-border rounded-md border', className))
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}
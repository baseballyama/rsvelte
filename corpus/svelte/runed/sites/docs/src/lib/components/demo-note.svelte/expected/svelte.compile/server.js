import * as $ from 'svelte/internal/server';

export default function Demo_note($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<div class="text-muted-foreground flex flex-col gap-1.5 text-center text-xs md:text-right">`);
	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}
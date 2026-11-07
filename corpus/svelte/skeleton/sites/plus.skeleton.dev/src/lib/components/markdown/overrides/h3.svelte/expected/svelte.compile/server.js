import * as $ from 'svelte/internal/server';

export default function H3($$renderer, $$props) {
	const { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<h3${$.attributes({ class: 'h3', ...rest })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></h3>`);
}
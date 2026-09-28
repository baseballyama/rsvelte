import * as $ from 'svelte/internal/server';

export default function H2($$renderer, $$props) {
	const { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<h2${$.attributes({ class: 'h2', ...rest })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></h2>`);
}
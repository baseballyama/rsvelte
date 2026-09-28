import * as $ from 'svelte/internal/server';

export default function H1($$renderer, $$props) {
	const { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<h1${$.attributes({ class: 'h1', ...rest })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></h1>`);
}
import * as $ from 'svelte/internal/server';

export default function Button($$renderer, $$props) {
	const { children, $$slots, $$events, ...props } = $$props;

	$$renderer.push(`<button${$.attributes({ ...props })}>`);
	children($$renderer);
	$$renderer.push(`<!----></button>`);
}
import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	const { children, $$slots, $$events, ...props } = $$props;

	$$renderer.push(`<div${$.attributes({ ...props })}>`);
	children($$renderer);
	$$renderer.push(`<!----></div>`);
}
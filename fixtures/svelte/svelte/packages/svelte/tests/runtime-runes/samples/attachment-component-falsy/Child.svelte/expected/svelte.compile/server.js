import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	$$renderer.push(`<div${$.attributes({ ...props })}></div>`);
}
import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	let { foo, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<button${$.attributes({ foo, ...rest })}>click me</button>`);
}
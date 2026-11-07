import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	$$renderer.push(`<p${$.attributes({ ...props })}>hello</p>`);
}
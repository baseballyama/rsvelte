import * as $ from 'svelte/internal/server';

export default function Button($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	$$renderer.push(`<button${$.attributes({ ...props })}><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></button>`);
}
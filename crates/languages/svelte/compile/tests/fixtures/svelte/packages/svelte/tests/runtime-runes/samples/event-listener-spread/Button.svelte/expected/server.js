import * as $ from 'svelte/internal/server';

export default function Button($$renderer, $$props) {
	let { $$slots, $$events, ...stuff } = $$props;

	$$renderer.push(`<button${$.attributes({ ...stuff })}><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></button>`);
}
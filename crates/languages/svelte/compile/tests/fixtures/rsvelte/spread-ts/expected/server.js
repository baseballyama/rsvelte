import * as $ from 'svelte/internal/server';

export default function Spread_ts($$renderer, $$props) {
	let { href, $$slots, $$events, ...rest } = $$props;
	const wrong = { tabindex: 'first' };
	$$renderer.push(`<a${$.attributes({ href, ...rest })}>link</a> <a${$.attributes({ ...wrong })}>bad tabindex</a>`);
}

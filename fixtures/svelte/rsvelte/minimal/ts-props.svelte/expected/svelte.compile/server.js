import * as $ from 'svelte/internal/server';

export default function Ts_props($$renderer, $$props) {
	let { name, count = 0 } = $$props;
	const shout = (s) => s.toUpperCase();

	$$renderer.push(`<p>${$.escape(shout(name))} has ${$.escape(count)}</p>`);
}
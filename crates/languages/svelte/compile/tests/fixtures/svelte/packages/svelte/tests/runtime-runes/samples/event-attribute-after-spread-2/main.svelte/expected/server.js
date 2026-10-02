import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const props = {};
	let changed = '';

	$$renderer.push(`<div${$.attributes({ ...props })}>${$.escape(changed)}</div>`);
}
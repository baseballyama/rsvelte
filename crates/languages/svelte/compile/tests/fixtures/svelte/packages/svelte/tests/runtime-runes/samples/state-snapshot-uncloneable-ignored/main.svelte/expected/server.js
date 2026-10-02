import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let arr = { test: () => {} };

	// svelte-ignore state_snapshot_uncloneable
	$.snapshot(arr);

	$$renderer.push(`<div${$.attributes({ ...$.snapshot(arr) })}>a</div>`);
}
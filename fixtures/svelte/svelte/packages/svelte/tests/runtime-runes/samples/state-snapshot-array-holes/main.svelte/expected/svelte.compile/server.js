import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let arr = [];

	arr[5] = true;

	let state = [];

	state[5] = true;
	$$renderer.push(`<div>${$.escape(2 in $.snapshot(state))}</div> <div>${$.escape(5 in $.snapshot(state))}</div>`);
}
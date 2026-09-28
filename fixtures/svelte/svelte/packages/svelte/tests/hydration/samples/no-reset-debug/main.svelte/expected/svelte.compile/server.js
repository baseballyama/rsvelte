import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let test = 42;

	$$renderer.push(`<div>`);
	console.log({ test });

	debugger;

	$$renderer.push(`<span>something</span></div>`);
}
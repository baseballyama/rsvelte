import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let elem = void 0;
	let nodeName = $.derived(() => elem?.nodeName);

	$$renderer.push(`<div>${$.escape(nodeName())}</div>`);
}
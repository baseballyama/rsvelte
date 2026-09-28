import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let items = [{ a: 0 }];
	let start = items;

	$$renderer.push(`<!---->${$.escape(JSON.stringify(start))} <button>${$.escape(JSON.stringify(structuredClone($.snapshot(items))))}</button>`);
}
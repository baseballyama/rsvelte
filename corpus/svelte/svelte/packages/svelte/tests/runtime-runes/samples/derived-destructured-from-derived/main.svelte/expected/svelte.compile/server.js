import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let name = 'foo';
	const foo = $.derived(() => name);
	const length = $.derived(() => foo().length);

	$$renderer.push(`<button>${$.escape(length())}</button>`);
}
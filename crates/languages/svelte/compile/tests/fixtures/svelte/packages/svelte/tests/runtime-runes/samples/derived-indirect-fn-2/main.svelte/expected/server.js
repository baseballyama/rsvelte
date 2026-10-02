import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;
	const doubled = () => count * 2;
	const inc = () => count++;
	let double = $.derived(doubled);

	$$renderer.push(`<button>${$.escape(double())}</button>`);
}
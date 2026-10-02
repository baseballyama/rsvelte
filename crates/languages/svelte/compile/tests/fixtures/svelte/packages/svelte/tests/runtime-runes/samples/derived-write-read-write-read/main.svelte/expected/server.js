import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let x = 1;
	let y = 1;
	let z = $.derived(() => x * y);

	$$renderer.push(`<button>${$.escape(// reading a derived value and then setting another source contributing to the derived
	// resulting in the same value should not prevent pending render effects from updating
	z())}</button>`);
}
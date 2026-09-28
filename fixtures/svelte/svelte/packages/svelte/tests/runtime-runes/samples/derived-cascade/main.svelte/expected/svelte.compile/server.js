import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let shouldShow01 = false;
	let der1 = $.derived(() => shouldShow01);

	// der2 must depend on der1 and its output shouldn't change
	let der2 = $.derived(() => typeof der1() === "string");

	let der3 = $.derived(() => der2() ? "1" : "0");

	// der3 must be read before der1
	let der4 = $.derived(() => der3() + (der1() ? "1" : "0"));

	$$renderer.push(`<button>${$.escape(der4())}</button>`);
}
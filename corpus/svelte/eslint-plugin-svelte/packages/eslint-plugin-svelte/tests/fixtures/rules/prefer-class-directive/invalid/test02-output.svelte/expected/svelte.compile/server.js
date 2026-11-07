import * as $ from 'svelte/internal/server';

export default function Test02_output($$renderer) {
	let a = true;
	let b = true;
	let c = true;
	let d = true;

	$$renderer.push(`<button${$.attr_class(' a   d', void 0, { 'c': c, 'no-c': !c })}>foo</button>`);
}
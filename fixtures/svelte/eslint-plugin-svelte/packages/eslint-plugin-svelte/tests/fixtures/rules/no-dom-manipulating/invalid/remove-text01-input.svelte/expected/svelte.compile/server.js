import * as $ from 'svelte/internal/server';

export default function Remove_text01_input($$renderer) {
	let div;
	let show;

	// ✓ GOOD
	const toggle = () => show = !show;

	// ✗ BAD
	const update = () => div.textContent = 'foo';

	$$renderer.push(`<div>`);

	if (show) {
		$$renderer.push(`<!--[0-->div`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></div> <button>Click Me (Good)</button> <button>Click Me (Bad)</button>`);
}
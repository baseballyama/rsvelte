import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let cond = true;

	$$renderer.push(`<p>start</p> pre123 `);

	if (cond) {
		$$renderer.push(`<!--[0-->mid`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
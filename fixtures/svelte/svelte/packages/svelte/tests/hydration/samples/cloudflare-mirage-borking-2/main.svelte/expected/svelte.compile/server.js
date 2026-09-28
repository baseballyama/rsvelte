import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const cond = true;

	$$renderer.push(`<p>start</p>`);

	if (cond) {
		$$renderer.push(`<!--[0--><p>cond</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
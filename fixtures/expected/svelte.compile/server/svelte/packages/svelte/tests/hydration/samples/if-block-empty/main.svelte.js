import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let foo = typeof window === 'undefined' ? '' : 'x';

	if (true) {
		$$renderer.push(`<!--[0-->${$.escape(foo)}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
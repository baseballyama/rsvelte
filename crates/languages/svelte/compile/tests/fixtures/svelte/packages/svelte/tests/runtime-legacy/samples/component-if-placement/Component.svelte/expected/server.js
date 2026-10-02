import * as $ from 'svelte/internal/server';

export default function Component($$renderer) {
	if (true) {
		$$renderer.push(`<!--[0--><span>Component</span>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
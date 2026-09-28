import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (porridge.temperature > 100) {
		$$renderer.push(`<!--[0--><p>too hot!</p>`);
	} else if (80 > porridge.temperature) {
		$$renderer.push(`<!--[1--><p>too cold!</p>`);
	} else {
		$$renderer.push(`<!--[-1--><p>just right!</p>`);
	}

	$$renderer.push(`<!--]-->`);
}
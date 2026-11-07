import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (depth > 1) {
		$$renderer.push('<!--[0-->');
		Input($$renderer, { depth: depth - 1 });
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
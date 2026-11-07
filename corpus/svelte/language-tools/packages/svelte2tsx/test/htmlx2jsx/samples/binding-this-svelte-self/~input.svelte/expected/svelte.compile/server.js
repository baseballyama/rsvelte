import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (false) {
		$$renderer.push('<!--[0-->');
		Input($$renderer, {});
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
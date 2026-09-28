import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	if (false) {
		$$renderer.push('<!--[0-->');
		Output($$renderer, {});
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
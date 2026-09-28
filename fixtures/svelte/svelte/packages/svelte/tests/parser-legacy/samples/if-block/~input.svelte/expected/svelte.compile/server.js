import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (foo) {
		$$renderer.push(`<!--[0-->bar`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
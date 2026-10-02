import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (true) {
		$$renderer.push(`<!--[0-->${$.escape(function foo() {})}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
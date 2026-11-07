import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	if (name == "world") {
		$$renderer.push(`<!--[0--><h1>Hello ${$.escape(name)}</h1>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
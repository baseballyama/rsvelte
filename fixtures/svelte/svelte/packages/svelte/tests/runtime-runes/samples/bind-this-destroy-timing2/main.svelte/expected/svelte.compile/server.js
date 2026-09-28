import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = 'hello';
	let elements = {};

	if (value) {
		$$renderer.push(`<!--[0--><span>${$.escape(value)}</span>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <button>clear</button>`);
}
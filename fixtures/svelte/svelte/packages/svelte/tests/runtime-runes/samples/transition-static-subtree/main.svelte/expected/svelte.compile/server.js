import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function fade(_) {
		return { duration: 500, css: (t) => `opacity: ${t}` };
	}

	let visible = true;

	$$renderer.push(`<button>Toggle</button> `);

	if (visible) {
		$$renderer.push(`<!--[0--><div><span>123</span></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
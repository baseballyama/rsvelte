import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function fade(node) {
		return {
			delay: 100,
			duration: 100,
			tick: (t) => node.style.opacity = t
		};
	}

	let visible = false;

	$$renderer.push(`<button>toggle</button> `);

	if (visible) {
		$$renderer.push(`<!--[0--><p>delayed fade</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
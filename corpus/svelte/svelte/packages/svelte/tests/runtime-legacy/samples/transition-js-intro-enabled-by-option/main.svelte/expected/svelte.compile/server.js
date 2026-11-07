import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function foo(node, params) {
		return {
			duration: 100,
			tick: (t) => {
				node.foo = t;
			}
		};
	}

	$$renderer.push(`<div></div>`);
}
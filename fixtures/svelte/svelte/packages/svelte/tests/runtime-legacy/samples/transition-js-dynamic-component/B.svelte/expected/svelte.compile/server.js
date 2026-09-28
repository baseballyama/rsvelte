import * as $ from 'svelte/internal/server';

export default function B($$renderer) {
	function b(node, params) {
		return {
			duration: 100,
			tick: (t) => {
				node.b = t;
			}
		};
	}

	$$renderer.push(`<div>b</div>`);
}
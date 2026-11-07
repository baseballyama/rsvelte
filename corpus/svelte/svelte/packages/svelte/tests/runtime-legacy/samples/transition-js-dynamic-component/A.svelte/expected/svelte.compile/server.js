import * as $ from 'svelte/internal/server';

export default function A($$renderer) {
	function a(node, params) {
		return {
			duration: 100,
			tick: (t) => {
				node.a = t;
			}
		};
	}

	$$renderer.push(`<div>a</div>`);
}
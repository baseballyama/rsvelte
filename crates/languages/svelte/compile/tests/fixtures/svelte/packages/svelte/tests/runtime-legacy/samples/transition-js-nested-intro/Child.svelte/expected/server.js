import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	function foo(node, params) {
		return {
			delay: 50,
			duration: 100,
			tick: (t) => {
				node.foo = t;
			}
		};
	}

	$$renderer.push(`<div><!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]--></div>`);
}
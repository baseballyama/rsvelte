import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	const { visible = true, foo = 1 } = $$props;

	function bar(node, params) {
		node.foo = params;

		return () => ({});
	}

	if (visible) {
		$$renderer.push(`<!--[0--><div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}
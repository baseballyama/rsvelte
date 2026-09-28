import * as $ from 'svelte/internal/server';

export default function Nested($$renderer, $$props) {
	let visible = true;
	let data = 'Foo';

	function show() {
		visible = true;
	}

	function hide() {
		visible = false;
		data = 'Bar';
	}

	function fade(node) {
		return {
			duration: 100,
			tick: (t) => {
				node.foo = t;
			}
		};
	}

	if (visible) {
		$$renderer.push(`<!--[0--><div><!--[-->`);
		$.slot($$renderer, $$props, 'default', { data }, null);
		$$renderer.push(`<!--]--></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { show, hide });
}
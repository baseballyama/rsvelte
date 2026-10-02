import * as $ from 'svelte/internal/server';

export default function _3_snippet_scope_input($$renderer, $$props) {
	let { message = `it's great to see you!` } = $$props;

	function hello($$renderer, name) {
		$$renderer.push(`<p>hello ${$.escape(name)}! ${$.escape(message)}!</p>`);
	}

	hello($$renderer, 'alice');
	$$renderer.push(`<!----> `);
	hello($$renderer, 'bob');
	$$renderer.push(`<!---->`);
}
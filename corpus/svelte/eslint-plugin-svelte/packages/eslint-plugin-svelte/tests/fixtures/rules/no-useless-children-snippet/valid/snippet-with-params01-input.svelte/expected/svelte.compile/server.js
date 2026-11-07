import * as $ from 'svelte/internal/server';

export default function Snippet_with_params01_input($$renderer) {
	{
		function children($$renderer, val) {
			$$renderer.push(`<!---->Hello ${$.escape(val)}`);
		}

		Foo($$renderer, { children, $$slots: { default: true } });
	}
}
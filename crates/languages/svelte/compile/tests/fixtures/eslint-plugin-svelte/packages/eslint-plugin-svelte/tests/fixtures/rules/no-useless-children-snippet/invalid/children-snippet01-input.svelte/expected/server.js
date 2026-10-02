import * as $ from 'svelte/internal/server';

export default function Children_snippet01_input($$renderer) {
	{
		function children($$renderer) {
			$$renderer.push(`<!---->Hello`);
		}

		Foo($$renderer, { children, $$slots: { default: true } });
	}
}
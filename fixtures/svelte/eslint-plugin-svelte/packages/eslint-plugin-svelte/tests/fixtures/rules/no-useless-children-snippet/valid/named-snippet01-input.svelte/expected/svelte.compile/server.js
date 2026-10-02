import * as $ from 'svelte/internal/server';

export default function Named_snippet01_input($$renderer) {
	{
		function bar($$renderer) {
			$$renderer.push(`<!---->Hello`);
		}

		Foo($$renderer, { bar, $$slots: { bar: true } });
	}
}
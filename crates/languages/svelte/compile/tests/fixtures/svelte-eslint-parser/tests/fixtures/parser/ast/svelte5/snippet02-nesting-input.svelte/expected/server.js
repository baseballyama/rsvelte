import * as $ from 'svelte/internal/server';
import Foo from '$lib/foo.svelte';

function foo($$renderer) {
	function bar($$renderer) {
		$$renderer.push(`<!---->Bar`);
	}

	$$renderer.push(`<!---->Foo `);
	bar($$renderer);
	$$renderer.push(`<!---->`);
}

export default function Snippet02_nesting_input($$renderer) {
	Foo($$renderer, { foo });
}
import * as $ from 'svelte/internal/server';
import Counter from './Counter.svelte';

export default function Main($$renderer) {
	{
		function foo($$renderer, n) {
			$$renderer.push(`<p>clicks: ${$.escape(n)}</p>`);
		}

		Counter($$renderer, { foo, $$slots: { foo: true } });
	}
}
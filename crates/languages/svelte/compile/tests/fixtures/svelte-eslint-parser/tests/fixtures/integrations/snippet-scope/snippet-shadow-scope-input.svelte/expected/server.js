import * as $ from 'svelte/internal/server';
import Foo from './Foo.svelte';

function bar($$renderer, arg) {
	$$renderer.push(`<p>${$.escape(arg)}</p>`);
}

export default function Snippet_shadow_scope_input($$renderer) {
	function children($$renderer) {
		$$renderer.push(`<th>fruit</th> <th>qty</th> <th>price</th> <th>total</th>`);
	}

	$$renderer.push(`<div></div> `);

	{
		function children($$renderer, arg) {
			$$renderer.push(`<p>${$.escape(arg)}</p>`);
		}

		function c($$renderer) {
			{
				function children($$renderer, arg) {
					$$renderer.push(`<p>${$.escape(arg)}</p>`);
				}

				Foo($$renderer, { children, $$slots: { default: true } });
			}
		}

		Foo($$renderer, { children, c, $$slots: { default: true, c: true } });
	}

	$$renderer.push(`<!---->  `);

	{
		function c($$renderer) {
			function bar($$renderer, arg) {
				$$renderer.push(`<p>${$.escape(arg)}</p>`);
			}

			Foo($$renderer, { children: bar });
		}

		Foo($$renderer, { children: bar, c, $$slots: { c: true } });
	}

	$$renderer.push(`<!---->`);
}
import * as $ from 'svelte/internal/server';
import SnippetParent from "./SnippetParent.svelte";

export default function Input($$renderer) {
	{
		function foo($$renderer, a) {
			$$renderer.push(`<!---->${$.escape(a === 'b')}`);
		}

		SnippetParent($$renderer, {
			foo,
			children: ($$renderer) => {
				foo($$renderer, '');
			},
			$$slots: { foo: true, default: true }
		});
	}
}
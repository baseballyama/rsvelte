import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { snippets, snippet, optional } = $$props;

		function getOptional() {
			return optional;
		}

		snippets[snippet]($$renderer);
		$$renderer.push(`<!----> <hr/> `);
		snippets?.[snippet]?.($$renderer);
		$$renderer.push(`<!----> <hr/> `);
		snippets.foo($$renderer);
		$$renderer.push(`<!----> <hr/> `);
		snippets?.foo?.($$renderer);
		$$renderer.push(`<!----> <hr/> `);
		snippets?.foo?.($$renderer);
		$$renderer.push(`<!----> <hr/> `);
		snippets.foo?.($$renderer);
		$$renderer.push(`<!----> <hr/> `);
		(optional ?? snippets.bar)($$renderer);
		$$renderer.push(`<!----> <hr/> `);
		optional?.($$renderer);
		$$renderer.push(`<!----> <hr/> `);
		getOptional()?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}
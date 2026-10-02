import * as $ from 'svelte/internal/server';

export default function Class01_input($$renderer) {
	$$renderer.push(`<!---->${$.escape(class A {})} <input${$.attr_class(`${$.stringify(class B {})} a`)}/>`);
}
import * as $ from 'svelte/internal/server';

export default function Template_literal_attribute_input($$renderer) {
	let foo = 'foo';
	let bar = 'bar';

	Foo($$renderer, { attr: `prefix${foo}` });
	$$renderer.push(`<!----> <div${$.attr('data-text', `prefix${foo}${bar}`)}></div> `);
	Foo($$renderer, { attr: `prefix${foo}` });
	$$renderer.push(`<!---->`);
}
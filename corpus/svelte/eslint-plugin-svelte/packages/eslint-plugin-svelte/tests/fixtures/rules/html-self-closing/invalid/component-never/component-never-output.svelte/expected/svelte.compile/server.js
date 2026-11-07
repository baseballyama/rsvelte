import * as $ from 'svelte/internal/server';

export default function Component_never_output($$renderer) {
	$$renderer.push(`<div>`);
	CustomElement($$renderer, {});
	$$renderer.push(`<!----> `);
	I.Am.A.Foo($$renderer, {});
	$$renderer.push(`<!----></div>`);
}
import * as $ from 'svelte/internal/server';

export default function Test_input($$renderer) {
	Custom($$renderer, { foo: 'bar' });
	$$renderer.push(`<!----> `);
	Custom($$renderer, { foo: 'bar' });
	$$renderer.push(`<!----> `);
	Custom($$renderer, { foo: 'bar' });
	$$renderer.push(`<!---->`);
}
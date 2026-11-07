import * as $ from 'svelte/internal/server';
import C from './C.svelte';

export default function Output($$renderer) {
	C($$renderer, { foo: 'bar' });
	$$renderer.push(`<!----> `);

	C($$renderer, {
		foo: 'bar',
		children: ($$renderer) => {
			$$renderer.push(`<span>Hello World</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}
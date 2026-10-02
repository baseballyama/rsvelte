import * as $ from 'svelte/internal/server';
import Component from './untyped-ts.svelte';

export default function Input($$renderer) {
	Component($$renderer, { typedAsAny: undefined, untyped: undefined });
	$$renderer.push(`<!----> `);
	Component($$renderer, { typedAsAny: null, untyped: null });
	$$renderer.push(`<!----> `);
	Component($$renderer, { typedAsAny: true, untyped: true });
	$$renderer.push(`<!----> `);
	Component($$renderer, { typedAsAny: 123, untyped: 123 });
	$$renderer.push(`<!----> `);
	Component($$renderer, { typedAsAny: 'string', untyped: 'string' });
	$$renderer.push(`<!----> `);
	Component($$renderer, { typedAsAny: { some: 'object' }, untyped: { some: 'object' } });
	$$renderer.push(`<!----> `);

	Component($$renderer, {
		typedAsAny: ['string', 'array'],
		untyped: ['string', 'array']
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		typedAsAny: ['array', 123, false],
		untyped: ['array', 123, false]
	});

	$$renderer.push(`<!----> `);

	Component($$renderer, {
		typedAsAny: ['array', 123, false],
		untyped: ['array', 123, false]
	});

	$$renderer.push(`<!---->`);
}
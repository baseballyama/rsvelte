import * as $ from 'svelte/internal/server';
import { Inspect, Panel } from '@components';
import _Inspect from 'svelte-inspect-value';

export default function GettingStarted($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = {
			id: undefined,
			firstName: 'Bob',
			lastName: 'Alice',
			email: 'bob@alice.lol',
			introduction: `The name is Alice.

    Bob Alice.`,
			birthDate: new Date(),
			website: new URL('https://alicebob.website/?ref=abcdefg#about'),
			age: -42,
			emailVerified: true,
			interests: ['radio', 'tv', 'internet', 'kayaks']
		};

		const InspectValues = _Inspect.Values.withOptions(() => ({
			elementAttributes: { style: 'width: 400px;', class: 'mt not-content' },
			expandLevel: 0
		}));

		$$renderer.push(`<div id="getting-started" class="not-content svelte-1vj4tnr"><code id="panel-hint" class="svelte-1vj4tnr">Inspect.Panel 👉</code> <code class="svelte-1vj4tnr">Inspect</code> `);
		Inspect($$renderer, { value, style: 'max-width: 400px' });
		$$renderer.push(`<!----> <code class="svelte-1vj4tnr">Inspect.Values</code> `);
		InspectValues($$renderer, $.spread_props([value]));
		$$renderer.push(`<!----> `);
		Panel($$renderer, { expandLevel: 0, values: value, style: 'position:absolute' });
		$$renderer.push(`<!----></div>`);
	});
}
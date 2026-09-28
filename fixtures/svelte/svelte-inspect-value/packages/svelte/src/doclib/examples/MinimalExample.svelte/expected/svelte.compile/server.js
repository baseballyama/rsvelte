import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';

export default function MinimalExample($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;

		let demoObject = {
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

		Inspect($$renderer, $.spread_props([
			{ value: demoObject, name: 'demo', style: 'max-width: 500px;' },
			props
		]));
	});
}
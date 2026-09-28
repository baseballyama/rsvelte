import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function MinimalExample($$anchor, $$props) {
	$.push($$props, true);

	let props = $.rest_props($$props, rest_excludes);

	let demoObject = $.proxy({
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
	});

	Inspect($$anchor, $.spread_props(
		{
			get value() {
				return demoObject;
			},
			name: 'demo',
			style: 'max-width: 500px;'
		},
		() => props
	));

	$.pop();
}
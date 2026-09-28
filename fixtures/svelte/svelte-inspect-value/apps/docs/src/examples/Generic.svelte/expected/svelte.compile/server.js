import * as $ from 'svelte/internal/server';
import Inspect from '@components/Inspect.svelte';
import { globalOpts } from '@components/global-opts/globalopts.svelte.js';

export default function Generic($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { seeFlashing = false, $$slots, $$events, ...props } = $$props;

		const allTypesSearch = $.derived(() => {
			if (globalOpts?.search === false) {
				return 'highlight';
			}

			return globalOpts?.search ?? undefined;
		});

		let values = {
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
			interests: ['radio', 'tv', 'internet', 'kayaks'],
			nilVals: [undefined, null, NaN, Infinity],
			get interestList() {
				return this.interests.join('\n');
			},

			doStuff() {
				if (this.emailVerified) {
					return this.email;
				} else {
					throw 'can not do stuff if email not verified';
				}
			}
		};

		{
			function heading($$renderer, collapsed) {
				if (!collapsed) {
					$$renderer.push(`<!--[0--><label class="svelte-egb075">increment number <input type="checkbox"${$.attr('checked', seeFlashing, true)}/></label>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			Inspect($$renderer, $.spread_props([
				{ class: 'not-content mt' },
				props,
				{
					values,
					search: allTypesSearch(),
					expandLevel: 0,
					heading,
					$$slots: { heading: true }
				}
			]));
		}

		$.bind_props($$props, { seeFlashing });
	});
}
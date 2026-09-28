import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { Inspect } from '@components';

export default function Narrowing($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import { onMount } from 'svelte'
		let ins = void 0;

		let search = 'highlight';
		let highlightMatches = true;

		const value = {
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

		onMount(() => {
			if (ins) {
				ins.search('value:"radio" key:name type:bool');
			}
		});

		$$renderer.push(`<div class="search-example svelte-ifv3rm">`);

		Inspect($$renderer, {
			values: value,
			expandLevel: 0,
			heading: 'Search Demo',
			searchMode: 'or',
			search,
			highlightMatches,
			class: 'not-content',
			style: 'margin-top: 0 !important;'
		});

		$$renderer.push(`<!----> <div class="not-content input-row svelte-ifv3rm"><label>Search mode `);

		$$renderer.select({ value: search }, ($$renderer) => {
			$$renderer.option({}, ($$renderer) => {
				$$renderer.push(`highlight`);
			});

			$$renderer.option({}, ($$renderer) => {
				$$renderer.push(`filter`);
			});

			$$renderer.option({}, ($$renderer) => {
				$$renderer.push(`filter-strict`);
			});
		});

		$$renderer.push(`</label> <label>Highlight matches <input type="checkbox"${$.attr('checked', highlightMatches, true)}/></label></div></div>`);
	});
}
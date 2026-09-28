import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';
import { getContext } from 'svelte';

export default function Classes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Greeter {
			static staticProperty = 'HI';

			static get something() {
				return 'something';
			}

			iHaveAProperty = 'hello';
			name;

			constructor(name) {
				this.name = name;
			}

			// eslint-disable-next-line no-console
			greet = () => console.log(`${Greeter.staticProperty} ${this.name}`);

			method() {
				return 'hei';
			}

			toString() {
				return 'nonononono';
			}
		}

		getContext('toc')?.set('Classes', 'classes');
		$$renderer.push(`<div class="flex col"><h3 id="classes">Classes</h3> <p>Display "static" properties of classes</p> `);

		if (Inspect.Values.Expand0) {
			$$renderer.push('<!--[-->');
			Inspect.Values.Expand0($$renderer, $.spread_props([{ class: Greeter, classInstance: new Greeter('world') }]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}
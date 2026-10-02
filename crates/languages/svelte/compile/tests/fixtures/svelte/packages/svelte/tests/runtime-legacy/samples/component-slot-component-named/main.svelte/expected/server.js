import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';
import Foo from './Foo.svelte';
import Bar from './Bar.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Hello`);
		},

		$$slots: {
			default: true,
			foo: ($$renderer) => {
				Foo($$renderer, { slot: 'foo' });
			},

			bar: ($$renderer) => {
				Bar($$renderer, { slot: 'bar' });
			}
		}
	});
}
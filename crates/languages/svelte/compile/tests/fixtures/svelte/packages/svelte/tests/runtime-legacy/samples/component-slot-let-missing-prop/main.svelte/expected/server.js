import * as $ from 'svelte/internal/server';
import Foo from './Foo.svelte';
import Bar from './Bar.svelte';

export default function Main($$renderer) {
	const things = { '1': 'one' };

	Foo($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { id }) => {
				Bar($$renderer, { thing: things[id] });
			}
		}
	});
}
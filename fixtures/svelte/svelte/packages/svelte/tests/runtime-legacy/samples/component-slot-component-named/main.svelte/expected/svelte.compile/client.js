import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';
import Foo from './Foo.svelte';
import Bar from './Bar.svelte';

export default function Main($$anchor) {
	Nested($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Hello');

			$.append($$anchor, text);
		},

		$$slots: {
			default: true,
			foo: ($$anchor, $$slotProps) => {
				Foo($$anchor, { slot: 'foo' });
			},

			bar: ($$anchor, $$slotProps) => {
				Bar($$anchor, { slot: 'bar' });
			}
		}
	});
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from './Foo.svelte';
import Bar from './Bar.svelte';

export default function Main($$anchor) {
	const things = { '1': 'one' };

	Foo($$anchor, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Bar($$anchor, {
					get thing() {
						return things[$.get(id)];
					}
				});
			}
		}
	});
}
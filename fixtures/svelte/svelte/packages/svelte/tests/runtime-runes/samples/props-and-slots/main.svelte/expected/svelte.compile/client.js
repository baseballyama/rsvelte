import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<div slot="foo">foo</div>`);

export default function Main($$anchor) {
	Child($$anchor, {
		a: 'b',
		$$slots: {
			foo: ($$anchor, $$slotProps) => {
				var div = root();

				$.append($$anchor, div);
			}
		}
	});
}
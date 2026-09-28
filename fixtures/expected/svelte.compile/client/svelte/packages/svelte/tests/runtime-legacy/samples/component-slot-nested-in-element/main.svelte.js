import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import One from './One.svelte';

var root = $.from_html(`<div slot="a">a</div>`);

export default function Main($$anchor) {
	One($$anchor, {
		$$slots: {
			a: ($$anchor, $$slotProps) => {
				var div = root();

				$.append($$anchor, div);
			}
		}
	});
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<div class="a svelte-na6urp">a</div> <div class="c svelte-na6urp">c</div>`, 1);
var root_1 = $.from_html(`<div class="b" slot="wut">b</div>`);

export default function Input($$anchor) {
	Child($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			wut: ($$anchor, $$slotProps) => {
				var div = root_1();

				$.append($$anchor, div);
			}
		}
	});
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="b svelte-611nr7" slot="a"></div>`);
var root_1 = $.from_html(`<div class="c" slot="b"><div class="d svelte-611nr7"></div> <div class="e svelte-611nr7"></div></div>`);
var root_2 = $.from_html(`<div class="f svelte-611nr7" slot="c"></div>`);
var root_3 = $.from_html(`<div class="a svelte-611nr7"></div> <!> <div class="g svelte-611nr7"></div>`, 1);

export default function Input($$anchor) {
	let App;
	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 2);

	App(node, {
		$$slots: {
			a: ($$anchor, $$slotProps) => {
				var div = root();

				$.append($$anchor, div);
			},

			b: ($$anchor, $$slotProps) => {
				var div_1 = root_1();

				$.append($$anchor, div_1);
			},

			c: ($$anchor, $$slotProps) => {
				var div_2 = root_2();

				$.append($$anchor, div_2);
			}
		}
	});

	$.next(2);
	$.append($$anchor, fragment);
}
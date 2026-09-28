import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="b svelte-jiw1g0" slot="a"></div>`);
var root_1 = $.from_html(`<div class="c svelte-jiw1g0" slot="b"><div class="d svelte-jiw1g0"></div> <div class="e svelte-jiw1g0"></div></div>`);
var root_2 = $.from_html(`<div class="a svelte-jiw1g0"></div> <!> <div class="f svelte-jiw1g0"></div>`, 1);

export default function Input($$anchor) {
	let App;
	var fragment = root_2();
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
			}
		}
	});

	$.next(2);
	$.append($$anchor, fragment);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";
import Sub from "./sub.svelte";

var root = $.from_html(`<button>main</button>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root_1();

	$.event('click', $.window, () => console.log('window main'));
	$.event('click', $.document, () => console.log('document main'));

	var node = $.first_child(fragment);

	Component(node, {
		$$events: {
			click: [
				() => console.log('div main 1'),
				() => console.log('div main 2')
			]
		},

		children: ($$anchor, $$slotProps) => {
			var button = root();

			$.delegated('click', button, () => console.log('button main'));
			$.append($$anchor, button);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Sub(node_1, {});
	$.append($$anchor, fragment);
}

$.delegate(['click']);
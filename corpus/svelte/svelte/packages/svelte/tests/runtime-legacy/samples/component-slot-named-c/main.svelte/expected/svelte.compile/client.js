import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<span slot="name">Hello</span>`);
var root_1 = $.from_html(`<span slot="name">world</span>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	Nested(node, {
		$$slots: {
			name: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});

	var node_1 = $.sibling(node, 2);

	Nested(node_1, {
		$$slots: {
			name: ($$anchor, $$slotProps) => {
				var span_1 = root_1();

				$.append($$anchor, span_1);
			}
		}
	});

	$.append($$anchor, fragment);
}
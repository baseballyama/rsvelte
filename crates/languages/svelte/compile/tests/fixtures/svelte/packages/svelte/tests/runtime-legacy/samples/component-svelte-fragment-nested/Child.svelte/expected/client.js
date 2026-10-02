import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Child($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	Nested(node, {
		$$slots: {
			name: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.slot(node_1, $$props, 'default', {}, null);
				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_2 = $.sibling(node, 2);

	Nested(node_2, {
		$$slots: {
			name: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.slot(node_3, $$props, 'b', {}, null);
				$.append($$anchor, fragment_2);
			}
		}
	});

	$.append($$anchor, fragment);
}
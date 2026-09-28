import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pane, Splitpanes } from 'svelte-splitpanes';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<h1>Welcome to Svelte-Splitpanes Minimal Demo!</h1> <p>Visit <a></a> to read the documentation and for more examples.</p> <!>`, 1);

export default function _page($$anchor) {
	const url = 'https://orefalo.github.io/svelte-splitpanes/';
	var fragment = root_1();
	var p = $.sibling($.first_child(fragment), 2);
	var a = $.sibling($.child(p));

	$.set_attribute(a, 'href', url);
	a.textContent = 'https://orefalo.github.io/svelte-splitpanes/';
	$.next();
	$.reset(p);

	var node = $.sibling(p, 2);

	Splitpanes(node, {
		style: 'height: 400px;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Pane(node_1, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('First Pane');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Pane(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Second Pane');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
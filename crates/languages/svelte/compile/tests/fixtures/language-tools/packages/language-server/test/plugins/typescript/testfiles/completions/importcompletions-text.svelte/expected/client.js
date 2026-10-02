import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(
	`a <div>a
a</div> <div></div> <!> <!>`,
	1
);

export default function Importcompletions_text($$anchor) {
	let abc = "";

	$.next();

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 5);

	Comp(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('a\na');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Comp(node_1, {});
	$.append($$anchor, fragment);
}
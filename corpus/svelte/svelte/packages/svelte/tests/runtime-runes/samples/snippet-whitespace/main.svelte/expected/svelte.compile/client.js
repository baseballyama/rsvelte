import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Pre from "./pre.svelte";

const snip = ($$anchor) => {
	$.next();

	var text = $.text('C');

	$.append($$anchor, text);
};

var root = $.from_html(`A B <!> D <!>`, 1);

export default function Main($$anchor) {
	$.next();

	var fragment = root();
	var node = $.sibling($.first_child(fragment));

	snip(node);

	var node_1 = $.sibling(node, 2);

	Pre(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Testing\n123          ;\n    456');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
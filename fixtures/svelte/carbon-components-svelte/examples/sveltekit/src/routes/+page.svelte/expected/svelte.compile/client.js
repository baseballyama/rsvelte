import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, breakpoints } from "carbon-components-svelte";
import { Airplane } from "carbon-pictograms-svelte";

var root = $.from_html(`<!> <!> `, 1);

export default function _page($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Primary button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Airplane(node_1, {});

	var text_1 = $.sibling(node_1);

	$.template_effect(($0) => $.set_text(text_1, ` ${$0 ?? ''}`), [() => JSON.stringify(breakpoints)]);
	$.append($$anchor, fragment);
}
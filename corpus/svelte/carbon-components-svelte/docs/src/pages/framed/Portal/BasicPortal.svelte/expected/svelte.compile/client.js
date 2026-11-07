import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Portal } from "carbon-components-svelte";

var root = $.from_html(`<div><div>This is rendered inside the div</div> <br/> <!></div>`);

export default function BasicPortal($$anchor) {
	var div = root();
	var node = $.sibling($.child(div), 4);

	Portal(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('This is rendered outside of the div');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}
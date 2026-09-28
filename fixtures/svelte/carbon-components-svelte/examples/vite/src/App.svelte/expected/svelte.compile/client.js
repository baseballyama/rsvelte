import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "carbon-components-svelte/css/white.css";
import { Button, breakpoints } from "carbon-components-svelte";

var root = $.from_html(`<!> `, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

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

	var text_1 = $.sibling(node);

	$.template_effect(() => $.set_text(text_1, ` ${breakpoints.md ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}
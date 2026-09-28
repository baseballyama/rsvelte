import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "@svar-ui/svelte-core";

var root = $.from_html(`<div>Here is a component example</div> <div>Click the button to see the data</div> <!>`, 1);

export default function Overlay($$anchor, $$props) {
	$.push($$props, true);

	function showData() {
		$$props.onaction && $$props.onaction({ action: "overlay-button-click", data: { show: true } });
	}

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	Button(node, {
		type: 'primary',
		onclick: showData,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Show data');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}
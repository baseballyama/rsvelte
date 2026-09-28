import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<span>&nbsp;</span>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Component(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text(' ');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Component(node_1, {
		children: ($$anchor, $$slotProps) => {
			var span = root();

			$.append($$anchor, span);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Component(node_2, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			$.html(node_3, () => "&nbsp;");
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}
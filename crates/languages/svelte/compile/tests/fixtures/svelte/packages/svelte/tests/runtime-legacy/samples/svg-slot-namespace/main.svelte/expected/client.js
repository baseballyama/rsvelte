import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Widget from './Widget.svelte';

var root = $.from_svg(`<line x1="0" y1="0" x2="100" y2="100"></line>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function Main($$anchor) {
	var div = root_1();
	var node = $.child(div);

	Widget(node, {
		children: ($$anchor, $$slotProps) => {
			var line = root();

			$.append($$anchor, line);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}
import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MyClassAdder from './_ClassAdderComponent.svelte';

var root = $.from_html(`<div class="svelte-htnd1v"><!></div>`);

export default function _ClassAdder($$anchor) {
	var div = root();
	var node = $.child(div);

	MyClassAdder(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('I\'m a component with an added class!');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}